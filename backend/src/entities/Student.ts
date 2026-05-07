import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Enrollment } from './Enrollment';
import { AcademicHistory } from './AcademicHistory';
import { User } from './User';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  cpf!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  birthDate!: Date;

  @Column({ unique: true })
  registrationNumber!: string; // Generated automatically (ANO + SEQUENCIAL)

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status!: StudentStatus;

  @Column({ nullable: true })
  inactiveReason!: string;

  @Column({ nullable: true })
  inactiveDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  // Using Column with nullable for updatedAt instead of UpdateDateColumn
  @Column({ nullable: true })
  updatedAt!: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments!: Enrollment[];

  @OneToMany(() => AcademicHistory, (history) => history.student)
  academicHistory!: AcademicHistory[];

  @OneToMany(() => User, (user) => user.student)
  users!: User[];
}

