import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from '../../application/entities/application.entity';
import { Company } from '../../company/entities/company.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  location: string;

  @Column()
  description: string;

  @Column()
  salary: string;

  @Column({ default: true })
  hiring: boolean;

  @Column()
  url_job_pdf: string;

  @Column({ nullable: true })
  job_requirements: string;

  @Column({ nullable: true })
  job_functions: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @ManyToOne(() => Company, (company) => company.jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Recruiter, (recruiter) => recruiter.jobs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recruiter_creator_id' })
  recruiter: Recruiter;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
