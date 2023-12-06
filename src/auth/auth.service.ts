import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import {
  ENV_HASH_ROUNDS_KEY,
  ENV_JWT_SECRET_KEY,
} from 'src/common/const/env-keys.const';
import { UsersModel } from 'src/users/entity/users.entity';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { oneMonthTimes, thirtyMinutesTimes } from './const/expires-in.const';
import wlogger from 'src/log/winston-logger.const';
/**
 * 토큰을 사용하게 되는 방식
 *
 * 1) 사용자가 로그인 또는 회원가입을 진행하면
 *    accessToken과 refreshToken을 발급받는다.
 * 2) 로그인할때는 Basic 토큰과 함께 요청을 보낸다.
 *    Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다.
 *    예) {authorization: 'Basic ${token}'}
 * 3) 아무나 접근할 수 없는 정보 (private route)를 접근할 때는
 *    accessToken을 Header에 추가해서 요청과 함께 보낸다.
 *    예) {authorization: 'Bearer ${token}'}
 * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸
 *    사용자가 누구인지 알 수 있다.
 *    예를 들어 현재 로그인한 사용자가 작성한 포스트만 가져오려면
 *    토큰의 sub 값에 입력되어있는  사용자의 포스트만 따로 필터링 할 수 있다.
 *    특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근할 수 없다.
 * 5) 모든 토큰은 만료 기간이 있다. 만료기간이 지나면 새로 토큰을 발급 받아야한다.
 *    그렇지 않으면 jwtService.verify()에서 인증이 통과 안된다.
 *    그러니 accessToken을 새로 발급 받을 수 있는 /auth/token/access와
 *    refreshToken을 새로 발급 받을 수 있는 /auth/token/refresh가 필요하다.
 * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을해서
 *    새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근한다.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    /**
     * 우리가 만드려는 기능
     *
     * 1) registerWithEmail
     *    - email, name, password, phoneNumber, address를 입력받고 사용자를 생성한다.
     *    - 생성이 완료되면 accessToken과 refreshToken을 반환한다.
     *      회원가입 후 다시 로그인해주세요 <- 이런 쓸데없는 과정을 방지하기 위해서
     *
     * 2) loginWithEmail
     *    - email, password를 입력하면 사용자 검증을 진행한다.
     *    - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
     *
     * 3) loginUser
     *    - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 로직
     *
     * 4) signToken
     *    - (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직
     *
     * 5) authenticateWithEmailAndPassword
     *    - (2)에서 로그인을 진행할때 필요한 기본적인 검증 진행
     *      1. 사용자가 존재하는지 확인(email)
     *      2. 비밀번호가 맞는지 확인
     *      3. 모두 통과되면 찾은 사용자 정보 반환
     *      4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
     *
     */
  }

  //----------------------------------------------------------------------------------------------------------------------------//
  // 토큰

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      wlogger.error('잘못된 토큰입니다!');
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      wlogger.error('잘못된 유형의 토큰입니다!');
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }
    const email = split[0];
    const password = split[1];

    return { email, password };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      });
    } catch (error) {
      wlogger.error('토큰이 만료됐거나 잘못된 토큰입니다.');
      throw new UnauthorizedException('토큰이 만료됐거나 잘못된 토큰입니다.');
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    });

    if (decoded.type !== 'refresh') {
      wlogger.error(`토큰 재발급은 Refresh 토큰으로만 가능합니다.`);
      throw new UnauthorizedException(
        '토큰 재발급은 Refresh 토큰으로만 가능합니다.',
      );
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      id: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      expiresIn: isRefreshToken ? oneMonthTimes : thirtyMinutesTimes,
    });
  }

  //----------------------------------------------------------------------------------------------------------------------------//
  // 인증

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateUser(
    user: Pick<UsersModel, 'email' | 'password'>,
    ip: string,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    const newUser = this.usersRepository.create({
      ...existingUser,
      lastLoginIp: ip,
      lastLoginDate: new Date(),
    });

    return await this.usersRepository.save(newUser);
  }

  async loginWithEmail(
    user: Pick<UsersModel, 'email' | 'password'>,
    request: Request,
  ) {
    const ip = this.usersService.findIp(request);

    const existingUser = await this.authenticateUser(user, ip);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: RegisterUserDto, request: Request) {
    const ip = this.usersService.findIp(request);
    const hash = await bcrypt.hash(
      user.password,
      parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
    );

    const newUser = await this.usersService.createUser(
      {
        ...user,
        password: hash,
      },
      ip,
    );
    return this.loginUser(newUser);
  }
}
