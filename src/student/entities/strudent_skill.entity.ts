import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Skill } from './skill.entity';
import { Student } from './student.entity';

@Entity()
export class StudentSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.skills)
  @JoinColumn({ name: 'student_id' })
  students: Student[];

  @ManyToOne(() => Skill, (skill) => skill.students)
  @JoinColumn({ name: 'skill_id' })
  skills: Skill[];

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
