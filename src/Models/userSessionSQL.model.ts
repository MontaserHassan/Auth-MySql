import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserSQL } from "./userSQL.model";


@Entity()
export class UserSessionSQL {

  @PrimaryGeneratedColumn()
  _id: number;

  @ManyToOne(() => UserSQL, (user) => user.sessions)
  user: number

  @Column({ type: 'varchar', length: 255, nullable: false })
  token_id: string;

  @Column({ type: 'boolean', nullable: false, default: true })
  active: boolean;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ type: 'timestamp', nullable: false })
  expire_date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

};