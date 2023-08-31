// -------------------------------- typeORM -------------------------------------


import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import * as bcrypt from 'bcrypt';
import { UserSessionSQL } from "./userSessionSQL.model";


@Entity()
export class UserSQL {

    @PrimaryGeneratedColumn()
    _id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    firstName: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    lastName: string;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: false, default: 'User' })
    role: string;

    @Column({ type: 'simple-array', nullable: true })
    permission: string[];

    @Column({ type: 'boolean', nullable: false, default: false })
    confirm_email: boolean;

    @Column({ type: 'boolean', nullable: false, default: false })
    isBlocked: boolean;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    lastSeen: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    googleToken: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    githubToken: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    facebookToken: string;

    @Column({ type: 'boolean', nullable: false, default: false })
    authByThirdParty: boolean;

    @Column({ type: 'timestamp', nullable: true })
    unlockLoginTime: Date;

    @Column({ type: 'integer', nullable: false, default: 0 })
    failedLoginAttempts: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    password: string;

    @OneToMany(() => UserSessionSQL, (session) => session.user)
    sessions: UserSessionSQL[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


    async checkPasswordIsValid(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
};
