// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-PROYECTO.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import { ApiProperty } from "@nestjs/swagger";

import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";

import { Transform, Type } from "class-transformer";

export class CreateProyectoDto {

    /**
     * =====================================================
     * NOMBRE
     * =====================================================
     */
    @ApiProperty({
        example: 'Sistema Contable',
        description: 'Nombre único del proyecto',
        minLength: 3,
        maxLength: 150
    })
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value
    )
    @IsString({
        message: 'El nombre debe ser una cadena de texto'
    })
    @IsNotEmpty({
        message: 'El nombre del proyecto es obligatorio'
    })
    @MinLength(3, {
        message: 'El nombre debe tener al menos 3 caracteres'
    })
    @MaxLength(150, {
        message: 'El nombre no puede superar los 150 caracteres'
    })
    nombre!: string;

    /**
     * =====================================================
     * ID CLIENTE
     * =====================================================
     * Opcional para proyectos internos
     */
    @ApiProperty({
        example: 1,
        description: 'ID del cliente asociado al proyecto',
        required: false,
        nullable: true
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        {},
        {
            message: 'El ID del cliente debe ser un número'
        }
    )
    idCliente?: number;
}