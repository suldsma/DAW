import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";

import { EstadosTareasEnum } from "../enums/estados-tareas.enum";
import { Proyecto } from "./proyecto.entity";

@Entity({ name: "tareas" })
export class Tarea {

    @PrimaryGeneratedColumn()
    id!: number;

    @Index('IDX_TAREA_DESCRIPCION')
    @Column({
        type: 'varchar',
        length: 500
    })
    descripcion!: string;

    @Column({
        type: "enum",
        enum: EstadosTareasEnum,
        default: EstadosTareasEnum.PENDIENTE
    })
    estado!: EstadosTareasEnum;

    @Column({
        name: "id_proyecto",
        type: 'int'
    })
    idProyecto!: number;

    @ManyToOne(
        () => Proyecto,
        (proyecto) => proyecto.tareas,
        {
            nullable: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            eager: false
        }
    )
    @JoinColumn({ name: "id_proyecto" })
    proyecto!: Proyecto;

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