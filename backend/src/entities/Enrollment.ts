import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Student } from './Student';
import { Course } from './Course';
import { DisciplineEnrollment } from './DisciplineEnrollment';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
}

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.enrollments)
  @JoinColumn({ name: 'studentId' })
  student!: Student;

  @Column('uuid')
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.enrollments)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ type: 'int' })
  period!: number;

  @Column()
  year!: number;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status!: EnrollmentStatus;

  @Column({ nullable: true })
  cancellationDate!: Date;

  @Column({ nullable: true })
  cancellationReason!: string;

  @OneToMany(() => DisciplineEnrollment, (de) => de.enrollment)
  disciplineEnrollments!: DisciplineEnrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;
}

