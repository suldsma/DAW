// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-TAREA.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import { ApiProperty } from "@nestjs/swagger";

import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";

import { Transform } from "class-transformer";

export class CreateTareaDto {

    /**
     * =====================================================
     * DESCRIPCIÓN
     * =====================================================
     */
    @ApiProperty({
        example: 'Implementar autenticación JWT en el backend',
        description: 'Descripción de la tarea',
        minLength: 3,
        maxLength: 500
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value
    )
    @IsString({
        message: 'La descripción debe ser un texto'
    })
    @IsNotEmpty({
        message: 'La descripción es obligatoria'
    })
    @MinLength(3, {
        message: 'La descripción debe tener al menos 3 caracteres'
    })
    @MaxLength(500, {
        message: 'La descripción no puede superar los 500 caracteres'
    })
    descripcion!: string;
}