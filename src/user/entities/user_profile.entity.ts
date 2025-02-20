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
import { Student } from 'src/student/entities/student.entity';
import { Recruiter } from 'src/recruiter/entities/recruiter.entity';
import { Job } from 'src/job/entities/job.entity';

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

  @OneToOne(() => Student, (student) => student.userProfile, { cascade: true, onDelete: 'CASCADE' })
  student: Student;

  @OneToOne(() => Recruiter, (recruiter) => recruiter.userProfile, { cascade: true, onDelete: 'CASCADE' })
  recruiter: Recruiter;
 
  @OneToMany(() => Job, (job) => job.userProfile)
  jobs: Job[];
}
