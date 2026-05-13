// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-PROYECTO.DTO.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import {
    ApiProperty,
    PartialType
} from "@nestjs/swagger";

import {
    IsEnum,
    IsOptional,
    IsNumber
} from "class-validator";

import { Type } from "class-transformer";

// DTO base
import { CreateProyectoDto } from "./create-proyecto.dto";

// Enum
import { EstadosProyectosEnum } from "../../enums/estados-proyectos.enum";

/**
 * =====================================================
 * UPDATE PROYECTO DTO
 * =====================================================
 * Todos los campos heredados desde CreateProyectoDto
 * pasan a ser opcionales automáticamente.
 */
export class UpdateProyectoDto extends PartialType(
    CreateProyectoDto
) {

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */
    @ApiProperty({
        enum: EstadosProyectosEnum,
        example: EstadosProyectosEnum.ACTIVO,
        description: 'Nuevo estado del proyecto',
        required: false
    })
    @IsOptional()
    @IsEnum(
        EstadosProyectosEnum,
        {
            message: 'Estado de proyecto inválido'
        }
    )
    estado?: EstadosProyectosEnum;

    /**
     * =====================================================
     * ID CLIENTE
     * =====================================================
     */
    @ApiProperty({
        example: 2,
        description: 'ID del nuevo cliente asociado',
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