import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './base.entity';
import { IsOptional } from 'class-validator';
/**
 * common
 *
 * 1) id - 아이디
 * 2) createdAt - 생성 일자
 * 3) createdBy - 생성한 사용자
 * 4) updatedAt - 업데이트 일자
 * 5) updatedBy - 업데이트한 사용자
 */
export abstract class BaseWithUpdateModel extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '수정 일자',
    default: new Date(),
  })
  updatedAt: Date;

  @Column({
    nullable: true,
    comment: '수정한 사용자',
  })
  @IsOptional()
  updatedBy?: string;
}
