// BACKEND/SRC/MODULES/GESTION/ENTITIES/TAREA.ENTITY.TS
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadosTareasEnum } from "../enums/estados-tareas.enum";
import { Proyecto } from "./proyecto.entity";
import { ComentarioTarea } from "./comentario-tarea.entity";

@Entity({ name: "tareas" })
export class Tarea {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    descripcion!: string;

    @Column({ 
        type: "enum", 
        enum: EstadosTareasEnum,
        default: EstadosTareasEnum.PENDIENTE
    })
    estado!: EstadosTareasEnum;

    @Column({ name: "id_proyecto" })
    idProyecto!: number;

    // Relación con Proyecto
    @ManyToOne(() => Proyecto, (proyecto) => proyecto.tareas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "id_proyecto" })
    proyecto!: Proyecto;

    // ✅ NUEVA RELACIÓN: Comentarios en tareas
    @OneToMany(() => ComentarioTarea, (comentario) => comentario.tarea, { cascade: true })
    comentarios!: ComentarioTarea[];

}