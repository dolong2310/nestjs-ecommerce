/**
 * Nhớ chạy lệnh npx prisma generate để tạo file generated/prisma/client.ts
 * Sau đó vào file "generated/prisma/client.ts" xoá đuôi .js trên các import file để không bị lỗi.
 */
import envConfig from "@/shared/config";
import { RoleName } from "@/shared/constants/role.constant";
import { HashingService } from "@/shared/services/hashing.service";
import { PrismaService } from "@/shared/services/prisma.service";

const hashingService = new HashingService();
const prisma = new PrismaService();

const main = async () => {
  // Check if roles already exist
  const roleCount = await prisma.role.count();
  if (roleCount > 0) {
    return {
      success: false,
      message: "Roles already exist",
      data: {
        roleCount,
      },
    }
  }

  // Create roles
  const roles = await prisma.role.createMany({
    data: [
      { name: RoleName.Admin, description: "Admin role" },
      { name: RoleName.User, description: "User role" },
      { name: RoleName.Seller, description: "Seller role" },
    ],
  });

  // Find admin role
  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  });

  if (!adminRole) {
    return {
      success: false,
      message: "Admin role not found",
      data: null,
    };
  }

  // Hash password
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: envConfig.ADMIN_NAME,
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    }
  })

  return {
    success: true,
    message: "Admin created successfully",
    data: {
      admin,
      roleCount: roles.count
    }
  };
}

main().then(response => {
  console.log("Created admin: ", response.data?.admin);
  console.log("Created roles: ", response.data?.roleCount);
  console.log("Success: ", response.success);
  console.log("Message: ", response.message);
}).catch(error => {
  console.error("error: ", error);
});