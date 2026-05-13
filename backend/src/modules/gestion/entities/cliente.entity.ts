// BACKEND/SRC/MODULES/GESTION/ENTITIES/CLIENTE.ENTITY.TS
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { Proyecto } from "./proyecto.entity";

@Entity({ name: "clientes" })
export class Cliente {

    // ID autoincremental de la tabla
    @PrimaryGeneratedColumn()
    id!: number;

    // Nombre único del cliente para evitar duplicados
    @Column({ unique: true }) 
    nombre!: string;

    // Estado del cliente usando el enum (por defecto activo)
    @Column({ 
        type: 'enum', 
        enum: EstadosClientesEnum,
        default: EstadosClientesEnum.ACTIVO 
    })
    estado!: EstadosClientesEnum;

    // Un cliente puede tener muchos proyectos asociados
    @OneToMany(() => Proyecto, (proyecto) => proyecto.cliente)
    proyectos!: Proyecto[];

}