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
@Index(['tipoEntidad', 'idEntidad'])
@Index(['idUsuario', 'fechaOperacion'])
export class Auditoria {

    @PrimaryGeneratedColumn()
    id!: number;

    // CORREGIDO: Ahora explícitamente guardará en la columna "tipo_entidad"
    @Column({ 
        name: 'tipo_entidad',
        type: 'varchar', 
        length: 50
    })
    tipoEntidad!: TipoEntidadEnum;

    @Column({ name: 'id_entidad' })
    idEntidad!: number;

    // CORREGIDO: Ahora explícitamente guardará en la columna "tipo_operacion"
    @Column({ 
        name: 'tipo_operacion',
        type: 'varchar', 
        length: 20 
    })
    tipoOperacion!: TipoOperacionEnum;

    @Column({ name: 'id_usuario' })
    idUsuario!: number;

    @Column({ 
        name: 'nombre_usuario',
        length: 100 
    })
    nombreUsuario!: string;

    @Column({ 
        type: 'jsonb', 
        nullable: true,
        comment: 'Estado previo y posterior del registro'
    })
    datosCambio?: any;

    @Column({ 
        type: 'text', 
        nullable: true 
    })
    detalles?: string;

    @CreateDateColumn({ 
        name: 'fecha_operacion',
        precision: 0 
    })
    fechaOperacion!: Date;
}