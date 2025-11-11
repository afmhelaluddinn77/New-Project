import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName = 'radiology-images';

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minio123456',
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  async ensureBucketExists() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      console.log(`✅ Created MinIO bucket: ${this.bucketName}`);
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    orderId: string,
  ): Promise<string> {
    const fileName = `${orderId}/${Date.now()}-${file.originalname}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    // Return the storage path
    return `${this.bucketName}/${fileName}`;
  }

  async getPreSignedUrl(
    storagePath: string,
    expirySeconds = 3600,
  ): Promise<string> {
    const [bucketName, ...filePathParts] = storagePath.split('/');
    const fileName = filePathParts.join('/');

    return this.minioClient.presignedGetObject(
      bucketName,
      fileName,
      expirySeconds,
    );
  }

  async deleteImage(storagePath: string): Promise<void> {
    const [bucketName, ...filePathParts] = storagePath.split('/');
    const fileName = filePathParts.join('/');
    await this.minioClient.removeObject(bucketName, fileName);
  }
}
