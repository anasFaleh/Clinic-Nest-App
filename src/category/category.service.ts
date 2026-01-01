import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns category
   */
  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (category) throw new ConflictException('Category is Already Exists');

    return this.prisma.category.create({ data: { ...dto } });
  }

  /**
   *
   * @returns Categories
   */
  async findAll() {
    const categories = await this.prisma.category.findMany({});
    if (categories.length === 0)
      throw new NotFoundException('No Categories Found');
    return categories;
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOne(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category No Found');
    return category;
  }

  /**
   * Update Category
   * @param id
   * @param dto
   * @returns
   */
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    return this.prisma.category.update({
      where: { id: category.id },
      data: { name: dto.name },
    });
  }

  /**
   * Delete Category
   * @param id
   * @returns message
   */
  async remove(id: string) {
    const category = await this.findOne(id);
    await this.prisma.category.delete({ where: { id: category.id } });
    return { message: 'Category Deleted Sucessfully' };
  }
}
