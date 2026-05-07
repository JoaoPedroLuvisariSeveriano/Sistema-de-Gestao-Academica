import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './Student';
import { Teacher } from './Teacher';

export enum UserRole {
  ADMIN = 'admin',
  SECRETARY = 'secretary',
  COORDINATOR = 'coordinator',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column('uuid', { nullable: true })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.users)
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Column('uuid', { nullable: true })
  teacherId!: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.users)
  @JoinColumn({ name: 'teacherId' })
  teacher!: Teacher;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;

  @Column({ nullable: true })
  lastLogin!: Date;
}

