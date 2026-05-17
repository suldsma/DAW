// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-PROYECTO.DTO.TS

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

    @ApiProperty({
        example: 'Implementación ERP Fase 1',
        description: 'Nombre descriptivo y único para identificar el proyecto',
        minLength: 3,
        maxLength: 150
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    @MaxLength(150, { message: 'El nombre no puede exceder los 150 caracteres' })
    nombre!: string;

    @ApiProperty({
        example: 1,
        description: 'ID del cliente (procedente de la tabla clientes). Opcional para proyectos internos.',
        required: false,
        nullable: true
    })
    @IsOptional()
    @Type(() => Number) // Convierte a number si el dato llega como string desde multipart/form-data o query
    @IsNumber({}, { message: 'El ID del cliente debe ser un valor numérico válido' })
    idCliente?: number;
}