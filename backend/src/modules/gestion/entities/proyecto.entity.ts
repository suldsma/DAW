// BACKEND/SRC/MODULES/GESTION/ENTITIES/PROYECTO.ENTITY.TS
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
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

// Entidades relacionadas
import { Cliente } from "./cliente.entity";
import { Tarea } from "./tarea.entity";

@Entity({ name: "proyectos" })
export class Proyecto {

    /**
     * =====================================================
     * ID
     * =====================================================
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * =====================================================
     * NOMBRE
     * =====================================================
     * Nombre único del proyecto
     */
    @Index('IDX_PROYECTO_NOMBRE_UNICO', { unique: true })
    @Column({
        type: 'varchar',
        length: 150,
        unique: true
    })
    nombre!: string;

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */
    @Column({
        type: 'enum',
        enum: EstadosProyectosEnum,
        default: EstadosProyectosEnum.ACTIVO
    })
    estado!: EstadosProyectosEnum;

    /**
     * =====================================================
     * FOREIGN KEY CLIENTE
     * =====================================================
     * Puede ser null para proyectos internos
     */
    @Column({
        name: "id_cliente",
        type: 'int',
        nullable: true
    })
    idCliente?: number | null;

    /**
     * =====================================================
     * RELACIÓN CLIENTE
     * =====================================================
     */
    @ManyToOne(
        () => Cliente,
        (cliente) => cliente.proyectos,
        {
            nullable: true,

            /**
             * Si eliminan cliente:
             * NO borrar proyectos automáticamente
             */
            onDelete: 'SET NULL',

            /**
             * Si cambia ID cliente
             */
            onUpdate: 'CASCADE',

            eager: false
        }
    )
    @JoinColumn({
        name: "id_cliente"
    })
    cliente?: Cliente | null;

    /**
     * =====================================================
     * RELACIÓN TAREAS
     * =====================================================
     */
    @OneToMany(
        () => Tarea,
        (tarea) => tarea.proyecto,
        {
            cascade: false,
            eager: false
        }
    )
    tareas!: Tarea[];

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