import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { CreateClienteDto } from "./create-cliente.dto";
import { EstadosClientesEnum } from "../../enums/estados-clientes.enum";

export class UpdateClienteDto {

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    nombre?: string;

    @ApiProperty({ 
        enum: EstadosClientesEnum, 
        example: EstadosClientesEnum.ACTIVO,
        required: false 
    })
    @IsEnum(EstadosClientesEnum)
    @IsOptional()
    estado?: EstadosClientesEnum;

}