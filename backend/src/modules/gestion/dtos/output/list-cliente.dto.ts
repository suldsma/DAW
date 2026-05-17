// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/LIST-CLIENTE.DTO.TS

import { ApiProperty } from "@nestjs/swagger";
import { EstadosClientesEnum } from "../../enums/estados-clientes.enum";

export class ListClienteDTO {

    @ApiProperty({ 
        example: 1, 
        description: 'ID autoincremental del cliente' 
    })
    id!: number;

    @ApiProperty({ 
        example: 'Empresa Tech Solutions', 
        description: 'Nombre que se visualiza en listados y selectores' 
    })
    nombre!: string;

    @ApiProperty({ 
        enum: EstadosClientesEnum, 
        example: EstadosClientesEnum.ACTIVO,
        description: 'Estado actual del cliente (ACTIVO/INACTIVO)' 
    })
    estado!: EstadosClientesEnum;
}