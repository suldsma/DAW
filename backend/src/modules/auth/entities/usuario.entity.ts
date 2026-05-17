import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Entity({ name: "usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ 
        type: 'text', 
        unique: true,
        nullable: false 
    })
    nombre!: string;

    @Column({ 
        type: 'text', 
        select: false,
        nullable: false 
    })
    clave!: string;

    @Column({
        type: 'enum',
        enum: EstadosUsuariosEnum,
        enumName: 'estados_usuarios', 
        nullable: false
    })
    estado!: EstadosUsuariosEnum;
}