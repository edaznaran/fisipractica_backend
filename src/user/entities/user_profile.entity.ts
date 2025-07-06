import { Application } from '../../application/entities/application.entity';
import { Job } from '../../job/entities/job.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import { Student } from '../../student/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'bytea', nullable: true })
  photo: Uint8Array;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToOne(() => Student, (student) => student.userProfile, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @OneToOne(() => Recruiter, (recruiter) => recruiter.userProfile, {
    cascade: true,
  })
  recruiter: Recruiter;

  @OneToMany(() => Application, (application) => application.userProfile)
  applications: Application[];

  @OneToMany(() => Job, (job) => job.userProfile)
  jobs: Job[];
}
