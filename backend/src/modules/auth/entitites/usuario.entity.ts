// BACKEND/SRC/MODULES/AUTH/ENTITITES/USUARIO.ENTITY.TS
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Entity({ name: "usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true }) // Refleja la restricción del Script SQL
    nombre!: string;

    @Column({ select: false }) // ✅ Seguridad: No incluye la clave en las consultas por defecto
    clave!: string;

    @Column({
        type: 'enum',
        enum: EstadosUsuariosEnum
    })
    estado!: EstadosUsuariosEnum;
}