// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/LIST-PROYECTO.DTO.TS

import { ApiProperty } from "@nestjs/swagger";
import { EstadosProyectosEnum } from "../../enums/estados-proyectos.enum";
import { ListClienteDTO } from "./list-cliente.dto";

export class ListProyectoDTO {

    @ApiProperty({ 
        example: 1, 
        description: 'ID único del proyecto' 
    })
    id!: number;

    @ApiProperty({ 
        example: 'Desarrollo App Móvil', 
        description: 'Nombre del proyecto' 
    })
    nombre!: string;

    @ApiProperty({ 
        enum: EstadosProyectosEnum, 
        example: EstadosProyectosEnum.ACTIVO,
        description: 'Estado actual del flujo de trabajo' 
    })
    estado!: EstadosProyectosEnum;

    @ApiProperty({ 
        type: () => ListClienteDTO, 
        nullable: true,
        description: 'Objeto cliente o null si es un proyecto interno'
    })
    cliente?: ListClienteDTO | null;
}