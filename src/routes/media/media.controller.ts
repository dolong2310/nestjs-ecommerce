import { MediaService } from '@/routes/media/media.service';
import { ParseFilePipeWithUnlink } from '@/routes/media/parse-file-pipe-with-unlink.pipe';
import { UPLOAD_DIR } from '@/shared/constants/common.constant';
import { Public } from '@/shared/decorators/auth.decorator';
import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import path from 'path';

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const MAX_COUNT = 10;
const FILE_TYPE = /^(image\/)(png|jpg|jpeg|webp)$/;

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_COUNT, {
      // limits: {
      //   fileSize: 1024 * 1024 * 5, // 5MB
      // }
    }),
  )
  uploadFile(
    @UploadedFiles(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: FILE_TYPE,
            fallbackToMimetype: true, // Fallback to mimetype if magic number detection fails
          }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.mediaService.uploadFile(files);
  }

  @Get('static/:filename')
  @Public()
  serveStaticFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error: Error) => {
      if (error) {
        const notFoundError = new NotFoundException('File not found');
        return res.status(notFoundError.getStatus()).json(notFoundError.getResponse());
        // throw notFoundError;
      }
    });
  }

  /**
   * Tạo presigned url để upload file lên S3
   * Link tham khảo để tạo hàm này: https://docs.aws.amazon.com/AmazonS3/latest/API/s3_example_s3_Scenario_PresignedUrl_section.html
   * Tại sao lại phải upload bằng presigned url?
   * Vì nếu upload trực tiếp thông qua server thì server sẽ bị quá tải request nếu có nhiều user upload file cùng lúc.
   * Ngoài ra server sẽ không đủ storage để lưu trữ file.
   * Giải pháp số 1: Client -> Server -> S3 (không phù hợp vì server sẽ bị quá tải request)
   * Giải pháp số 2: Client -> S3 (thiếu an toàn vì server phải trả s3_access_key và s3_secret_access_key cho client)
   * Giải pháp số 3: Client -> Server -> getPresignedUrl -> Client -> S3 (phù hợp vì presigned url chỉ limit time upload)
   * Nếu dùng giải pháp số 3:
   * Ưu điểm:
   * - Client upload trực tiếp lên S3 mà không cần qua server -> giảm tải server.
   * - presigned url có limit time upload -> tránh việc client spam upload file.
   * Nhược điểm:
   * - Không có khả năng validate file
   */
  @Post('images/upload/presigned-url')
  @Public()
  createPresignedUrl(@Body('filename') filename: string) {
    return this.mediaService.createPresignedUrl(filename);
  }
}
