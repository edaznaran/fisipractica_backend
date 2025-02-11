import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Client } from 'minio';
import { env } from 'process';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly minioClient: Client;
  private readonly endPoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor() {
    this.endPoint = env.ENDPOINT_MINIO || 'localhost';
    this.port = +(env.PORT_MINIO || 9000);
    this.useSSL = false;
    this.minioClient = new Client({
      endPoint: this.endPoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: env.ACCESSKEY_MINIO || 'minioadmin',
      secretKey: env.SECCRETKEY_MINIO || 'minioadmin',
    });
  }

  async uploadFile(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    tag: string,
  ): Promise<string> {
    try {
      // Valida si el bucket existe, sino lo crea
      const bucketExists = await this.minioClient.bucketExists(bucket);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucket, 'us-east-1');
        // Define política para hacer el bucket público
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        // Aplica la política de acceso público al bucket
        await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      } else {
        // Verificar si el archivo ya existe en MinIO
        const fileExists = await this.fileExists(bucket, objectName);
        if (fileExists) {
          throw new ConflictException('El archivo ya existe en MinIO.');
        }
        console.log(`Bucket ${bucket} exists.`);
      }

      // Detecta el tipo de archivo y configura el Content-Type
      let contentType: string;
      const fileExtension = objectName.toLowerCase();
      if (fileExtension.endsWith('.jpg')) {
        contentType = 'image/jpg';
      } else if (fileExtension.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (fileExtension.endsWith('.png')) {
        contentType = 'image/png';
      } else if (fileExtension.endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else {
        throw new BadRequestException(
          'Extensiones permitidas: jpg, jpeg, png y pdf',
        );
      }
      const metaData = {
        'Content-Type': contentType,
      };

      // Obtener la fecha y hora actual en UTC y convertir a UTC-5
      const localTime = new Date(Date.now() + -5 * 60 * 60 * 1000);
      // Formatear la fecha y hora
      const formattedNAme =
        localTime
          .toISOString()
          .replace(/T/, '-')
          .replace(/:/g, '-')
          .slice(0, 19) +
        '-' +
        objectName;

      // Guarda el archivo
      await this.minioClient.putObject(
        bucket,
        formattedNAme,
        buffer,
        buffer.length,
        metaData,
      );

      // Agregar el tag después de la subida
      await this.minioClient.setObjectTagging(
        bucket,
        formattedNAme,
        { tagkey: tag },
        {
          versionId: '',
        },
      );

      // Obtiene la url
      const url = this.getPublicUrl(bucket, formattedNAme);

      return url;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error al subir el archivo:', error.message);
      throw new InternalServerErrorException(
        `Error interno al subir el archivo ${error.message}`,
      );
    }
  }

  async getFile(bucketName: string, objectName: string): Promise<Buffer> {
    try {
      const stream: Readable = await this.minioClient.getObject(
        bucketName,
        objectName,
      );
      const chunks: Uint8Array[] = [];

      return await new Promise<Buffer>((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => {
          chunks.push(chunk);
        });

        stream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        stream.on('error', (err) => {
          reject(new Error(`Error getting file: ${err.message}`));
        });
      });
    } catch (err) {
      throw new Error(`Error getting file: ${err.message}`);
    }
  }

  async fileExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, objectName);
      return true; // Archivo existe
    } catch (err) {
      if (err.code === 'NotFound') {
        return false; // Archivo no encontrado
      }
      throw err; // Propagar otros errores
    }
  }

  // Obtener el endpoint
  getPublicUrl(bucket: string, objectName: string): string {
    const protocol = this.useSSL ? 'https' : 'http';
    const encodedObjectName = encodeURIComponent(objectName);
    return `${protocol}://${process.env.DOMAIN}:${this.port}/${bucket}/${encodedObjectName}`;
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, objectName);
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }
}
