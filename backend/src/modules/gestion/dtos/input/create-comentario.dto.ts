// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-COMENTARIO.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import { ApiProperty } from "@nestjs/swagger";

import {
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength
} from "class-validator";

import { Transform } from "class-transformer";

export class CreateComentarioDto {

    /**
     * =====================================================
     * CONTENIDO
     * =====================================================
     */
    @ApiProperty({
        example: 'Se actualizó el estado de la tarea y quedó lista para revisión.',
        description: 'Contenido del comentario',
        minLength: 1,
        maxLength: 1000
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value
    )
    @IsString({
        message: 'El contenido debe ser un texto'
    })
    @IsNotEmpty({
        message: 'El contenido del comentario es obligatorio'
    })
    @MinLength(1, {
        message: 'El comentario debe tener al menos 1 caracter'
    })
    @MaxLength(1000, {
        message: 'El comentario no puede superar los 1000 caracteres'
    })
    contenido!: string;
}