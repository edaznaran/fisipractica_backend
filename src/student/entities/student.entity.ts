import { UserProfile } from 'src/user/entities/user_profile.entity';
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
import { Skill } from './skill.entity';
import { StudentSkill } from './student_skill.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserProfile, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  userProfile: UserProfile;

  @Column({ nullable: true })
  cv_url: string;

  @Column({ nullable: true })
  institution: string;

  @Column({ nullable: true })
  education_start_date: Date;

  @Column({ nullable: true })
  education_end_date: Date;

  @Column({ default: true })
  studying: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  availability: string;

  @OneToMany(() => StudentSkill, (skill) => skill.student, { nullable: true })
  skills: Skill[];

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
