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
import { Application } from '../../application/entities/application.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { User } from '../../user/entities/user.entity';
import { StudentSkill } from './student_skill.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.student, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  @OneToMany(() => StudentSkill, (skill) => skill.student, {
    nullable: true,
    cascade: true,
  })
  skills: StudentSkill[];

  @OneToMany(() => Application, (application) => application.student)
  applications: Application[];

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToMany(() => Chat, (chat) => chat.student)
  chats: Chat[];
}
