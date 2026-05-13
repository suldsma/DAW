// BACKEND/SRC/MODULES/GESTION/ENTITIES/TAREA.ENTITY.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

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

// Enums
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";

// Entidades relacionadas
import { Proyecto } from "./proyecto.entity";
import { ComentarioTarea } from "./comentario-tarea.entity";

@Entity({ name: "tareas" })
export class Tarea {

    /**
     * =====================================================
     * ID
     * =====================================================
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * =====================================================
     * DESCRIPCIÓN
     * =====================================================
     */
    @Index('IDX_TAREA_DESCRIPCION')
    @Column({
        type: 'varchar',
        length: 500
    })
    descripcion!: string;

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */
    @Column({
        type: "enum",
        enum: EstadosTareasEnum,
        default: EstadosTareasEnum.PENDIENTE
    })
    estado!: EstadosTareasEnum;

    /**
     * =====================================================
     * FK PROYECTO
     * =====================================================
     */
    @Column({
        name: "id_proyecto",
        type: 'int'
    })
    idProyecto!: number;

    /**
     * =====================================================
     * RELACIÓN PROYECTO
     * =====================================================
     */
    @ManyToOne(
        () => Proyecto,
        (proyecto) => proyecto.tareas,
        {
            nullable: false,

            /**
             * Si eliminan proyecto:
             * eliminar tareas relacionadas
             */
            onDelete: 'CASCADE',

            /**
             * Si cambia ID proyecto
             */
            onUpdate: 'CASCADE',

            eager: false
        }
    )
    @JoinColumn({
        name: "id_proyecto"
    })
    proyecto!: Proyecto;

    /**
     * =====================================================
     * RELACIÓN COMENTARIOS
     * =====================================================
     */
    @OneToMany(
        () => ComentarioTarea,
        (comentario) => comentario.tarea,
        {
            cascade: false,
            eager: false
        }
    )
    comentarios!: ComentarioTarea[];

    /**
     * =====================================================
     * FECHAS AUDITORÍA
     * =====================================================
     */

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