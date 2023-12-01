import { PickType } from '@nestjs/mapped-types';
import { FirebaseModel } from '../entities/firebase.entity';

export class saveFirebaseTokenDto extends PickType(FirebaseModel, [
  'clientInfo',
  'token',
]) {}
