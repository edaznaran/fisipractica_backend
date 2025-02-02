import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  cv_url: string;

  @Column()
  institution: string;

  @Column()
  education_start_date: Date;

  @Column()
  education_end_date: Date;

  @Column()
  studying: boolean;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
