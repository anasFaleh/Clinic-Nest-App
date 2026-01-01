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
import { ReviewService } from './review.service';
import { CreateReviewDto, FilterQueryDto, UpdateReviewDto } from './dto';
import { GetUser } from 'src/common/decorators';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  //@UseGuards(JwtGuard)
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Get()
  findAll(@Query() dto: FilterQueryDto) {
    return this.reviewService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  // @UseGuards(JwtGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.update(id, updateReviewDto, userId);
  }

  @Delete(':id')
  // @UseGuards(JwtGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.remove(id, userId);
  }
}
