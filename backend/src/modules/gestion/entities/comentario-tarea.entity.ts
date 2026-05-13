// BACKEND/SRC/MODULES/GESTION/ENTITIES/COMENTARIO-TAREA.ENTITY.TS
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Tarea } from "./tarea.entity";
import { Usuario } from "../../auth/entitites/usuario.entity";

@Entity({ name: "comentarios_tareas" })
export class ComentarioTarea {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    contenido!: string;

    @Column({ name: "id_tarea" })
    idTarea!: number;

    @Column({ name: "id_usuario" })
    idUsuario!: number;

    @CreateDateColumn()
    fechaCreacion!: Date;

    @UpdateDateColumn()
    fechaActualizacion!: Date;

    // Relaciones
    @ManyToOne(() => Tarea, (tarea) => tarea.comentarios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "id_tarea" })
    tarea!: Tarea;

    @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: "id_usuario" })
    usuario?: Usuario;

}