// BACKEND/SRC/MODULES/GESTION/ENTITIES/CLIENTE.ENTITY.TS
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { Proyecto } from "./proyecto.entity";

@Entity({ name: "clientes" })
export class Cliente {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true }) // Coincide con el UNIQUE de tu Script SQL
    nombre!: string;

    @Column({ 
        type: 'enum', 
        enum: EstadosClientesEnum,
        default: EstadosClientesEnum.ACTIVO // Valor por defecto al crear
    })
    estado!: EstadosClientesEnum;

    // Relación con Proyectos
    @OneToMany(() => Proyecto, (proyecto) => proyecto.cliente)
    proyectos!: Proyecto[];

}