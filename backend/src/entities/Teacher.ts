import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DisciplineEnrollment } from './DisciplineEnrollment';
import { User } from './User';

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('teachers')
export class Teacher {
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
  department!: string;

  @Column({ nullable: true })
  titulation!: string; // Titulação: Especialista, Mestre, Doutor

  @Column({ nullable: true })
  formation!: string; // Formação acadêmica

  @Column({
    type: 'enum',
    enum: TeacherStatus,
    default: TeacherStatus.ACTIVE,
  })
  status!: TeacherStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  updatedAt!: Date;

  @OneToMany(() => DisciplineEnrollment, (de) => de.teacher)
  disciplineEnrollments!: DisciplineEnrollment[];

  @OneToMany(() => User, (user) => user.teacher)
  users!: User[];
}

