// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-PROYECTO.DTO.TS

import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsNumber } from "class-validator";
import { Type } from "class-transformer";

import { CreateProyectoDto } from "./create-proyecto.dto";
import { EstadosProyectosEnum } from "../../enums/estados-proyectos.enum";

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {

    @ApiProperty({
        enum: EstadosProyectosEnum,
        example: EstadosProyectosEnum.ACTIVO,
        description: 'Nuevo estado del proyecto para el flujo de trabajo',
        required: false
    })
    @IsOptional()
    @IsEnum(EstadosProyectosEnum, {
        message: 'El estado proporcionado no es un estado de proyecto válido'
    })
    estado?: EstadosProyectosEnum;

    @ApiProperty({
        example: 2,
        description: 'ID del nuevo cliente asociado. Enviar null si pasa a ser proyecto interno.',
        required: false,
        nullable: true
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'El ID del cliente debe ser un valor numérico' })
    idCliente?: number;
}