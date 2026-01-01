import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
