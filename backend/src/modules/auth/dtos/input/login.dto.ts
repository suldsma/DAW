// BACKEND/SRC/MODULES/AUTH/DTOS/INPUT/LOGIN.DTO.TS
import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class LoginDto {

    // Nombre de usuario para el login
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nombre!: string

    // Contraseña del usuario
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    clave!: string

}