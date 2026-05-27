import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";

import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { Cliente } from "./cliente.entity";
import { Tarea } from "./tarea.entity";

@Entity({ name: "proyectos" })
export class Proyecto {

    @PrimaryGeneratedColumn()
    id!: number;

    @Index('IDX_PROYECTO_NOMBRE_UNICO', { unique: true })
    @Column({
        type: 'varchar',
        length: 150,
        unique: true,
        nullable: false
    })
    nombre!: string;

    @Column({
        type: 'enum',
        enum: EstadosProyectosEnum,
        default: EstadosProyectosEnum.ACTIVO,
        nullable: false
    })
    estado!: EstadosProyectosEnum;

    @Column({
        type: 'int',
        nullable: true
    })
    idCliente?: number | null;

    @ManyToOne(
        () => Cliente,
        (cliente) => cliente.proyectos,
        {
            nullable: true,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
            eager: false
        }
    )
    @JoinColumn({ name: "idCliente" })
    cliente?: Cliente | null;

    @OneToMany(
        () => Tarea,
        (tarea) => tarea.proyecto,
        {
            cascade: false,
            eager: false
        }
    )
    tareas!: Tarea[];

    @Column({
        type: 'date',
        nullable: true,
        comment: 'Fecha objetiva de finalización del proyecto'
    })
    fechaFinalizacionObjetivo?: Date | null;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fechaActualizacion!: Date;

    @CreateDateColumn({
        type: 'timestamp'
    })
    fechaCreacion!: Date;
}