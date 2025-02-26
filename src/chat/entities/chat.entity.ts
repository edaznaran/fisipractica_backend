import { Message } from 'src/message/entities/message.entity';
import { Recruiter } from 'src/recruiter/entities/recruiter.entity';
import { Student } from 'src/student/entities/student.entity';
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

  @ManyToOne(() => Student, (student) => student.chats)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Recruiter, (recruiter) => recruiter.chats)
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: Recruiter;

  @Column()
  job_id: number;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
