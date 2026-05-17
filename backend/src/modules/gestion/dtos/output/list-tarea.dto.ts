// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/LIST-TAREA.DTO.TS

import { ApiProperty } from "@nestjs/swagger";
import { EstadosTareasEnum } from "../../enums/estados-tareas.enum";

export class ListTareaDTO {

    @ApiProperty({ 
        example: 101, 
        description: 'Identificador único de la tarea' 
    })
    id!: number;

    @ApiProperty({ 
        example: 'Configurar servidor de correo saliente', 
        description: 'Descripción breve de la acción a realizar'
    })
    descripcion!: string;

    @ApiProperty({ 
        enum: EstadosTareasEnum,
        example: EstadosTareasEnum.PENDIENTE,
        description: 'Estado actual en el flujo de trabajo'
    })
    estado!: EstadosTareasEnum;
}