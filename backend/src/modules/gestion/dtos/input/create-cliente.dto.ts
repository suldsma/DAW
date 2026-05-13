// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-CLIENTE.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import { ApiProperty } from "@nestjs/swagger";

import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";

import { Transform } from "class-transformer";

export class CreateClienteDto {

    /**
     * =====================================================
     * NOMBRE
     * =====================================================
     */
    @ApiProperty({
        example: 'Empresa Tech Solutions',
        description: 'Nombre del cliente',
        minLength: 2,
        maxLength: 120
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value
    )
    @IsString({
        message: 'El nombre debe ser un texto'
    })
    @IsNotEmpty({
        message: 'El nombre es obligatorio'
    })
    @MinLength(2, {
        message: 'El nombre debe tener al menos 2 caracteres'
    })
    @MaxLength(120, {
        message: 'El nombre no puede superar los 120 caracteres'
    })
    nombre!: string;
}