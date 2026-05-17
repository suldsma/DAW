// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-COMENTARIO.DTO.TS

import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateComentarioDto {

    @ApiProperty({
        example: 'Se revisaron los requerimientos y el diseño fue aprobado.',
        description: 'Texto descriptivo del comentario realizado por el usuario',
        minLength: 1,
        maxLength: 1000
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'El contenido debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
    @MinLength(1, { message: 'El comentario debe contener al menos un carácter' })
    @MaxLength(1000, { message: 'El comentario es demasiado extenso (máximo 1000 caracteres)' })
    contenido!: string;
}