1. Truy cập amazon console
2. Chọn `S3` > Tạo `Bucket` > tắt hết checkbox của `Block Public Access settings for this bucket` hoặc chọn `permissions` > chọn Edit `Block public access (bucket settings)`
3. Chọn `IAM` > chọn `User` > Chọn tab `Security Credentials` > tạo `access_key_id` + `secret_access_key` > lưu vào .env
3. Cấu hình `Policy` > Chọn `permission` > chọn Edit `Bucket Policy` (link tham khảo: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html)
4. Cấu hình `CORS` > Chọn `permission` > chọn Edit `Cross-origin resource sharing (CORS)` (link tham khảo: https://ap-southeast-1.console.aws.amazon.com/s3/buckets/nestjs-ecommerce-dev?region=ap-southeast-1&tab=permissions)