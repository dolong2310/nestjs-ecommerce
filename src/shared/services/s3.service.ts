import envConfig from '@/shared/config';
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { readFileSync } from 'fs';
import mime from 'mime-types';

@Injectable()
export class S3Service {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      region: envConfig.AWS_S3_REGION,
      credentials: {
        accessKeyId: envConfig.AWS_S3_ACCESS_KEY,
        secretAccessKey: envConfig.AWS_S3_SECRET_ACCESS_KEY,
      },
    });

    // this.s3.listBuckets({}).then(data => {
    //   console.log("data: ", data);
    // });
  }

  async uploadFile({
    filename,
    filepath,
    contentType,
  }: { filename: string, filepath: string, contentType: string }) {
    try {
      const parallelUploads3 = new Upload({
        client: this.s3,

        params: {
          Bucket: envConfig.AWS_S3_BUCKET_NAME,
          Key: filename,
          Body: readFileSync(filepath),
          ContentType: contentType, // nếu không có contentType thì sẽ tự động download file khi upload
        },
        // (optional) tags
        tags: [],
        // (optional) concurrency configuration
        queueSize: 4,
        // (optional) size of each part, in bytes, at least 5MB
        partSize: 1024 * 1024 * 5,
        // (optional) when true, do not automatically call AbortMultipartUpload when a multipart upload fails to complete. You should then manually handle the leftover parts.
        leavePartsOnError: false,
      });

      // parallelUploads3.on("httpUploadProgress", (progress) => {
      //   console.log(progress);
      // });

      return await parallelUploads3.done();
    } catch (error) {
      console.log("error upload file to S3 service: ", error);
      throw error;
    }
  }

  createPresignedUrlWithClient(filename: string) {
    const contentType = mime.lookup(filename) || 'application/octet-stream';
    const command = new PutObjectCommand({
      Bucket: envConfig.AWS_S3_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 10 }); // 10 seconds
  };
}

// Test upload file to S3
// const s3Instance = new S3Service();
// s3Instance
//   .uploadFile({
//     filename: 'images/test.png',
//     filepath: '/Users/dolong/Documents/NestJS/ecommerce/upload/201e4d10-8cea-4c57-a5bd-9883dbc50d23.png',
//     contentType: 'image/png',
//   })
//   .then(console.log)
//   .catch(console.error);
