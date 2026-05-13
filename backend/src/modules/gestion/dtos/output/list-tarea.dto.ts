// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/LIST-TAREA.DTO.TS
import { ApiProperty } from "@nestjs/swagger";
import { EstadosTareasEnum } from "../../enums/estados-tareas.enum";

export class ListTareaDTO {

    // ID de la tarea
    @ApiProperty()
    id!: number;

    // Qué es lo que hay que hacer
    @ApiProperty()
    descripcion!: string;

    // Si está pendiente, en curso o terminada
    @ApiProperty()
    estado!: EstadosTareasEnum;

}