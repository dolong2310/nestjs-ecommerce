import { PresignedUrlUploadFileResponseType, UploadFileResponseType } from '@/routes/media/media.type';
import { deleteFile, generateRandomFilename } from '@/shared/helpers';
import { S3Service } from '@/shared/services/s3.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadFile(files: Array<Express.Multer.File>): Promise<UploadFileResponseType> {
    try {
      // 1. Upload files to S3
      const uploadedFiles: UploadFileResponseType = await Promise.all(files.map(this._uploadFileToS3.bind(this)));

      // 2. Delete local files
      await Promise.all(files.map((file) => deleteFile(file.path)));

      // 3. Return uploaded files
      return uploadedFiles;
    } catch (error) {
      console.log('error upload file: ', error);
      throw error;
    }
  }

  async createPresignedUrl(filename: string): Promise<PresignedUrlUploadFileResponseType> {
    const randomFilename = generateRandomFilename(filename);
    const presignedUrl = await this.s3Service.createPresignedUrlWithClient(randomFilename);
    const url = presignedUrl.split('?')[0];

    return {
      presignedUrl,
      url,
    };
  }

  private async _uploadFileToS3(file: Express.Multer.File): Promise<UploadFileResponseType[number]> {
    const result = await this.s3Service.uploadFile({
      filename: `images/${file.filename}`,
      filepath: file.path,
      contentType: file.mimetype,
    });

    // url trả về từ s3 sẽ không có quyền access (Access denied)
    // để cấp quyền thì tham khảo link: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html
    // hoặc search google: "Setting permissions for website access"
    return {
      url: result.Location ?? '',
    };
  }
}
