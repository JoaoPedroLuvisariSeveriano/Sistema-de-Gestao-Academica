import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { nullable: true })
  userId!: string;

  @Column()
  action!: string;

  @Column()
  tableName!: string;

  @Column('uuid', { nullable: true })
  recordId!: string;

  @Column({ type: 'jsonb', nullable: true })
  oldData!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  newData!: Record<string, unknown>;

  @Column({ nullable: true })
  ipAddress!: string;

  @Column({ nullable: true })
  userAgent!: string;

  @CreateDateColumn()
  timestamp!: Date;
}

