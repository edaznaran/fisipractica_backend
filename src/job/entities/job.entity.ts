import { Application } from 'src/application/entities/application.entity';
import { Company } from 'src/company/entities/company.entity';
import { UserProfile } from 'src/user/entities/user_profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Job {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({nullable: true})
  location: string;

  @Column()
  description: string;

  @Column()
  salary: string;

  @Column({default: true})
  hiring: boolean;

  @Column()
  url_job_pdf: string;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @ManyToOne(() => Company, (company) => company.jobs)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => UserProfile, (userProfile) => userProfile.jobs)
  @JoinColumn({ name: 'user_creator_id' })
  userProfile: UserProfile;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];
}
