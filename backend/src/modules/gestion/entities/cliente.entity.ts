// BACKEND/SRC/MODULES/GESTION/ENTITIES/CLIENTE.ENTITY.TS

import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";

// ======================================================
// ENUMS
// ======================================================

import { EstadosClientesEnum } from "../enums/estados-clientes.enum";

// ======================================================
// ENTITIES
// ======================================================

import { Proyecto } from "./proyecto.entity";

@Entity({
    name: "clientes"
})
export class Cliente {

    /**
     * ======================================================
     * ID
     * ======================================================
     */
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * ======================================================
     * NOMBRE
     * ======================================================
     * Cliente único
     */
    @Index({
        unique: true
    })
    @Column({

        type: 'varchar',

        length: 150,

        nullable: false
    })
    nombre!: string;

    /**
     * ======================================================
     * ESTADO
     * ======================================================
     */
    @Column({

        type: 'enum',

        enum: EstadosClientesEnum,

        default: EstadosClientesEnum.ACTIVO
    })
    estado!: EstadosClientesEnum;

    /**
     * ======================================================
     * FECHA CREACIÓN
     * ======================================================
     */
    @CreateDateColumn({
        type: 'timestamp'
    })
    fechaCreacion!: Date;

    /**
     * ======================================================
     * FECHA ACTUALIZACIÓN
     * ======================================================
     */
    @UpdateDateColumn({
        type: 'timestamp'
    })
    fechaActualizacion!: Date;

    /**
     * ======================================================
     * RELACIÓN PROYECTOS
     * ======================================================
     */
    @OneToMany(

        () => Proyecto,

        (proyecto) => proyecto.cliente,

        {

            /**
             * IMPORTANTE:
             * Nunca cascada DELETE acá
             */
            cascade: false,

            /**
             * Evita carga automática pesada
             */
            eager: false
        }
    )
    proyectos!: Proyecto[];
}