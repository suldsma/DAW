// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-TAREA.DTO.TS

import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateTareaDto {

    @ApiProperty({
        example: 'Diseñar la interfaz del tablero Kanban',
        description: 'Detalle claro y conciso de la tarea a realizar',
        minLength: 3,
        maxLength: 500
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La descripción de la tarea no puede estar vacía' })
    @MinLength(3, { message: 'La descripción es muy corta (mínimo 3 caracteres)' })
    @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
    descripcion!: string;
}