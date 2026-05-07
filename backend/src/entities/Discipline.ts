import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Course } from './Course';
import { DisciplineEnrollment } from './DisciplineEnrollment';

export enum DisciplineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('disciplines')
export class Discipline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  ementa!: string;

  @Column({ type: 'int', default: 0 })
  workload!: number;

  @Column({ type: 'int', default: 0 })
  credits!: number;

  @Column({ type: 'int', default: 1 })
  period!: number;

  @Column({
    type: 'enum',
    enum: DisciplineStatus,
    default: DisciplineStatus.ACTIVE,
  })
  status!: DisciplineStatus;

  @Column('uuid')
  courseId!: string;

  @ManyToOne(() => Course, (course) => course.disciplines)
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column('uuid', { nullable: true })
  prerequisiteId!: string;

  @ManyToOne(() => Discipline, { nullable: true })
  @JoinColumn({ name: 'prerequisiteId' })
  prerequisite!: Discipline;

  @Column('uuid', { array: true, nullable: true })
  prerequisiteIds!: string[];

  @OneToMany(() => DisciplineEnrollment, (de) => de.discipline)
  disciplineEnrollments!: DisciplineEnrollment[];

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;
}

