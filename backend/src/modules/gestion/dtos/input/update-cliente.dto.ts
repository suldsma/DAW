// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-CLIENTE.DTO.TS

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

    @ApiProperty({
        example: 'Empresa Tech Solutions Modificada',
        description: 'Nuevo nombre o razón social del cliente',
        required: false,
        minLength: 2,
        maxLength: 120
    })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @MinLength(2, { message: 'El nombre es demasiado corto (mínimo 2 caracteres)' })
    @MaxLength(120, { message: 'El nombre excede el límite permitido de 120 caracteres' })
    nombre?: string;

    @ApiProperty({
        enum: EstadosClientesEnum,
        example: EstadosClientesEnum.ACTIVO,
        required: false,
        description: 'Estado administrativo del cliente'
    })
    @IsOptional()
    @IsEnum(EstadosClientesEnum, {
        message: 'El estado proporcionado no es un estado de cliente válido'
    })
    estado?: EstadosClientesEnum;
}