// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/LIST-TAREA.DTO.TS (MEJORADO)
import { ApiProperty } from "@nestjs/swagger";
import { EstadosTareasEnum } from "../../enums/estados-tareas.enum";

export class ListTareaDTO {

    // ID de la tarea
    @ApiProperty({ description: 'Identificador único de la tarea' })
    id!: number;

    // Qué es lo que hay que hacer
    @ApiProperty({ description: 'Descripción o título de la tarea' })
    descripcion!: string;

    // Si está pendiente, en curso o terminada
    @ApiProperty({ 
        enum: EstadosTareasEnum,
        description: 'Estado actual de la tarea'
    })
    estado!: EstadosTareasEnum;

    // ✅ NUEVOS CAMPOS OPCIONALES para mejorar información

    @ApiProperty({ 
        type: Date, 
        nullable: true,
        required: false,
        description: 'Fecha de creación de la tarea'
    })
    fechaCreacion?: Date;

    @ApiProperty({ 
        type: Date, 
        nullable: true,
        required: false,
        description: 'Fecha de última actualización'
    })
    fechaActualizacion?: Date;

    @ApiProperty({ 
        type: Number,
        nullable: true,
        required: false,
        description: 'Cantidad de comentarios asociados a la tarea'
    })
    cantidadComentarios?: number;

    @ApiProperty({ 
        type: String,
        nullable: true,
        required: false,
        description: 'Nombre del usuario que creó o modificó la tarea'
    })
    usuarioAsignado?: string;

    @ApiProperty({ 
        type: Number,
        nullable: true,
        required: false,
        description: 'Prioridad de la tarea (1=Baja, 2=Media, 3=Alta)'
    })
    prioridad?: number; // Para futura expansión

    @ApiProperty({ 
        type: Date,
        nullable: true,
        required: false,
        description: 'Fecha de vencimiento estimada'
    })
    fechaVencimiento?: Date; // Para futura expansión
}