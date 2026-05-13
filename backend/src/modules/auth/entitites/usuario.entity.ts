// BACKEND/SRC/MODULES/AUTH/ENTITITES/USUARIO.ENTITY.TS
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Entity({ name: "usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true }) // Nombre único según el SQL
    nombre!: string;

    @Column({ select: false }) // Por seguridad, no traemos la clave en los select
    clave!: string;

    @Column({
        type: 'enum',
        enum: EstadosUsuariosEnum
    })
    estado!: EstadosUsuariosEnum;
}