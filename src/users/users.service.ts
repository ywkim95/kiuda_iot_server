import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UpdateUserInformationDto } from './dto/update-user-information.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import * as bcrypt from 'bcrypt';
import { ENV_HASH_ROUNDS_KEY } from 'src/common/const/env-keys.const';
import { ConfigService } from '@nestjs/config';
import { UpdatesEnum } from './const/updates.const';
import { UsersLogModel } from './entity/users-log.entity';
import { Request } from 'express';
import { UpdateUserPermissionDto } from './dto/update-user-permission.dto';
import { AbstractDto } from './dto/abstract.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UsersLogModel)
    private readonly usersLogRepository: Repository<UsersLogModel>,
    private readonly configService: ConfigService,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }
  getLogsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersLogModel>(UsersLogModel)
      : this.usersLogRepository;
  }

  async createUser(
    user: Pick<
      UsersModel,
      'email' | 'password' | 'name' | 'address' | 'phoneNumber'
    >,
    ip: string,
  ) {
    const emailExists = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });

    if (emailExists) throw new BadRequestException('이미 가입한 이메일입니다!');

    const userObject = this.usersRepository.create({
      ...user,
      updatedBy: user.email,
      createdBy: user.email,
      lastLoginIp: ip,
    });
    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getAllUsers() {
    return await this.usersRepository.find();
  }

  /**
   * 1. email을 기준으로 계정정보를 가져온다.
   * 2. 외부에서 받아온 값으로 계정정보를 대체한다.
   * 3. queryRunner를 통하여 에러가 발생할 경우 변경이 일어나지않도록한다.
   * 4. 에러가 발생하지 않은 경우 기존정보를 로그에 저장한다.
   * 5. 새로운 값을 계정정보에 저장한 뒤 true를 반환한다.
   */

  async updateUser(
    userId: number,
    dto: AbstractDto,
    nowUser: UsersModel,
    qr?: QueryRunner,
  ) {
    const usersRepository = this.getUsersRepository(qr);

    const oldUser = await usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!oldUser) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    let user: UsersModel;

    if (dto instanceof UpdateUserInformationDto) {
      user = await this.updateUserInformation(oldUser, dto);
    } else if (dto instanceof UpdateUserPasswordDto) {
      user = await this.updateUserPassword(oldUser, dto);
    } else if (dto instanceof UpdateUserPermissionDto) {
      user = await this.UpdateUserPermission(oldUser, dto);
    }

    user.updatedAt = new Date();
    user.updatedBy = nowUser.email;

    const newUser = await usersRepository.save(user);

    return newUser;
  }

  async updateUserInformation(
    oldUser: UsersModel,
    dto: UpdateUserInformationDto,
  ): Promise<UsersModel> {
    const { address, name, phoneNumber, email } = dto;

    if (email) oldUser.email = email;

    if (address) oldUser.address = address;

    if (name) oldUser.name = name;

    if (phoneNumber) oldUser.phoneNumber = phoneNumber;

    oldUser.updatedBy = dto.modifiedEmail;

    oldUser.updatedAt = new Date();

    return oldUser;
  }

  async updateUserPassword(
    oldUser: UsersModel,
    dto: UpdateUserPasswordDto,
  ): Promise<UsersModel> {
    const { currentPassword, newPassword } = dto;

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      oldUser.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException('현재 비밀번호가 틀립니다.');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
    );
    oldUser.password = hashedPassword;

    oldUser.updatedBy = dto.modifiedEmail;

    oldUser.updatedAt = new Date();

    return oldUser;
  }

  async UpdateUserPermission(
    oldUser: UsersModel,
    dto: UpdateUserPermissionDto,
  ): Promise<UsersModel> {
    /**
     * 추후 결제 시스템 도입시 작성
     */
    const { permission } = dto;

    oldUser.permission = permission;

    oldUser.updatedBy = dto.modifiedEmail;

    oldUser.updatedAt = new Date();

    return oldUser;
  }

  async createUserLog(
    user: UsersModel,
    ip: string,
    device: string,
    qr?: QueryRunner,
    updateTo?: UpdatesEnum,
  ) {
    const logRepository = this.getLogsRepository(qr);

    const log = logRepository.create({
      ip,
      device,
      createdBy: user.updatedBy,
      user,
      updateTo,
    });

    await logRepository.save(log);
    return true;
  }

  findIp(request: Request): string {
    let ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    if (Array.isArray(ip)) {
      ip = ip[0];
    } else if (typeof ip === 'string') {
      ip = ip.split(',')[0];
    }
    if (ip === '::1') {
      ip = '127.0.0.1';
    }
    return ip;
  }
}
