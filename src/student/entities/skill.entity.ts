import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentSkill } from './student_skill.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => StudentSkill, (student) => student.skill, {
    onDelete: 'CASCADE',
  })
  students: StudentSkill[];

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
