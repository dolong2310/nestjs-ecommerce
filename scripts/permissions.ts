/**
 * Nhớ chạy lệnh npx prisma generate để tạo file generated/prisma/client.ts
 * Sau đó vào file "generated/prisma/client.ts" xoá đuôi .js trên các import file để không bị lỗi.
 * Link stackoverflow tham khảo cách lấy availableRoutes: https://stackoverflow.com/questions/58255000/how-can-i-get-all-the-routes-from-all-the-modules-and-controllers-available-on/63333671#63333671
 */
import { AppModule } from '@/app.module';
import { EnumHttpMethod, HttpMethodType } from '@/shared/constants/permission.constant';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { PrismaService } from '@/shared/services/prisma.service';
import { NestFactory } from '@nestjs/core';

type AvailableRoute = {
  name: string;
  path: string;
  method: HttpMethodType;
  module: string;
};

const PORT = 3030; // only for testing port
const SELLER_MODULE = [
  'AUTH',
  'MEDIA',
  'PRODUCTS',
  'MANAGE_PRODUCT',
  'PRODUCT_TRANSLATION',
  'PROFILE',
  'CART',
  'ORDERS',
  'REVIEWS',
];
const USER_MODULE = ['AUTH', 'MEDIA', 'PRODUCTS', 'PROFILE', 'CART', 'ORDERS', 'REVIEWS'];

const prismaService = new PrismaService();

async function main() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  // Get all available routes from router
  const availableRoutes = getAvailableRoutes(router);

  // Sync permissions between availableRoutes and database
  await syncPermissions(availableRoutes);

  // lấy toàn bộ list permission từ database
  const permissions = await prismaService.permission.findMany({
    where: {
      deletedAt: null,
    },
  });

  // Sync permissions to ADMIN role
  const adminPermissionIds = permissions.map((p) => ({ id: p.id }));
  const syncedAdminPermissions =
    adminPermissionIds.length > 0 ? syncPermissionsToRole(RoleName.ADMIN, adminPermissionIds) : Promise.resolve();

  // Sync permissions to SELLER role
  const sellerPermissionIds = permissions.filter((p) => SELLER_MODULE.includes(p.module)).map((p) => ({ id: p.id }));
  const syncedSellerPermissions =
    sellerPermissionIds.length > 0 ? syncPermissionsToRole(RoleName.SELLER, sellerPermissionIds) : Promise.resolve();

  // Sync permissions to USER role
  const userPermissionIds = permissions.filter((p) => USER_MODULE.includes(p.module)).map((p) => ({ id: p.id }));
  const syncedUserPermissions =
    userPermissionIds.length > 0 ? syncPermissionsToRole(RoleName.USER, userPermissionIds) : Promise.resolve();

  // Excute promises
  await Promise.all([syncedAdminPermissions, syncedSellerPermissions, syncedUserPermissions]);

  console.log('✅ Permissions synced successfully!');
  process.exit(0);
}

function getAvailableRoutes(router: any): AvailableRoute[] {
  const VALID_HTTP_METHODS = Object.values(EnumHttpMethod);

  return router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = layer.route?.stack[0].method.toUpperCase() as HttpMethodType;
        const module = path.split('/')[1]?.toUpperCase() || '';

        // Vì method: ACL và path: /{*path} đến từ middleware Helmet hoặc CORS tự động đăng ký các WebDAV methods (ACL, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK) để xử lý các request bảo mật.
        // Lọc bỏ các WebDAV methods và các method không chuẩn
        if (!VALID_HTTP_METHODS.includes(method)) {
          return null;
        }

        // Lọc bỏ các catch-all routes từ middleware
        if (path === '/{*path}' || path.includes('{*')) {
          return null;
        }

        return {
          name: `${method}+${path}`,
          path,
          method,
          module,
        };
      }
    })
    .filter(Boolean);
}

