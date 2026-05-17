import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";

import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { Proyecto } from "./proyecto.entity";

@Entity({ name: "clientes" })
export class Cliente {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'text',
        unique: true,
        nullable: false
    })
    nombre!: string;

    @Column({
        type: 'enum',
        enum: EstadosClientesEnum,
        nullable: false
    })
    estado!: EstadosClientesEnum;

    @OneToMany(
        () => Proyecto,
        (proyecto) => proyecto.cliente,
        {
            cascade: false,
            eager: false
        }
    )
    proyectos!: Proyecto[];
}