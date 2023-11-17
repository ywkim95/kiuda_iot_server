import { SetMetadata } from '@nestjs/common';
import { UpdatesEnum } from '../const/updates.const';

export const UPDATES_KEY = 'user_updates';

export const Updates = (updates: UpdatesEnum) =>
  SetMetadata(UPDATES_KEY, updates);
