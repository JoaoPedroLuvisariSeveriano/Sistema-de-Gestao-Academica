import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DisciplineEnrollment } from './DisciplineEnrollment';

export enum GradeStatus {
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  FAILED = 'failed',
  RECOVERY = 'recovery',
}

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  disciplineEnrollmentId!: string;

  @ManyToOne(() => DisciplineEnrollment, (de) => de.id)
  @JoinColumn({ name: 'disciplineEnrollmentId' })
  disciplineEnrollment!: DisciplineEnrollment;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade1!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade2!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade3!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalGrade!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  average!: number;

  @Column({ type: 'int', default: 0 })
  attendance!: number;

  @Column({ type: 'int', default: 0 })
  attendedClasses!: number;

  @Column({ type: 'int', default: 100 })
  totalClasses!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  attendancePercentage!: number;

  @Column({
    type: 'enum',
    enum: GradeStatus,
    default: GradeStatus.IN_PROGRESS,
  })
  finalStatus!: GradeStatus;

  @Column({ nullable: true })
  lastAttendanceUpdate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;
}

