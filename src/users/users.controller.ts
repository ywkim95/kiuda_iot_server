import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './const/roles.const';
import { UpdateUserInformationDto } from './dto/update-user-information.dto';
import { Request } from 'express';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import * as useragent from 'useragent';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdatesEnum } from './const/updates.const';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { UpdateUserPermissionDto } from './dto/update-user-permission.dto';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entity/users.entity';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolesEnum.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('me')
  async getUser(@User() user: UsersModel) {
    return await this.usersService.getUserByEmail(user.email);
  }

  @Patch(':userId/update/information')
  @UseInterceptors(TransactionInterceptor)
  async patchUsersInformation(
    @Req() request: Request,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserInformationDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    const resp = await this.usersService.updateUser(userId, body, user, qr);
    const headers = request.headers['user-agent'];
    const agent = useragent.parse(headers);
    const ip = this.usersService.findIp(request);

    await this.usersService.createUserLog(
      resp,
      ip,
      agent.device.toString(),
      qr,
      UpdatesEnum.INFORMATION,
    );

    return true;
  }

  @Patch(':userId/update/password')
  @UseInterceptors(TransactionInterceptor)
  async patchUsersPassword(
    @Req() request: Request,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserPasswordDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    const resp = await this.usersService.updateUser(userId, body, user, qr);

    const headers = request.headers['user-agent'];
    const agent = useragent.parse(headers);
    const ip = this.usersService.findIp(request);

    await this.usersService.createUserLog(
      resp,
      ip,
      agent.device.toString(),
      qr,
      UpdatesEnum.PASSWORD,
    );
    return true;
  }
  @Patch(':userId/update/permission')
  @UseInterceptors(TransactionInterceptor)
  async patchUsersPermission(
    @Req() request: Request,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserPermissionDto,
    @User() user: UsersModel,
    @QueryRunner() qr: QR,
  ) {
    const resp = await this.usersService.updateUser(userId, body, user, qr);
    const headers = request.headers['user-agent'];
    const agent = useragent.parse(headers);
    const ip = this.usersService.findIp(request);

    await this.usersService.createUserLog(
      resp,
      ip,
      agent.device.toString(),
      qr,
      UpdatesEnum.PERMISSION,
    );

    return true;
  }

  @Delete(':userId')
  async deleteUser() {}
}
