import { ApiProperty } from "@nestjs/swagger";
import { EstadosProyectosEnum } from "../../enums/estados-proyectos.enum";
import { ListTareaDTO } from "./list-tarea.dto";

export class ProyectoDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombre!: string;

    @ApiProperty()
    estado!: EstadosProyectosEnum;

    @ApiProperty({ nullable: true })
    cliente?: string; // null para proyectos internos

    @ApiProperty({ type: () => ListTareaDTO, isArray: true })
    tareas!: ListTareaDTO[];

}