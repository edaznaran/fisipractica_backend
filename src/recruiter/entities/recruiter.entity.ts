import { Company } from 'src/company/entities/company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Recruiter {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.recruiters)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column()
  position_start_date: Date;

  @Column()
  active: boolean;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
