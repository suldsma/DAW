// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-PROYECTO.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProyectoDto {

    // Nombre del proyecto
    @ApiProperty({
        example: 'Sistema Contable',
        description: 'Nombre único del proyecto'
    })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del proyecto es obligatorio' })
    nombre!: string;

    // Cliente asignado (opcional si es un proyecto interno)
    @ApiProperty({
        example: 1,
        description: 'ID del cliente (Opcional para proyectos internos)',
        required: false,
        nullable: true
    })
    @IsNumber({}, { message: 'El ID del cliente debe ser un número' })
    @IsOptional()
    idCliente?: number;

}