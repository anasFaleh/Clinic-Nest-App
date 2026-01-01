import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { GetUser } from 'src/common/decorators';
import { JwtGuard } from 'src/auth/guards';

@Controller('carts')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@GetUser('sub') id: string) {
    return this.cartService.getCart(id);
  }

  @Post('add')
  addToCart(@Body() addToCartDto: AddToCartDto, @GetUser('sub') id: string) {
    return this.cartService.addToCart(id, addToCartDto);
  }

  @Put('item/:itemId')
  updateCartItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetUser('sub') id: string,
  ) {
    return this.cartService.updateCartItem(id, itemId, updateCartItemDto);
  }

  @Delete('item/:itemId')
  removeFromCart(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @GetUser('sub') id: string,
  ) {
    return this.cartService.removeFromCart(id, itemId);
  }
}
