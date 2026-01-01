import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
5;
import { promises as fs } from 'fs';
@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async setProductImage(productId: string, img: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('product Not Found');

    if (!img) throw new BadRequestException('No Image Uploaded');

    return this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: img },
    });
  }

  

  async getProductImage(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product Not Found');
    if (!product.imageUrl)
      throw new NotFoundException('No image for this product');

    return product.imageUrl;
  }

 
  async deleteProductImage(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (!product.imageUrl)
      throw new NotFoundException('No image for this product');

    const filePath = `${process.cwd()}/images/profile/${product.imageUrl}`;

    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
      } else {
        throw err;
      }
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: null },
    });
  }
}
