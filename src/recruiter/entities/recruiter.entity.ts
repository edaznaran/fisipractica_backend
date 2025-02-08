import { Company } from 'src/company/entities/company.entity';
import { UserProfile } from 'src/user/entities/user_profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @OneToOne(() => UserProfile, (user) => user.recruiter)
  @JoinColumn({ name: 'user_id' })
  userProfile: UserProfile;

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
