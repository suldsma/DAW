// BACKEND/SRC/MODULES/GESTION/ENTITIES/PROYECTO.ENTITY.TS
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { Cliente } from "./cliente.entity";
import { Tarea } from "./tarea.entity";

@Entity({ name: "proyectos" })
export class Proyecto {

    // ID del proyecto
    @PrimaryGeneratedColumn()
    id!: number;

    // Nombre del proyecto (no se puede repetir)
    @Column({ unique: true }) 
    nombre!: string;

    // Estado actual del proyecto (por defecto Activo)
    @Column({ 
        type: 'enum', 
        enum: EstadosProyectosEnum,
        default: EstadosProyectosEnum.ACTIVO 
    })
    estado!: EstadosProyectosEnum;

    // FK del cliente, puede ser null si es un proyecto interno
    @Column({ name: "id_cliente", nullable: true }) 
    idCliente?: number;

    // Relación con la tabla de clientes
    @ManyToOne(() => Cliente, (cliente) => cliente.proyectos, { nullable: true })
    @JoinColumn({ name: "id_cliente" })
    cliente?: Cliente;

    // Un proyecto tiene muchas tareas asociadas
    @OneToMany(() => Tarea, (tarea) => tarea.proyecto, { cascade: true })
    tareas!: Tarea[];
}