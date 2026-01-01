import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, FilterQueryDto, UpdateReviewDto } from './dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const reviewExists = await this.prisma.review.findFirst({
      where: {
        productId: dto.productId,
        userId: dto.userId,
      },
    });

    if (reviewExists)
      throw new ConflictException(
        'You can just make one review for one product',
      );

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    const review = await this.prisma.review.create({
      data: {
        ...dto,
      },
    });

    return review;
  }

  async findAll(dto: FilterQueryDto) {
    const {
      page = 1,
      limit = 10,
      productId,
      userId,
      minRating,
      maxRating,
    } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) {
        where.rating.gte = minRating;
      }
      if (maxRating !== undefined) {
        where.rating.lte = maxRating;
      }
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    // Calculate average rating for the filtered results
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / reviews.length;
    }

    return {
      reviews,
      total,
      averageRating: parseFloat(averageRating.toFixed(2)),
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return {
      review,
      user: review.user,
      product: review.product,
    };
  }

  async update(id: string, dto: UpdateReviewDto, userId?: string) {
    // Check if review exists
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Check if user is the owner (if userId is provided)
    if (userId && existingReview.userId !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    return updatedReview;
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    // Check if review exists
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) throw new NotFoundException(`Review not found`);

    // Check if user is the owner (if userId is provided)
    if (userId && review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return { message: `Review deleted successfully` };
  }
}
