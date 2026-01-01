import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes, randomInt } from 'crypto';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination:'/images/'
          ,
          filename(req, file, callback) {
            const prefix = `${Date.now()}-${Math.round(Math.random())}`;
            const filename = `${prefix}-${file.originalname}`;
            callback(null, filename);
          },
        }),
        fileFilter: (req, file, cb) => {''
          if (file.mimetype.startsWith('image')) cb(null, true);
        },
        limits: { fileSize: 1024 * 1024 * 10 },
      }),
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
