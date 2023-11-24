import { Entity } from 'typeorm';
import { AbstractAverageModel } from './abstract-average.entity';

@Entity()
export class DailyAverageModel extends AbstractAverageModel {}
