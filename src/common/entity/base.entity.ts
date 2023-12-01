import { IsDate, IsOptional, IsString } from 'class-validator';
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
/**
 * common
 *
 * 1) id - 아이디
 * 2) createdAt - 생성 일자
 * 3) createdBy - 생성한 사용자
 */
export abstract class BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ comment: '생성 일자' })
  @IsDate()
  createdAt: Date;

  @Column({ nullable: true, comment: '생성한 사용자' })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
