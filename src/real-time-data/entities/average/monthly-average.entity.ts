import { Entity } from 'typeorm';
import { AbstractAverageModel } from './abstract-average.entity';

@Entity()
export class MonthlyAverageModel extends AbstractAverageModel {}
