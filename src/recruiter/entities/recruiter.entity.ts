import { Chat } from '../../chat/entities/chat.entity';
import { Company } from '../../company/entities/company.entity';
import { UserProfile } from '../../user/entities/user_profile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Recruiter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, (company) => company.recruiters)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToOne(() => UserProfile, (user) => user.recruiter, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  userProfile: UserProfile;

  @Column()
  description: string;

  @Column()
  position_start_date: Date;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;

  @OneToMany(() => Chat, (chat) => chat.recruiter)
  chats: Chat[];
}
