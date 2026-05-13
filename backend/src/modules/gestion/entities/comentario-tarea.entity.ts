// BACKEND/SRC/MODULES/GESTION/ENTITIES/COMENTARIO-TAREA.ENTITY.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

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

// Entidades relacionadas
import { Tarea } from "./tarea.entity";
import { Usuario } from "../../auth/entitites/usuario.entity";

@Entity({ name: "comentarios_tareas" })
export class ComentarioTarea {

    /**
     * =====================================================
     * ID
     * =====================================================
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * =====================================================
     * CONTENIDO
     * =====================================================
     */
    @Column({
        type: 'text'
    })
    contenido!: string;

    /**
     * =====================================================
     * FK TAREA
     * =====================================================
     */
    @Index('IDX_COMENTARIO_ID_TAREA')
    @Column({
        name: "id_tarea",
        type: 'int'
    })
    idTarea!: number;

    /**
     * =====================================================
     * FK USUARIO
     * =====================================================
     */
    @Index('IDX_COMENTARIO_ID_USUARIO')
    @Column({
        name: "id_usuario",
        type: 'int',
        nullable: true
    })
    idUsuario!: number | null;

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

    /**
     * =====================================================
     * RELACIÓN TAREA
     * =====================================================
     */
    @ManyToOne(
        () => Tarea,
        (tarea) => tarea.comentarios,
        {
            nullable: false,

            /**
             * Si eliminan tarea:
             * eliminar comentarios
             */
            onDelete: 'CASCADE',

            /**
             * Si cambia ID tarea
             */
            onUpdate: 'CASCADE',

            eager: false
        }
    )
    @JoinColumn({
        name: "id_tarea"
    })
    tarea!: Tarea;

    /**
     * =====================================================
     * RELACIÓN USUARIO
     * =====================================================
     */
    @ManyToOne(
        () => Usuario,
        {
            nullable: true,

            /**
             * Si eliminan usuario:
             * conservar comentario
             */
            onDelete: 'SET NULL',

            /**
             * Si cambia ID usuario
             */
            onUpdate: 'CASCADE',

            eager: false
        }
    )
    @JoinColumn({
        name: "id_usuario"
    })
    usuario?: Usuario | null;
}