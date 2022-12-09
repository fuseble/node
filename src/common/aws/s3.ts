import { type Request } from 'express';
import { S3Client, DeleteObjectCommand, type S3ClientConfig, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { lookup } from 'mime-types';
import multer from 'multer';
import multerS3 from 'multer-s3';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream: Readable;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  bucket: string;
  key: string;
  acl: string;
  contentType: string;
  contentDisposition: null;
  storageClass: string;
  serverSideEncryption: null;
  metadata: any;
  location: string;
  etag: string;
}

export class AwsS3 {
  private bucket: string;
  private s3: S3Client;
  private options: S3ClientConfig;
  public upload: multer.Multer;

  public imageUpload: multer.Multer;

  constructor(
    bucket: string,
    options: S3ClientConfig,
    key: (req: Express.Request, file: Express.Multer.File, callback: (error: any, key?: string) => void) => void,
  ) {
    this.bucket = bucket;
    this.options = options;

    this.s3 = new S3Client(options);

    this.upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.bucket,
        key,
      }),
    });

    this.imageUpload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.bucket,
        key,
      }),
      fileFilter(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
        const isImage = AwsS3.getContentType(file.originalname).startsWith('image');
        callback(null, isImage);
      },
    });
  }

  public static getContentType = (filename: string) => lookup(filename) || 'application/octet-stream';

  public single = (fieldName: string) => this.upload.single(fieldName);
  public array = (fieldName: string) => this.upload.array(fieldName);

  public imageSingle = (fieldName: string) => this.imageUpload.single(fieldName);

  public imageArray = (fieldName: string) => this.imageUpload.array(fieldName);

  public getObject = (Key: string) => this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key }));

  public deleteObject = (Key: string) => this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key }));
}
