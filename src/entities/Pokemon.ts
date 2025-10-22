import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pokemon')
export class Pokemon {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 10 })
    pokedex_number!: string;

    @Column({ type: 'varchar', length: 50 })
    name!: string;

    @Column('text')
    description!: string;

    @Column({ type: 'varchar', length: 100 })
    types!: string;

    @Column('float')
    height!: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    category?: string;

    @Column('float')
    weight!: number;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gender?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    abilities?: string;
}
