import { BadRequestException, NotFoundException } from '@nestjs/common';

export const OrderNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.OrderNotFound',
  },
]);

// Giả sử admin/seller xoá sản phẩm khi mà user đặt sản phẩm thì throw error
// export const ProductNotFoundException = new NotFoundException([
//   {
//     field: 'id',
//     message: 'Error.ProductNotFound',
//   },
// ]);

// Giả sử user thêm vào giỏ hàng nhưng khi đặt thì sản phẩm đó hết hàng thì throw error
export const SkuOutOfStockException = new BadRequestException([
  {
    field: 'skuId',
    message: 'Error.SkuOutOfStock',
  },
]);

// Giả sử Frontend truyền lên cartItemId không tồn tại thì throw error
export const CartItemNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.CartItemNotFound',
  },
]);

// Nếu như skuId truyền lên không thuộc về shop thì throw error
export const SkuNotBelongToShopException = new BadRequestException([
  {
    field: 'skuId',
    message: 'Error.SkuNotBelongToShop',
  },
]);

export const CartItemDuplicatedException = new BadRequestException([
  {
    field: 'cartItemIds',
    message: 'Error.CartItemDuplicated',
  },
]);

export const CannotCancelOrderException = new BadRequestException([
  {
    field: 'id',
    message: 'Error.CannotCancelOrder',
  },
]);
