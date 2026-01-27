1. npx prisma db pull

2.
npx prisma migrate diff \                  
--from-empty \
--to-schema prisma/schema.prisma \
--script > prisma/migrations/0_init/migration.sql

3. npx prisma migrate resolve --applied 0_init

4. npx prisma migrate dev --create-only

5. Thêm partial unique index cho cặp path và method với điều kiện quan tâm là deletedAt = null (khác null thì kệ moẹ nó, vì nó đã xoá rồi mà)
CREATE UNIQUE INDEX permission_path_method_unique
ON "Permission" (path, method)
WHERE "deletedAt" IS NULL;

6.
npx prisma migrate dev

7. nếu migrate failed thì cách 1 dùng rollback (Kiểm tra trường "checksum" trên database và xoá nó đi => không lưu trường hợp failed trên database vì nó ko đồng bộ với các file migration ở local)
npx prisma migrate resolve --rolled-back [FOLDER_MIGRATION_NAME]

8. sửa file migration

9. npx prisma migrate deploy
