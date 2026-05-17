// BACKEND/SRC/MODULES/AUTH/DTOS/INPUT/LOGIN.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {

    @ApiProperty({
        example: 'admin_proyectos',
        description: 'Nombre de usuario registrado en el sistema'
    })
    @IsString({ message: 'El nombre de usuario debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
    nombre!: string;

    @ApiProperty({
        example: '123456',
        description: 'Clave de acceso del usuario'
    })
    @IsString({ message: 'La contraseña debe ser un texto' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    clave!: string;
}