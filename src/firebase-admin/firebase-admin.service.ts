import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersModel } from 'src/users/entity/users.entity';
import { FirebaseModel } from './entities/firebase.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import wlogger from 'src/log/winston-logger.const';

@Injectable()
export class FirebaseAdminService {
  constructor(
    @InjectRepository(FirebaseModel)
    private readonly firebaseRepository: Repository<FirebaseModel>,
  ) {}

  async getTokenList(user: UsersModel) {
    console.log(user);
    let tokenList = await this.firebaseRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    console.log('tokenList', tokenList);
    if (tokenList.length === 0) {
      wlogger.error('유저가 가진 토큰이 없습니다.');
      throw new NotFoundException('유저가 가진 토큰이 없습니다.');
    }
    return tokenList;
  }

  async saveOrUpdateToken(user: UsersModel, token: string, clientInfo: string) {
    try {
      let pushToken = await this.firebaseRepository.findOne({
        where: {
          user: {
            id: user.id,
          },
          clientInfo,
        },
      });

      if (pushToken) {
        pushToken.token = token;
      } else {
        pushToken = this.firebaseRepository.create({
          user,
          clientInfo,
          token,
        });
      }
      await this.firebaseRepository.save(pushToken);
    } catch (error) {
      wlogger.error(error);
      console.log(error);
    }
  }

  async cleanupOldTokens() {
    // 2달
    const baseDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 2);

    const oldTokens = await this.firebaseRepository.find({
      where: {
        updatedAt: LessThan(baseDate),
      },
    });

    if (oldTokens.length > 0) {
      await this.firebaseRepository.delete(oldTokens.map((token) => token.id));
    }
  }
}
