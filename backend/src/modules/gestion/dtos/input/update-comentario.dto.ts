// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-COMENTARIO.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsOptional } from "class-validator";

export class UpdateComentarioDto {

    @ApiProperty({ minLength: 1, maxLength: 1000, required: false })
    @IsString()
    @IsOptional()
    @MinLength(1)
    contenido?: string;

}