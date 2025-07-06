import { Job } from 'src/job/entities/job.entity';
import { UserProfile } from 'src/user/entities/user_profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationStatus } from '../enums/application.enum';

@Entity()
export class Application {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => UserProfile, (userProfile) => userProfile.applications)
  @JoinColumn({ name: 'user_id' })
  userProfile: UserProfile;

  @ManyToOne(() => Job, (job) => job.applications)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
