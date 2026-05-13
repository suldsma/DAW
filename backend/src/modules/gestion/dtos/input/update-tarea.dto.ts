// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-TAREA.DTO.TS

import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";

import {
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
    MaxLength
} from "class-validator";

import { EstadosTareasEnum } from "../../enums/estados-tareas.enum";

import { CreateTareaDto } from "./create-tarea.dto";

/**
 * =====================================================
 * DTO - ACTUALIZAR TAREA
 * =====================================================
 * Hereda propiedades de CreateTareaDto
 * y las convierte en opcionales.
 */
export class UpdateTareaDto extends PartialType(
    CreateTareaDto
) {

    /**
     * =====================================================
     * DESCRIPCIÓN
     * =====================================================
     */
    @ApiPropertyOptional({
        example: 'Implementar autenticación JWT',
        description: 'Nueva descripción de la tarea',
        minLength: 3,
        maxLength: 255
    })
    @IsString({
        message: 'La descripción debe ser texto'
    })
    @MinLength(3, {
        message: 'La descripción debe tener al menos 3 caracteres'
    })
    @MaxLength(255, {
        message: 'La descripción no puede superar 255 caracteres'
    })
    @IsOptional()
    descripcion?: string;

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */
    @ApiPropertyOptional({
        enum: EstadosTareasEnum,
        example: EstadosTareasEnum.PENDIENTE,
        description: 'Nuevo estado de la tarea'
    })
    @IsEnum(EstadosTareasEnum, {
        message: 'Estado de tarea inválido'
    })
    @IsOptional()
    estado?: EstadosTareasEnum;

}