async function syncPermissions(availableRoutes: AvailableRoute[]) {
  // Sync permissions between availableRoutes and database
  // - Delete permissions that no longer exist in availableRoutes
  // - Create new permissions from availableRoutes that don't exist in database

  // 1. Lấy tất cả permissions từ database
  const permissionsInDatabase = await prismaService.permission.findMany({ where: { deletedAt: null } });

  // 2. Tạo object permissionsInDatabaseMap với key là [method-path]
  const permissionsInDatabaseMap: Record<string, (typeof permissionsInDatabase)[number]> = permissionsInDatabase.reduce(
    (acc, permission) => {
      acc[`${permission.method}-${permission.path}`] = permission;
      return acc;
    },
    {},
  );

  // 3. Tạo object availableRoutesMap với key là [method-path]
  const availableRoutesMap: Record<string, (typeof availableRoutes)[number]> = availableRoutes.reduce((acc, route) => {
    acc[`${route.method}-${route.path}`] = route;
    return acc;
  }, {});

  // 4. Tìm permissions trong database mà không tồn tại trong availableRoutes
  const permissionsToDelete = permissionsInDatabase.filter(
    (permission) => !availableRoutesMap[`${permission.method}-${permission.path}`],
  );

  // 5. Xoá permissions không tồn tại trong availableRoutes
  if (permissionsToDelete.length > 0) {
    const deletedPermissions = await prismaService.permission.deleteMany({
      where: {
        id: { in: permissionsToDelete.map((permission) => permission.id) },
      },
    });
    console.log(`1. Deleted ${deletedPermissions.count} permissions`);
  } else {
    console.log('1. No permissions to delete');
  }

  // 6. Tìm routes không tồn tại trong permissionsInDatabase
  const routesToCreate = availableRoutes.filter((route) => !permissionsInDatabaseMap[`${route.method}_${route.path}`]);

  // 7. Tạo permissions không tồn tại trong permissionsInDatabase
  if (routesToCreate.length > 0) {
    const createdRoutes = await prismaService.permission.createMany({
      data: routesToCreate,
      skipDuplicates: true,
    });
    console.log(`2. Created ${createdRoutes.count} permissions`);
  } else {
    console.log('2. No permissions to create');
  }

  // Cách 2:
  // // Save permissions to database
  // try {
  //   // 1. Delete all permissions if exist in database => sync 100% database with availableRoutes
  //   const deleted = await prismaService.permission.deleteMany();
  //   console.log(`Deleted ${deleted.count} permissions`);
  //   // 2. Create new permissions
  //   const permissions = await prismaService.permission.createMany({
  //     data: availableRoutes,
  //     // skipDuplicates: true, // skip if permission already exists
  //   });
  //   console.log(`Created ${permissions.count} permissions`);
  //   console.log("✅ Permissions synced successfully!");
  // } catch (error) {
  //   console.error("Error creating permissions: ", error);
  // } finally {
  //   // await app.close(); // = process.exit(0);
  //   process.exit(0);
  // }
}

async function syncPermissionsToRole(roleName: RoleNameType, permissionIds: { id: number }[]) {
  // 1. lấy role ROLE_NAME từ database
  const role = await prismaService.role.findFirstOrThrow({
    where: {
      name: roleName,
      deletedAt: null,
    },
  });

  // 2. update permissions của role ROLE_NAME
  const updatedRole = await prismaService.role.update({
    where: {
      id: role.id,
    },
    data: {
      permissions: {
        set: permissionIds,
      },
    },
  });
  console.log(`synced ${permissionIds.length} permissions to role: ${updatedRole.name}`);
}

main();

// (async () => {
//   try {
//     const deleted = await prismaService.permission.deleteMany();
//     console.log(`Deleted ${deleted.count} permissions`);
//     console.log("✅ Permissions deleted successfully!");
//   } catch (error) {
//     console.error("Error deleting permissions: ", error);
//   } finally {
//     process.exit(0);
//   }
// })()

// Sample code to group permissions by module (Frontend will implement this)
// const groupPermissionsByModule = permissions.reduce((result, permission) => {
//   const module = permission.module;
//   if (!result[module]) {
//     result[module] = [];
//   }
//   result[module].push(permission);
//   return result;
// }, {} as Record<string, typeof permissions[number][]>)
