import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
} from '@nestjs/common';
import { extname } from 'path';

export function ImageFileValidator() {
  return {
    limits: {
      fileSize: megabyte(20),
    },
    fileFilter: (_req: any, file: any, callback: any) => {
      if (!file.originalname.match(/\.(jpeg|jpg|png|gif)$/i)) {
        return callback(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
      callback(null, true);
    },
  };
}

export function PdfFileValidator() {
  return {
    limits: {
      fileSize: megabyte(100),
    },
    fileFilter: (_req: any, file: any, callback: any) => {
      if (!file.originalname.match(/\.(pdf)$/i)) {
        return callback(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
      callback(null, true);
    },
  };
}

export function ExcelFileValidator() {
  return {
    limits: {
      fileSize: megabyte(200),
    },
    fileFilter: (_req: any, file: any, callback: any) => {
      if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
        return callback(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
      callback(null, true);
    },
  };
}

export function DealerPP20FileValidator() {
  return {
    limits: {
      fileSize: megabyte(10),
    },
    fileFilter: (_req: any, file: any, callback: any) => {
      if (!file.originalname.match(/\.(jpeg|jpg|png|pdf)$/i)) {
        return callback(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
      callback(null, true);
    },
  };
}

export function AttachmentFileValidator(fileRegexp?: RegExp) {
  const regex = fileRegexp ?? /\.(jpeg|jpg|png|mp4)$/i;

  return {
    limits: {
      fileSize: megabyte(100),
    },
    fileFilter: (_req: any, file: any, callback: any) => {
      if (!file.originalname.match(regex)) {
        return callback(
          new HttpException(
            `Unsupported file type ${extname(file.originalname)}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
      callback(null, true);
    },
  };
}

function megabyte(megabyte: number): number {
  return megabyte * 1000000;
}

@Injectable()
export class ImagesValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    for (const file of files) {
      if (file.size > megabyte(20))
        throw new PayloadTooLargeException('File too large');
      if (!file.originalname.match(/\.(jpeg|jpg|png|gif)$/i))
        throw new BadRequestException(
          `Unsupported file type ${extname(file.originalname)}`,
        );
    }
    return files;
  }
}
