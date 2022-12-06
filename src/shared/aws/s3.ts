import { S3Client, DeleteObjectCommand, type S3ClientConfig, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { Readable } from 'stream';

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

  constructor(bucket: string, options: S3ClientConfig, requiredUser = false) {
    this.bucket = bucket;
    this.options = options;

    this.s3 = new S3Client(options);

    this.upload = multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.bucket,
        key: function (req, file: MulterFile, cb) {
          if (requiredUser && !req.user) {
            return cb({ status: 401, message: 'NotFound user!' });
          }

          const keys = [req.user.id, `${Date.now().toString()}-${file.originalname}`];
          if (typeof (req as any)?.query?.folder === 'string') {
            keys[1] = `${(req as any).query.folder}/${req.user.id}`;
          }

          return cb(null, keys.join('/'));
        },
        acl: 'public-read',
      }),
    });
  }

  public single = (fieldName: string) => this.upload.single(fieldName);
  public array = (fieldName: string) => this.upload.array(fieldName);

  public getObject = (Key: string) => this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key }));

  public deleteObject = (Key: string) => this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key }));
}
