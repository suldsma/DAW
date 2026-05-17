// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/PROYECTO.DTO.TS

import { ApiProperty } from "@nestjs/swagger";
import { EstadosProyectosEnum } from "../../enums/estados-proyectos.enum";
import { ListTareaDTO } from "./list-tarea.dto";

export class ProyectoDTO {

    @ApiProperty({ 
        example: 1, 
        description: 'ID único del proyecto' 
    })
    id!: number;

    @ApiProperty({ 
        example: 'Desarrollo de Portal E-commerce', 
        description: 'Nombre del proyecto' 
    })
    nombre!: string;

    @ApiProperty({ 
        enum: EstadosProyectosEnum, 
        example: EstadosProyectosEnum.ACTIVO,
        description: 'Estado actual del ciclo de vida del proyecto' 
    })
    estado!: EstadosProyectosEnum;

    @ApiProperty({ 
        example: 'Empresa Tech Solutions', 
        nullable: true,
        description: 'Nombre del cliente o null si es un proyecto interno'
    })
    cliente?: string | null;

    @ApiProperty({ 
        type: () => ListTareaDTO, 
        isArray: true,
        description: 'Listado de tareas pertenecientes a este proyecto'
    })
    tareas!: ListTareaDTO[];
}