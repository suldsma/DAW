// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/CREATE-TAREA.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateTareaDto {

    // Lo que hay que hacer en la tarea
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    descripcion!: string;

}