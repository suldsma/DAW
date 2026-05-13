// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-COMENTARIO.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import { ApiProperty } from "@nestjs/swagger";

import {
    IsString,
    MinLength,
    MaxLength,
    IsOptional
} from "class-validator";

import { Transform } from "class-transformer";

export class UpdateComentarioDto {

    /**
     * =====================================================
     * CONTENIDO
     * =====================================================
     */
    @ApiProperty({
        example: 'Comentario actualizado luego de la revisión.',
        description: 'Nuevo contenido del comentario',
        minLength: 1,
        maxLength: 1000,
        required: false
    })
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value
    )
    @IsString({
        message: 'El contenido debe ser un texto'
    })
    @MinLength(1, {
        message: 'El comentario debe tener al menos 1 caracter'
    })
    @MaxLength(1000, {
        message: 'El comentario no puede superar los 1000 caracteres'
    })
    contenido?: string;
}