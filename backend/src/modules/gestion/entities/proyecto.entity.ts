// BACKEND/SRC/MODULES/GESTION/ENTITIES/PROYECTO.ENTITY.TS

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
        unique: true
    })
    nombre!: string;

    @Column({
        type: 'enum',
        enum: EstadosProyectosEnum,
        default: EstadosProyectosEnum.ACTIVO
    })
    estado!: EstadosProyectosEnum;

    @Column({
        name: "id_cliente",
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
    @JoinColumn({ name: "id_cliente" })
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

    @CreateDateColumn({
        name: 'fecha_creacion',
        type: 'timestamp'
    })
    fechaCreacion!: Date;

    @UpdateDateColumn({
        name: 'fecha_actualizacion',
        type: 'timestamp'
    })
    fechaActualizacion!: Date;
}