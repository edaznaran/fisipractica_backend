import { Recruiter } from 'src/recruiter/entities/recruiter.entity';
import { Job } from 'src/job/entities/job.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  description: string;

  @Column()
  website: string;

  @Column()
  location: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToMany(() => Recruiter, (recruiter) => recruiter.company)
  recruiters: Recruiter[];

  @OneToMany(() => Job, (job) => job.company)
  jobs: Job[];
}
