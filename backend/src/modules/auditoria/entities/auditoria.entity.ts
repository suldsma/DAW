// BACKEND/SRC/MODULES/AUDITORIA/ENTITIES/AUDITORIA.ENTITY.TS
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Index } from "typeorm";

export enum TipoEntidadEnum {
    USUARIO = 'USUARIO',
    CLIENTE = 'CLIENTE',
    PROYECTO = 'PROYECTO',
    TAREA = 'TAREA'
}

export enum TipoOperacionEnum {
    CREAR = 'CREAR',
    ACTUALIZAR = 'ACTUALIZAR',
    ELIMINAR = 'ELIMINAR'
}

@Entity({ name: "auditorias" })
@Index(['idEntidad', 'tipoEntidad'])
@Index(['idUsuario', 'fechaOperacion'])
export class Auditoria {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'enum', enum: TipoEntidadEnum })
    tipoEntidad!: TipoEntidadEnum;

    @Column()
    idEntidad!: number;

    @Column({ type: 'enum', enum: TipoOperacionEnum })
    tipoOperacion!: TipoOperacionEnum;

    @Column()
    idUsuario!: number;

    @Column()
    nombreUsuario!: string;

    @Column({ type: 'text', nullable: true })
    datosCambio?: string; // JSON con los cambios realizados

    @Column({ type: 'text', nullable: true })
    detalles?: string;

    @CreateDateColumn()
    fechaOperacion!: Date;

}