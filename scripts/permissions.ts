/**
 * Nhớ chạy lệnh npx prisma generate để tạo file generated/prisma/client.ts
 * Sau đó vào file "generated/prisma/client.ts" xoá đuôi .js trên các import file để không bị lỗi.
 * Link stackoverflow tham khảo cách lấy availableRoutes: https://stackoverflow.com/questions/58255000/how-can-i-get-all-the-routes-from-all-the-modules-and-controllers-available-on/63333671#63333671
 */
import { AppModule } from "@/app.module";
import { NestFactory } from "@nestjs/core";
import { EnumHttpMethod } from "@/shared/constants/permission.constant";
import { PrismaService } from "@/shared/services/prisma.service";
import { RoleName } from "@/shared/constants/role.constant";

type AvailableRoute = {
  name: string;
  path: string;
  method: keyof typeof EnumHttpMethod;
};

const PORT = 3030; // only for testing port

const prisma = new PrismaService();

async function main() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  // Get all available routes from router
  const availableRoutes = getAvailableRoutes(router);

  // Sync permissions between availableRoutes and database
  await syncPermissions(availableRoutes);

  // Sync permissions to ADMIN role
  await syncPermissionsToAdminRole();

  console.log("✅ Permissions synced successfully!");
  process.exit(0);
}

function getAvailableRoutes(router: any): AvailableRoute[] {
  return router.stack
    .map(layer => {
      if (layer.route) {
        const path = layer.route?.path;
        const method = layer.route?.stack[0].method.toUpperCase() as keyof typeof EnumHttpMethod;
        return {
          name: `${method}+${path}`,
          path,
          method,
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
  const permissionsInDatabase = await prisma.permission.findMany({ where: { deletedAt: null } });

  // 2. Tạo object permissionsInDatabaseMap với key là [method-path]
  const permissionsInDatabaseMap: Record<string, typeof permissionsInDatabase[number]> = permissionsInDatabase.reduce((acc, permission) => {
    acc[`${permission.method}-${permission.path}`] = permission;
    return acc;
  }, {});

  // 3. Tạo object availableRoutesMap với key là [method-path]
  const availableRoutesMap: Record<string, typeof availableRoutes[number]> = availableRoutes.reduce((acc, route) => {
    acc[`${route.method}-${route.path}`] = route;
    return acc;
  }, {});

  // 4. Tìm permissions trong database mà không tồn tại trong availableRoutes
  const permissionsToDelete = permissionsInDatabase.filter(permission => !availableRoutesMap[`${permission.method}-${permission.path}`]);

  // 5. Xoá permissions không tồn tại trong availableRoutes
  if (permissionsToDelete.length > 0) {
    const deletedPermissions = await prisma.permission.deleteMany({
      where: {
        id: { in: permissionsToDelete.map(permission => permission.id) },
      },
    });
    console.log(`1. Deleted ${deletedPermissions.count} permissions`);
  } else {
    console.log("1. No permissions to delete");
  }

  // 6. Tìm routes không tồn tại trong permissionsInDatabase
  const routesToCreate = availableRoutes.filter(route => !permissionsInDatabaseMap[`${route.method}-${route.path}`]);

  // 7. Tạo permissions không tồn tại trong permissionsInDatabase
  if (routesToCreate.length > 0) {
    const createdRoutes = await prisma.permission.createMany({
      data: routesToCreate,
      skipDuplicates: true,
    });
    console.log(`2. Created ${createdRoutes.count} permissions`);
  } else {
    console.log("2. No permissions to create");
  }

  // Cách 2:
  // // Save permissions to database
  // try {
  //   // 1. Delete all permissions if exist in database => sync 100% database with availableRoutes
  //   const deleted = await prisma.permission.deleteMany();
  //   console.log(`Deleted ${deleted.count} permissions`);
  //   // 2. Create new permissions
  //   const permissions = await prisma.permission.createMany({
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

async function syncPermissionsToAdminRole() {
  // 1. lấy toàn bộ list permission từ database
  const permissions = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  });
  console.log("permissions: ", permissions);

  // 2. lấy role ADMIN từ database
  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
      deletedAt: null,
    },
  });
  console.log("Admin role: ", adminRole);

  // 3. update permissions của role ADMIN
  const updatedRole = await prisma.role.update({
    where: {
      id: adminRole.id,
    },
    data: {
      permissions: {
        set: permissions.map(p => ({ id: p.id }))
      },
    },
  });
  console.log("Updated role: ", updatedRole);
}

main();
