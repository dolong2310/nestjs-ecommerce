import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartQueryDTO,
  GetCartResponseDTO,
  UpdateCartBodyDTO,
} from '@/routes/cart/cart.dto';
import { CartService } from '@/routes/cart/cart.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodSerializerDto(GetCartResponseDTO)
  getCart(@ActiveUser('userId') userId: number, @Query() query: GetCartQueryDTO): Promise<GetCartResponseDTO> {
    return this.cartService.getCart({ userId, query });
  }

  @Post()
  @ZodSerializerDto(CartItemDTO)
  addToCart(@ActiveUser('userId') userId: number, @Body() body: AddToCartBodyDTO): Promise<CartItemDTO> {
    return this.cartService.addToCart({ userId, body });
  }

  @Put(':id')
  @ZodSerializerDto(CartItemDTO)
  updateCart(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCartBodyDTO): Promise<CartItemDTO> {
    return this.cartService.updateCart({ id, body });
  }

  @Post('delete') // Method DELETE không được phép gửi body, nên sử dụng POST và thêm endpoint là delete
  @ZodSerializerDto(MessageResponseDTO)
  deleteCart(@ActiveUser('userId') userId: number, @Body() body: DeleteCartBodyDTO): Promise<MessageResponseDTO> {
    return this.cartService.deleteCart({ userId, body });
  }
}
