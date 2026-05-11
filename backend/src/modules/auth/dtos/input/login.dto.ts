//BACKEND/SRC/MODULES/AUTH/DTOS/INPUT/LOGIN.DTO.TS
import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class LoginDto{

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombre!: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    clave!: string

}