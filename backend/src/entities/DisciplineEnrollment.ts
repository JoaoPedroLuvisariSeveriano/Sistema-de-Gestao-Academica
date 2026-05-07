import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Enrollment } from './Enrollment';
import { Discipline } from './Discipline';
import { Teacher } from './Teacher';
import { Grade } from './Grade';

export enum DisciplineEnrollmentStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('discipline_enrollments')
export class DisciplineEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  enrollmentId!: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.disciplineEnrollments)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment!: Enrollment;

  @Column('uuid')
  disciplineId!: string;

  @ManyToOne(() => Discipline, (discipline) => discipline.disciplineEnrollments)
  @JoinColumn({ name: 'disciplineId' })
  discipline!: Discipline;

  @Column('uuid', { nullable: true })
  teacherId!: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.disciplineEnrollments)
  @JoinColumn({ name: 'teacherId' })
  teacher!: Teacher;

  @Column({ type: 'int', nullable: true })
  year!: number;

  @Column({ type: 'int', nullable: true })
  period!: number;

  @Column({
    type: 'enum',
    enum: DisciplineEnrollmentStatus,
    default: DisciplineEnrollmentStatus.ACTIVE,
  })
  status!: DisciplineEnrollmentStatus;

  @Column({ nullable: true })
  cancellationDate!: Date;

  @Column({ nullable: true })
  cancellationReason!: string;

  @OneToMany(() => Grade, (grade) => grade.disciplineEnrollment)
  grades!: Grade[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;
}

