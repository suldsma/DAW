// BACKEND/SRC/MODULES/GESTION/ENTITIES/TAREA.ENTITY.TS
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";
import { Proyecto } from "./proyecto.entity";

@Entity({ name: "tareas" })
export class Tarea {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    descripcion!: string;

    @Column({ 
        type: "enum", 
        enum: EstadosTareasEnum,
        default: EstadosTareasEnum.PENDIENTE // Valor inicial por defecto
    })
    estado!: EstadosTareasEnum;

    @Column({ name: "id_proyecto" })
    idProyecto!: number;

    // Relación con Proyecto
    // Agregamos (proyecto) => proyecto.tareas para que TypeORM conecte ambos lados
    @ManyToOne(() => Proyecto, (proyecto) => proyecto.tareas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "id_proyecto" })
    proyecto!: Proyecto;

}