// BACKEND/SRC/MODULES/GESTION/ENTITIES/PROYECTO.ENTITY.TS
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { Cliente } from "./cliente.entity";
import { Tarea } from "./tarea.entity";

@Entity({ name: "proyectos" })
export class Proyecto {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true }) // Según el Script SQL, el nombre es UNIQUE
    nombre!: string;

    @Column({ 
        type: 'enum', 
        enum: EstadosProyectosEnum,
        default: EstadosProyectosEnum.ACTIVO 
    })
    estado!: EstadosProyectosEnum;

    // Permitimos null para proyectos internos de la empresa
    @Column({ name: "id_cliente", nullable: true }) 
    idCliente?: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.proyectos, { nullable: true })
    @JoinColumn({ name: "id_cliente" })
    cliente?: Cliente;

    // Relación con Tareas
    // Importante: onDelete: 'CASCADE' ayuda si quieres que al borrar el proyecto se borren sus tareas
    @OneToMany(() => Tarea, (tarea) => tarea.proyecto, { cascade: true })
    tareas!: Tarea[];
}