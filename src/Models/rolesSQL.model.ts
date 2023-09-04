import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class RolesSQL {

    @PrimaryGeneratedColumn()
    _id: number;

    @Column({ type: 'varchar', nullable: false })
    role: string

    @Column({ type: 'simple-array', nullable: false })
    permissions: string[]

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

};