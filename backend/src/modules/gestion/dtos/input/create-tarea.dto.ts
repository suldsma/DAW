//BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-TAREA.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTareaDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    descripcion!: string;

}