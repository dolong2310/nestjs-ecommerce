/**
 * Nhớ chạy lệnh npx prisma generate để tạo file generated/prisma/client.ts
 * Sau đó vào file "generated/prisma/client.ts" xoá đuôi .js trên các import file để không bị lỗi.
 * Link stackoverflow tham khảo cách lấy availableRoutes: https://stackoverflow.com/questions/58255000/how-can-i-get-all-the-routes-from-all-the-modules-and-controllers-available-on/63333671#63333671
 */
import { PrismaService } from "@/shared/services/prisma.service";

const prisma = new PrismaService();

async function main() {
  const brands = Array(10000).fill(0).map((_, index) => ({
    logo: `Logo ${index}`,
  }));

  // console.log("brands: ", brands);

  const response = await prisma.brand.createMany({
    data: brands,
    skipDuplicates: true,
  });

  console.log("Brands created count: ", response.count);
  process.exit(0);
}
// test query brand với 10000 records bằng sql trong db, chứng minh việc db tự động "index scan" thay vì "seq scan" (nếu ít records thì db sẽ dùng seq scan)
// explain analyze select * from "Brand" where "id" = '9000' and "deletedAt" is NULL limit 1
// Nếu muốn xoá hết Brand thì chạy lệnh sql: delete from "Brand" where "deletedAt" is NULL
main();
