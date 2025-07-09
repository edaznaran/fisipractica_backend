import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import { Student } from '../../student/entities/student.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.chats, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Recruiter, (recruiter) => recruiter.chats, {
    nullable: true,
  })
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: Recruiter;

  @Column()
  job_id: number;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
