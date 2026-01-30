import { MediaController } from '@/routes/media/media.controller';
import { MediaService } from '@/routes/media/media.service';
import { UPLOAD_DIR } from '@/shared/constants/common.constant';
import { createDirectorySync, generateRandomFilename, isDirectoryExistsSync } from '@/shared/helpers';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const fileName = generateRandomFilename(file.originalname);
    cb(null, fileName);
  },
});

@Module({
  imports: [
    MulterModule.register({
      dest: UPLOAD_DIR,
      storage: storage,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {
  constructor() {
    if (!isDirectoryExistsSync(UPLOAD_DIR)) {
      createDirectorySync(UPLOAD_DIR);
    }
  }
}
