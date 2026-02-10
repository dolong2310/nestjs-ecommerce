import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartQueryDTO,
  GetCartResponseDTO,
  UpdateCartBodyDTO,
} from '@/routes/cart/cart.dto';
import { CartService } from '@/routes/cart/cart.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'cart', version: CURRENT_VERSION })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodResponse({ type: GetCartResponseDTO })
  getCart(@ActiveUser('userId') userId: number, @Query() query: GetCartQueryDTO): Promise<GetCartResponseDTO> {
    return this.cartService.getCart({ userId, query });
  }

  @Post()
  @ZodResponse({ type: CartItemDTO })
  addToCart(@ActiveUser('userId') userId: number, @Body() body: AddToCartBodyDTO): Promise<CartItemDTO> {
    return this.cartService.addToCart({ userId, body });
  }

  @Put(':id')
  @ZodResponse({ type: CartItemDTO })
  updateCart(
    @ActiveUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCartBodyDTO,
  ): Promise<CartItemDTO> {
    return this.cartService.updateCart({ userId, id, body });
  }

  @Post('delete') // Method DELETE không được phép gửi body, nên sử dụng POST và thêm endpoint là delete
  @ZodResponse({ type: MessageResponseDTO })
  deleteCart(@ActiveUser('userId') userId: number, @Body() body: DeleteCartBodyDTO): Promise<MessageResponseDTO> {
    return this.cartService.deleteCart({ userId, body });
  }
}
