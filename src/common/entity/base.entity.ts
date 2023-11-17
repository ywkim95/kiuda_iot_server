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
  createdAt: Date;

  @Column({ comment: '생성한 사용자' })
  createdBy: string;
}
