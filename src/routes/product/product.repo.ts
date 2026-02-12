import { Prisma } from '@/generated/prisma/client';
import {
  CreateProductBodyType,
  GetProductResponseType,
  GetProductsResponseType,
  UpdateProductBodyType,
} from '@/routes/product/product.type';
import { EnumSortBy, OrderByType, SortByType } from '@/shared/constants/common.constant';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { paginate, translationWhere } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { ProductType } from '@/shared/types/shared-product.type';
import { SkuType } from '@/shared/types/shared-sku.type';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaService>>,
  ) {}

  async findMany({
    page,
    limit,
    name,
    brandIds,
    categories,
    minPrice,
    maxPrice,
    creatorId,
    isPublished,
    orderBy,
    sortBy,
    languageId,
  }: {
    page: number;
    limit: number;
    name?: string;
    brandIds?: number[];
    categories?: number[];
    minPrice?: number;
    maxPrice?: number;
    creatorId?: number;
    isPublished?: boolean;
    orderBy: OrderByType;
    sortBy: SortByType;
    languageId: string;
  }): Promise<GetProductsResponseType> {
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: creatorId ? creatorId : undefined,
      // publishedAt: isPublished ? { lte: new Date(), not: null } : undefined, // lte: less than or equal to, not: null => not null => nghĩa là lấy các product có thời gian publish bé hơn thời gian hiện tại VÀ thời gian publish KHÔNG PHẢI null
    };

    // NOTE: có case isPublished = undefined nên phải check rõ true/false
    // Nếu isPublished = undefined thì lấy tất cả products
    // Nếu isPublished = true thì lấy các products có thời gian publish bé hơn thời gian hiện tại
    // Nếu isPublished = false thì lấy các products có thời gian publish lớn hơn thời gian hiện tại hoặc thời gian publish = null
    if (isPublished === true) {
      where.publishedAt = { lte: new Date(), not: null };
    } else if (isPublished === false) {
      where = {
        ...where,
        OR: [{ publishedAt: { gt: new Date() } }, { publishedAt: null }],
      };
    }

    if (name) {
      // NOTE: contains => chứa, mode: 'insensitive' => không phân biệt hoa thường
      where.name = { contains: name, mode: 'insensitive' };
    }

    // NOTE: vì relation của brand và product là 1-1 nên không cần dùng where.brand = { some: { id: { in: brandIds } } }
    if (brandIds && brandIds.length > 0) {
      where.brandId = { in: brandIds };
    }

    // NOTE: vì relation của category và product là many to many nên dùng where.categories = { some: { id: { in: categories } } }
    if (categories && categories.length > 0) {
      where.categories = { some: { id: { in: categories } } };
    }

    // NOTE: minPrice và maxPrice có thể là 0 nên cần check undefined
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = { gte: minPrice, lte: maxPrice };
    }

    // Mặc định sort theo `createdAt` MỚI NHẤT => sort theo ngày tạo
    let caculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: orderBy, // asc/desc
    };

    if (sortBy === EnumSortBy.PRICE) {
      // sort theo `basePrice` GIÁ (từ thấp đến cao - từ cao đến thấp) dựa vào OrderBy
      caculatedOrderBy = {
        basePrice: orderBy, // asc/desc
      };
    } else if (sortBy === EnumSortBy.SALES) {
      // sort theo `orders._count` BÁN CHẠY => tổng lượt mua (không tính theo lượt mua mỗi tháng)
      caculatedOrderBy = {
        orders: {
          _count: orderBy, // asc/desc
        },
      };
    }

    const productsPromise = this.prismaService.product.findMany({
      where,
      include: {
        productTranslations: {
          where: translationWhere(languageId),
        },
        // NOTE: để lấy được order của product để sort theo sales thì phải join với bảng order
        // VẤN ĐỀ: nếu join thì sẽ tạo ra nhiều query join => tăng độ phức tạp của query => tăng latency => tăng thời gian trả về response
        // đây là api get list product, được gọi thường xuyên nên cần tránh các case join
        // GIẢI PHÁP:
        // - Vì bảng Product có relation với bảng Order thông qua các bảng Product > SKU > ProductSKUSnapshot > Order
        // - nên thay vì join các bảng để lấy ra Order thì tạo relation many to many giữa Product và Order => giải quyết được việc join nhiều bảng => giảm latency => giảm thời gian trả về response
        // skus: {
        //   include: {
        //     productSKUSnapshots: {
        //       include: {
        //         order: {
        //           where: {
        //             deletedAt: null,
        //             status: OrderStatus.DELIVERED,
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
        // THỰC THI GIẢI PHÁP: tạo relation many to many giữa Product và Order
        orders: {
          where: {
            deletedAt: null,
            status: EnumOrderStatus.DELIVERED,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: caculatedOrderBy,
    });

    const totalProductsPromise = this.prismaService.product.count({ where });

    return await paginate(productsPromise, totalProductsPromise, page, limit);
  }

  findById(productId: number): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({
      where: { id: productId, deletedAt: null },
    });
  }

  getDetail({
    productId,
    languageId,
    isPublished, // user => true, admin/seller => false
  }: {
    productId: number;
    languageId: string;
    isPublished?: boolean;
  }): Promise<GetProductResponseType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
      // publishedAt: isPublished ? { lte: new Date(), not: null } : undefined, // lte: less than or equal to, not: null => not null => nghĩa là lấy các product có thời gian publish bé hơn thời gian hiện tại VÀ thời gian publish KHÔNG PHẢI null
    };

    // NOTE: có case isPublished = undefined nên phải check rõ true/false
    // Nếu isPublished = undefined thì lấy product detail
    // Nếu isPublished = true thì lấy product detail có thời gian publish bé hơn thời gian hiện tại
    // Nếu isPublished = false thì lấy product detail có thời gian publish lớn hơn thời gian hiện tại hoặc thời gian publish = null
    if (isPublished === true) {
      where.publishedAt = { lte: new Date(), not: null };
    } else if (isPublished === false) {
      where = {
        ...where,
        OR: [{ publishedAt: { gt: new Date() } }, { publishedAt: null }],
      };
    }

    return this.prismaService.product.findUnique({
      where,
      include: {
        productTranslations: {
          where: translationWhere(languageId),
        },
        skus: {
          where: { deletedAt: null },
        },
        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: {
              where: translationWhere(languageId),
            },
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: translationWhere(languageId),
            },
          },
        },
      },
    });
  }

  create(props: { userId: number; body: CreateProductBodyType }): Promise<GetProductResponseType> {
    const { userId, body } = props;
    const { name, basePrice, virtualPrice, brandId, images, publishedAt, variants, categories, skus } = body;
    return this.prismaService.product.create({
      data: {
        name,
        basePrice,
        virtualPrice,
        brandId,
        images,
        publishedAt,
        variants,
        // Prisma hỗ trợ tạo nhiều dữ liệu trong cùng 1 câu lệnh create
        // Tại sao categories lại dùng connect? Vì categories là 1 mảng id do client gửi lên, nên ta dùng connect để tạo relationship với categories, vì product và category là many to many relationship
        // Khi setup schema many to many thì trong database có 1 bảng trung gian, ví dụ như ở product và category thì prisma sẽ tạo bảng trung gian là _CategoryToProduct, nên dùng connect để tạo relationship với bảng trung gian
        categories: { connect: categories.map((categoryId) => ({ id: categoryId })) },
        // Tại sao skus lại dùng createMany? Vì ta cần tạo skus mới nên khác với connect
        skus: { createMany: { data: skus.map((sku) => ({ ...sku, createdById: userId })) } },
        createdById: userId,
      },
      include: {
        productTranslations: {
          where: { deletedAt: null },
        },
        skus: {
          where: { deletedAt: null },
        },
        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: { where: { deletedAt: null } },
          },
        },
        brand: {
          include: {
            brandTranslations: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  /**
   * Method Update Product hoạt động như sau:
   * 1. SKU đã tồn tại trong database nhưng không có trong body thì sẽ bị xóa.
   * 2. SKU đã tồn tại trong database nhưng có trong body thì sẽ được cập nhật.
   * 3. SKU không tồn tại trong database nhưng có trong body thì sẽ được thêm mới
   */
  // async update2(props: { userId: number; productId: number; body: UpdateProductBodyType }): Promise<ProductType> {
  //   const { userId, productId, body } = props;
  //   const { name, basePrice, virtualPrice, brandId, images, publishedAt, variants, categories, skus } = body;

  //   // 1. Lấy danh sách sku hiện tại trong database
  //   const skusInDatabase = await this.prismaService.sKU.findMany({
  //     where: { productId, deletedAt: null },
  //   });

  //   // 2. Tìm các skus cần xoá (tồn tại trong database nhưng không có trong body)
  //   const skusToDelete = skusInDatabase.filter((skuInDatabase) =>
  //     skus.every((sku) => sku.value !== skuInDatabase.value),
  //   );
  //   const skuIdsToDelete = skusToDelete.map((sku) => sku.id);

  //   // 3. Mapping Id vào trong body skus
  //   const skusWithId = skus.map((sku) => {
  //     const skuInDatabase = skusInDatabase.find((skuInDatabase) => skuInDatabase.value === sku.value);
  //     return {
  //       ...sku,
  //       id: skuInDatabase ? skuInDatabase.id : null,
  //     };
  //   });

  //   // 4. Tìm các skus để cập nhật
  //   const skusToUpdate = skusWithId.filter((sku) => sku.id !== null);

  //   // 5. Tìm các skus để thêm mới
  //   const skusToCreate = skusWithId.filter((sku) => sku.id === null);
  //   const skusDataToCreate = skusToCreate.map((sku) => {
  //     const { id: skuId, ...skuData } = sku;
  //     return {
  //       ...skuData,
  //       productId,
  //       createdById: userId,
  //     };
  //   });

  //   // 6. Cập nhật transaction
  //   const [product] = await this.prismaService.$transaction([
  //     // 6.1. Cập nhật product
  //     this.prismaService.product.update({
  //       where: { id: productId, deletedAt: null },
  //       data: {
  //         name: name,
  //         basePrice: basePrice,
  //         virtualPrice: virtualPrice,
  //         brandId: brandId,
  //         images: images,
  //         publishedAt: publishedAt,
  //         variants: variants,
  //         categories: { set: categories.map((categoryId) => ({ id: categoryId })) },
  //         updatedById: userId,
  //       },
  //     }),
  //     // 6.2. Xoá mềm các sku không có trong body
  //     this.prismaService.sKU.updateMany({
  //       where: { id: { in: skuIdsToDelete }, deletedAt: null },
  //       data: { deletedAt: new Date(), deletedById: userId },
  //     }),
  //     // 6.3. Cập nhật các skus có trong body
  //     ...skusToUpdate.map((sku) =>
  //       this.prismaService.sKU.update({
  //         where: { id: sku.id!, deletedAt: null },
  //         data: {
  //           value: sku.value,
  //           price: sku.price,
  //           stock: sku.stock,
  //           image: sku.image,
  //           updatedById: userId,
  //         },
  //       }),
  //     ),
  //     // 6.4. Thêm mới các skus mới
  //     this.prismaService.sKU.createMany({
  //       data: skusDataToCreate,
  //     }),
  //   ]);
  //   return product;
  // }

  /**
   * update: Phiên bản tối ưu của update2.
   * - categories: dùng `set` thay vì `connect` để ghi đè đúng danh sách category.
   * - SKU: dùng Map/Set cho lookup O(1), tránh O(n×m).
   * - Transaction: chỉ thêm thao tác xóa/cập nhật/tạo SKU khi có dữ liệu.
   */
  // async update(props: { userId: number; productId: number; body: UpdateProductBodyType }): Promise<ProductType> {
  //   const { userId, productId, body } = props;
  //   const { name, basePrice, virtualPrice, brandId, images, publishedAt, variants, categories, skus } = body;

  //   const skusInDatabase = await this.prismaService.sKU.findMany({
  //     where: { productId, deletedAt: null },
  //   });

  //   const skuInDatabaseByValue = new Map(skusInDatabase.map((s) => [s.value, s]));
  //   const bodyValues = new Set(skus.map((s) => s.value));

  //   const skusWithId = skus.map((sku) => ({
  //     ...sku,
  //     id: skuInDatabaseByValue.get(sku.value)?.id ?? null,
  //   }));

  //   const skuIdsToDelete = skusInDatabase.filter((s) => !bodyValues.has(s.value)).map((s) => s.id);
  //   const skusToUpdate = skusWithId.filter((sku): sku is typeof sku & { id: number } => sku.id !== null);
  //   const skusToCreate = skusWithId
  //     .filter((sku) => sku.id === null)
  //     .map(({ id: _id, ...skuData }) => ({
  //       ...skuData,
  //       productId,
  //       createdById: userId,
  //     }));

  //   return this.prismaService.$transaction(async (tx) => {
  //     const product = await tx.product.update({
  //       where: { id: productId, deletedAt: null },
  //       data: {
  //         name,
  //         basePrice,
  //         virtualPrice,
  //         brandId,
  //         images,
  //         publishedAt,
  //         variants,
  //         categories: { set: categories.map((categoryId) => ({ id: categoryId })) },
  //         updatedById: userId,
  //       },
  //     });

  //     if (skuIdsToDelete.length > 0) {
  //       await tx.sKU.updateMany({
  //         where: { id: { in: skuIdsToDelete }, deletedAt: null },
  //         data: { deletedAt: new Date(), deletedById: userId },
  //       });
  //     }

  //     if (skusToUpdate.length > 0) {
  //       await Promise.all(
  //         skusToUpdate.map((sku) =>
  //           tx.sKU.update({
  //             where: { id: sku.id, deletedAt: null },
  //             data: {
  //               value: sku.value,
  //               price: sku.price,
  //               stock: sku.stock,
  //               image: sku.image,
  //               updatedById: userId,
  //             },
  //           }),
  //         ),
  //       );
  //     }

  //     if (skusToCreate.length > 0) {
  //       await tx.sKU.createMany({
  //         data: skusToCreate,
  //       });
  //     }

  //     return product;
  //   });
  // }

  async delete(props: { productId: number; userId: number }, isHardDelete?: boolean): Promise<ProductType> {
    const { productId, userId } = props;
    if (isHardDelete) {
      // NOTE: Không cần xoá kèm sku vì schema đã quy định delete cascade từ product sang sku
      // const [product] = await Promise.all([
      //   await this.prismaService.product.delete({
      //     where: { id: id },
      //   }),
      //   await this.prismaService.sKU.deleteMany({
      //     where: { productId: id },
      //   }),
      // ]);
      const product = await this.prismaService.product.delete({
        where: { id: productId },
      });
      return product;
    }

    const now = new Date();
    const [product] = await Promise.all([
      this.prismaService.product.update({
        where: { id: productId, deletedAt: null },
        data: { deletedAt: now, deletedById: userId },
      }),
      this.prismaService.productTranslation.updateMany({
        where: { productId, deletedAt: null },
        data: { deletedAt: now, deletedById: userId },
      }),
      this.prismaService.sKU.updateMany({
        where: { productId, deletedAt: null },
        data: { deletedAt: now, deletedById: userId },
      }),
    ]);
    return product;
  }

  // các methods cho update product transaction
  findSkusByProductId(productId: number): Promise<SkuType[]> {
    return this.txHost.tx.sKU.findMany({
      where: { productId, deletedAt: null },
    });
  }

  softDeleteSkus({ userId, skuIds }: { userId: number; skuIds: number[] }): Promise<{ count: number }> {
    return this.txHost.tx.sKU.updateMany({
      where: { id: { in: skuIds }, deletedAt: null },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  }

  updateSku({
    userId,
    sku,
  }: {
    userId: number;
    sku: Pick<SkuType, 'id' | 'value' | 'price' | 'stock' | 'image'>;
  }): Promise<SkuType> {
    return this.txHost.tx.sKU.update({
      where: { id: sku.id, deletedAt: null },
      data: {
        value: sku.value,
        price: sku.price,
        stock: sku.stock,
        image: sku.image,
        updatedById: userId,
      },
    });
  }

  createSkus(
    data: ({ productId: number } & Pick<SkuType, 'value' | 'price' | 'stock' | 'image' | 'createdById'>)[],
  ): Promise<{ count: number }> {
    return this.txHost.tx.sKU.createMany({
      data,
    });
  }

  updateProduct({
    productId,
    userId,
    name,
    basePrice,
    virtualPrice,
    brandId,
    images,
    publishedAt,
    variants,
    categories,
  }: Omit<UpdateProductBodyType, 'skus'> & {
    productId: number;
    userId: number;
  }): Promise<ProductType> {
    return this.txHost.tx.product.update({
      where: { id: productId, deletedAt: null },
      data: {
        name,
        basePrice,
        virtualPrice,
        brandId,
        images,
        publishedAt,
        variants,
        categories: { set: categories.map((categoryId) => ({ id: categoryId })) },
        updatedById: userId,
      },
    });
  }
}
