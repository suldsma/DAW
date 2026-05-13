// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-PROYECTO.DTO.TS
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateProyectoDto } from "./create-proyecto.dto";
import { IsEnum, IsOptional, IsNumber } from "class-validator";
import { EstadosProyectosEnum } from "../../enums/estados-proyectos.enum";

// Usamos PartialType para que los campos de creación sean opcionales aquí
export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {

    // Para cambiar el estado del proyecto
    @ApiProperty({
        enum: EstadosProyectosEnum,
        example: EstadosProyectosEnum.ACTIVO,
        description: 'Nuevo estado del proyecto',
        required: false
    })
    @IsEnum(EstadosProyectosEnum)
    @IsOptional()
    estado?: EstadosProyectosEnum;

    // Por si queremos mover el proyecto a otro cliente
    @ApiProperty({
        example: 2,
        description: 'ID del nuevo cliente (opcional)',
        required: false
    })
    @IsNumber()
    @IsOptional()
    idCliente?: number; 

}