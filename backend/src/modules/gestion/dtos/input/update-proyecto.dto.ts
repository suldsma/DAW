import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsNumber, IsDateString } from "class-validator";
import { Type, Transform } from "class-transformer";
import { BadRequestException } from "@nestjs/common";

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

    @ApiProperty({
        example: '2026-06-30',
        description: 'Nueva fecha objetiva de finalización (YYYY-MM-DD). Debe ser futura.',
        required: false,
        nullable: true
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value && typeof value === 'string') {
            const fechaIngresada = new Date(value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaIngresada.setHours(0, 0, 0, 0);
            
            if (fechaIngresada < hoy) {
                throw new BadRequestException(
                    'La fecha de finalización debe ser futura (no puede ser pasada)'
                );
            }
        }
        return value;
    })
    @IsDateString({}, { message: 'Formato de fecha inválido (requerido: YYYY-MM-DD)' })
    fechaFinalizacionObjetivo?: string;
}