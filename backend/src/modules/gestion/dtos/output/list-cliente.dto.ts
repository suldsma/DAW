// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/LIST-CLIENTE.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { EstadosClientesEnum } from "../../enums/estados-clientes.enum";

export class ListClienteDTO {

    // ID único del cliente
    @ApiProperty()
    id!: number;

    // Nombre que se muestra en la lista
    @ApiProperty()
    nombre!: string;

    // Estado actual del cliente (Activo/Baja)
    @ApiProperty()
    estado!: EstadosClientesEnum;

}