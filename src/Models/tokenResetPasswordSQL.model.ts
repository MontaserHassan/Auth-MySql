import { Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm"
import { UserSQL } from "./userSQL.model";


@Entity()
export class TokenResetPasswordSQL {

    @PrimaryGeneratedColumn()
    _id: number;

    @OneToOne(() => UserSQL)
    @JoinColumn()
    user: number

    @Column({ type: 'varchar', nullable: false })
    token: string

    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    // createdAt: Date

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

};