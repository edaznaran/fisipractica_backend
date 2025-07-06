import { Message } from '../../message/entities/message.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (student) => student.student_chats, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => User, (recruiter) => recruiter.recruiter_chats, {
    nullable: true,
  })
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: User;

  @Column()
  job_id: number;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
