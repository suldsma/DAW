// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-TAREA.DTO.TS

import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
    MaxLength
} from "class-validator";
import { Transform } from "class-transformer";

import { EstadosTareasEnum } from "../../enums/estados-tareas.enum";
import { CreateTareaDto } from "./create-tarea.dto";

export class UpdateTareaDto extends PartialType(CreateTareaDto) {

    @ApiPropertyOptional({
        example: 'Implementar autenticación JWT y Guards',
        description: 'Nueva descripción de la tarea',
        minLength: 3,
        maxLength: 500
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
    @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres' })
    descripcion?: string;

    @ApiPropertyOptional({
        enum: EstadosTareasEnum,
        example: EstadosTareasEnum.PENDIENTE,
        description: 'Estado actual de la tarea dentro del flujo de trabajo'
    })
    @IsOptional()
    @IsEnum(EstadosTareasEnum, {
        message: 'El estado proporcionado no es un estado de tarea válido'
    })
    estado?: EstadosTareasEnum;
}