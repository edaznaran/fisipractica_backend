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

  @ManyToOne(() => Student, (student) => student.skills, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Skill, (skill) => skill.students, {
    cascade: true,
  })
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @CreateDateColumn()
  create_date: Date;

  @UpdateDateColumn()
  update_date: Date;
}
