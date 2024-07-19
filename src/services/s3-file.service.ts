import { Injectable, HttpException, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import axios from 'axios';

import configuation from '@/config/configuration';
import * as sharp from 'sharp';

const config = configuation();
const s3 = new S3({
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  },
});

const AWS_S3_BUCKET_NAME: string = config.s3.bucketName;

@Injectable()
export class S3FileService {
  private readonly logger = new Logger(S3FileService.name);

  async fileUpload(
    file: Express.Multer.File,
    dir?: string,
    returnError?: boolean,
  ) {
    const { buffer, originalname, mimetype, size } = file;
    const params = {
      Bucket: `${AWS_S3_BUCKET_NAME}/${dir ?? ''}`,
      Key: this.generateName(originalname),
      Body: buffer,
      ACL: 'bucket-owner-full-control',
      ContentEncoding: 'binary',
      ContentType: mimetype,
    };
    let location = '';
    let key = '';
    try {
      const { Location, Key } = await s3.upload(params).promise();
      location = Location;
      key = Key;
    } catch (error) {
      if (returnError) {
        return { location, key, originalname, error };
      } else {
        throw new HttpException(error.message, 400, {
          cause: new Error(error.message),
        });
      }
    }
    return { location, key, originalname, size, error: null };
  }

  async fileUploadMultiple(files: Express.Multer.File[], dir?: string) {
    const uploadedFiles = [];
    for (const file of files) {
      const uploadedFile = await this.fileUpload(file, dir);

      if (uploadedFile.location) {
        const data = { imageUrl: uploadedFile.location };
        uploadedFiles.push(data);
      }
    }
    return uploadedFiles;
  }

  async removeFile(key: string, dir?: string) {
    const params = {
      Bucket: `${AWS_S3_BUCKET_NAME}/${dir ?? ''}`,
      Key: key,
    };

    s3.deleteObject(params, function (err) {
      if (err) {
        console.error(err, err.stack);
      } else {
        console.log('S3 service: file has been deleted');
      }
    });
  }

  async imageUploadFromUrl(input: {
    url: string;
    dir?: string;
    returnError?: boolean;
    isResize?: boolean;
  }) {
    const { url, dir, returnError, isResize } = input;
    const allowdImageExtensions = ['jpg', 'jpeg', 'png'];
    const allowdDomains = ['www.car4sure.com'];

    if (!url) {
      return null;
    }

    const parsedUrl = new URL(url);
    if (!allowdDomains.includes(parsedUrl.hostname)) {
      return null;
    }

    const [filename, extension] = url
      .substring(url.lastIndexOf('/') + 1)
      .split('.');

    if (!allowdImageExtensions.includes(extension.toLowerCase())) {
      return null;
    }

    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'arraybuffer',
      });

      if (response.status !== 200) {
        this.logger.error(
          `S3 service: Failed to download file. Status code: ${response.status}`,
        );
      }

      let buffer = Buffer.from(response.data, 'binary');

      if (isResize) {
        buffer = await this.resizeImage({ buffer, extension });
      }

      const file: Express.Multer.File = {
        fieldname: filename,
        destination: '',
        path: '',
        filename: filename,
        buffer: buffer,
        encoding: '7bit',
        originalname: `${filename}.${extension}`,
        mimetype: `image/${extension}`,
        stream: null,
        size: buffer.byteLength,
      };

      return await this.fileUpload(file, dir, returnError);
    } catch (error) {
      this.logger.error(`S3 service: Failed to download a file. ${error}`);
      return null;
    }
  }

  private generateName(name: string) {
    const nameArray = name.split('.');
    return `${nameArray[0].replace(/\s/g, '')}_${new Date().getTime()}.${
      nameArray[nameArray.length - 1]
    }`;
  }

  private async resizeImage(input: {
    buffer: Buffer;
    extension: string;
  }): Promise<Buffer> {
    const options = { quality: 80 };
    const { buffer, extension } = input;

    const imgSharp = sharp(buffer);

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        imgSharp.jpeg(options);
        break;
      case 'png':
        imgSharp.png(options);
        break;
    }

    return imgSharp.toBuffer();
  }
}
