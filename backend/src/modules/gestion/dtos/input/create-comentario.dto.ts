// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-COMENTARIO.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateComentarioDto {

    @ApiProperty({ minLength: 1, maxLength: 1000 })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    contenido!: string;

}