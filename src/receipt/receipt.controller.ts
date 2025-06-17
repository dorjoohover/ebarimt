import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { BarimtDto, DeleteReceiptDto, ReceiptDto } from './receipt.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiHeaders,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Public } from 'src/auth/guards/jwt/jwt-auth-guard';

@Controller('receipt')
@ApiHeader({
  name: 'x-api-key',
  required: true,
})
@ApiBearerAuth('access-token')
export class ReceiptController {
  constructor(private service: ReceiptService) {}
  // create
  // 7. Гүйлгээ бүр дээр төлбөрийн баримт хэвлэх
  @Post('rest')
  async create(@Body() dto: BarimtDto, @Request() { user }) {
    let res = await this.service.create(dto, user);
    console.log(res)
    return res;
  }

  // update
  // get
  @Get('get/:key')
  @ApiParam({ name: 'key' })
  getBarimt(@Param('key') key: string, @Request() { user }) {
    let res = this.service.getBarimt(user._id, key);
    return res;
  }
  // return

  //
  @Get('send')
  sendData() {
    return this.service.send();
  }
  @Cron(CronExpression.EVERY_10_SECONDS)
  async automatSender() {
    await this.service.send();
  }
  // 6. Борлуулалтын мэдээг илгээх хугацаа хэтэрсэн, сугалааны дугаар дуусаж буй болон сугалааны дугаар дууссан тухайг анхааруулах
  @Public()
  @Get('info')
  async getInfo() {
    return await this.service.getInformation();
  }
  // delete
  @Delete()
  async delete(@Body() dto: DeleteReceiptDto, @Request() {user}) {
    return await this.service.deleteReceipt(dto, user._id.toString());
  }
}
