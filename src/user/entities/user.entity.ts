import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from '../../chat/entities/chat.entity';
import { Recruiter } from '../../recruiter/entities/recruiter.entity';
import { Student } from '../../student/entities/student.entity';
import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'bytea', nullable: true })
  photo: Uint8Array;

  @Column({ nullable: false })
  password?: string;

  @Column({ enum: Role, nullable: true })
  role: Role;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToMany(() => Chat, (chat) => chat.student)
  student_chats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.recruiter)
  recruiter_chats: Chat[];

  @OneToOne(() => Student, (student) => student.user, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @OneToOne(() => Recruiter, (recruiter) => recruiter.user, {
    cascade: true,
  })
  recruiter: Recruiter;
}
