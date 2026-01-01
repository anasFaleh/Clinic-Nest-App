import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: string): Promise<string> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { cart: true },
    });

    if (!user) throw new NotFoundException(`User not found`);

    // If user already has a cart, return it
    if (user.cart) {
      return user.cart.id;
    }

    // Create new cart for user
    const cart = await this.prisma.cart.create({
      data: {
        user: {
          connect: { id: userId },
        },
      },
    });

    // Update user with cartId
    await this.prisma.user.update({
      where: { id: userId },
      data: { cartId: cart.id },
    });

    return cart.id;
  }

  /**
   *
   * @param userId
   * @returns
   */
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!cart) {
      // Create cart if it doesn't exist
      const cartId = await this.getOrCreateCart(userId);
      return this.getCart(userId); // Recursive call to get the newly created cart
    }

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;

    cart.items.forEach((item) => {
      totalItems += item.quantity;
      totalPrice += item.product.price * item.quantity;
    });

    return {
      id: cart.id,
      userId: userId,
      items: cart.items.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product,
      })),
      totalItems,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   *
   * @param userId
   * @param addToCartDto
   * @returns
   */
  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    // Get or create cart
    const cartId = await this.getOrCreateCart(userId);

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: addToCartDto.productId },
    });

    if (!product) throw new NotFoundException(`Product not found`);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId: addToCartDto.productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity if item already exists
      await this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + addToCartDto.quantity,
        },
      });
    } else {
      // Create new cart item

      await this.prisma.cartItem.create({
        data: {
          cartId,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  /**
   *
   * @param userId
   * @param itemId
   * @param dto
   * @returns
   */
  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    // Get user's cart
    const cart = await this.prisma.cart.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    // Check if item exists in user's cart
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem)
      throw new NotFoundException(`Cart item is not found in your cart`);

    // Update cart item quantity
    await this.prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        ...dto,
      },
    });

    return this.getCart(userId);
  }

  /**
   *
   * @param userId
   * @param itemId
   * @returns
   */
  async removeFromCart(userId: string, itemId: string) {
    // Get user's cart
    const cart = await this.prisma.cart.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!cart) throw new NotFoundException('Cart not found');

    // Check if item exists in user's cart
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem)
      throw new NotFoundException(`Cart item is not found in your cart`);

    // Remove item from cart
    await this.prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    return this.getCart(userId);
  }
}
