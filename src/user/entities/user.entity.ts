import { Chat } from '../../chat/entities/chat.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { UserProfile } from './user_profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ enum: Role, nullable: true })
  role: Role;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  profile: UserProfile;

  @OneToMany(() => Chat, (chat) => chat.student)
  student_chats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.recruiter)
  recruiter_chats: Chat[];
}
