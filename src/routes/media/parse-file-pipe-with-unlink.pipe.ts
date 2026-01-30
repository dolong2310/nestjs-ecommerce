import { deleteFile } from "@/shared/helpers";
import { ParseFileOptions, ParseFilePipe } from "@nestjs/common";

export class ParseFilePipeWithUnlink extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options);
  }

  async transform(files: Array<Express.Multer.File>): Promise<any> {
    return super.transform(files).catch(async (error: Error) => {
      await Promise.all(files.map(file => deleteFile(file.path)));
      throw error;
    });
  }
}