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
// Índices compuestos para optimizar las búsquedas más frecuentes del historial
@Index(['tipoEntidad', 'idEntidad'])
@Index(['idUsuario', 'fechaOperacion'])
export class Auditoria {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ 
        type: 'varchar', // Se usa varchar en lugar de enum nativo de Postgres para facilitar migraciones y cambios futuros
        length: 50
    })
    tipoEntidad!: TipoEntidadEnum;

    @Column({ name: 'id_entidad' })
    idEntidad!: number;

    @Column({ 
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
        type: 'jsonb', // jsonb en Postgres permite indexar y consultar subpropiedades eficientemente
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