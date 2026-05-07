import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Discipline } from './Discipline';
import { Enrollment } from './Enrollment';

export enum CourseModality {
  PRESENCIAL = 'Presencial',
  EAD = 'EAD',
  HIBRIDO = 'Híbrido',
}

export enum CourseType {
  GRADUACAO = 'graduacao',
  POS_GRADUACAO = 'pos_graduacao',
  TECNICO = 'tecnico',
  LIVRE = 'livre',
}

export enum CourseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'int', default: 0 })
  workload!: number;

  @Column({
    type: 'enum',
    enum: CourseModality,
    default: CourseModality.PRESENCIAL,
  })
  modality!: CourseModality;

  @Column({
    type: 'enum',
    enum: CourseType,
    default: CourseType.GRADUACAO,
  })
  type!: CourseType;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.ACTIVE,
  })
  status!: CourseStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;

  @OneToMany(() => Discipline, (discipline) => discipline.course)
  disciplines!: Discipline[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments!: Enrollment[];
}

