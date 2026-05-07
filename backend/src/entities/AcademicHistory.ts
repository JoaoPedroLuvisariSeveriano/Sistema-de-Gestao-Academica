import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './Student';

export enum AcademicHistoryStatus {
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  FAILED = 'failed',
  RECOVERY = 'recovery',
  CANCELLED = 'cancelled',
}

@Entity('academic_history')
export class AcademicHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.academicHistory)
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Column('uuid')
  disciplineId!: string;

  @Column({ nullable: true })
  discipline!: string;

  @Column()
  disciplineName!: string;

  @Column()
  courseName!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'int' })
  period!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade!: number;

  @Column({
    type: 'enum',
    enum: AcademicHistoryStatus,
    default: AcademicHistoryStatus.IN_PROGRESS,
  })
  status!: AcademicHistoryStatus;

  @Column({ type: 'int', default: 0 })
  workload!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  attendancePercentage!: number;

  @Column({ nullable: true })
  completionDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;
}

