import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    IsOptional,
    IsEnum
} from "class-validator";
import { Transform } from "class-transformer";
import { EstadosClientesEnum } from "../../enums/estados-clientes.enum";

export class CreateClienteDto {

    @ApiProperty({
        example: 'Empresa Tech Solutions',
        description: 'Nombre o razón social del cliente',
        minLength: 2,
        maxLength: 120
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @MinLength(2, { message: 'El nombre es demasiado corto (mínimo 2 caracteres)' })
    @MaxLength(120, { message: 'El nombre excede el límite permitido de 120 caracteres' })
    nombre!: string;

    @ApiProperty({
        enum: EstadosClientesEnum,
        description: 'Estado inicial del cliente',
        required: false
    })
    @IsOptional()
    @IsEnum(EstadosClientesEnum, { message: 'El estado proporcionado no es válido' })
    estado?: EstadosClientesEnum;
}