// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-CLIENTE.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import { ApiProperty } from "@nestjs/swagger";

import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";

import { Transform } from "class-transformer";

import { EstadosClientesEnum } from "../../enums/estados-clientes.enum";

export class UpdateClienteDto {

    /**
     * =====================================================
     * NOMBRE
     * =====================================================
     */
    @ApiProperty({
        example: 'Empresa Tech Solutions',
        description: 'Nuevo nombre del cliente',
        required: false,
        minLength: 2,
        maxLength: 120
    })
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string'
            ? value.trim()
            : value
    )
    @IsString({
        message: 'El nombre debe ser un texto'
    })
    @MinLength(2, {
        message: 'El nombre debe tener al menos 2 caracteres'
    })
    @MaxLength(120, {
        message: 'El nombre no puede superar los 120 caracteres'
    })
    nombre?: string;

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */
    @ApiProperty({
        enum: EstadosClientesEnum,
        example: EstadosClientesEnum.ACTIVO,
        required: false,
        description: 'Estado actual del cliente'
    })
    @IsOptional()
    @IsEnum(
        EstadosClientesEnum,
        {
            message: 'Estado de cliente inválido'
        }
    )
    estado?: EstadosClientesEnum;
}