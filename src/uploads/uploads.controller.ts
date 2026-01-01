import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtGuard } from 'src/auth/guards';


@Controller('uploads')
@UseGuards(JwtGuard)
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('sub') productId: string,
  ) {
    return this.uploadsService.setProductImage(productId, file.filename);
  }
  
  @Get()
  async getBeneficiaryProfileImage(@GetUser('sub') productId: string) {
    return this.uploadsService.getProductImage(productId);
  }

  @Delete()
  async deleteProductImage(@GetUser('sub') id: string) {
    await this.uploadsService.deleteProductImage(id);
    return { success: true, message: 'Product image deleted successfully' };
  }
}
