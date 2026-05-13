// BACKEND/SRC/MODULES/GESTION/DTOS/INPUT/UPDATE-TAREA.DTO.TS
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { EstadosTareasEnum } from "../../enums/estados-tareas.enum";
import { CreateTareaDto } from "./create-tarea.dto";

// Heredamos de la creación para no repetir la descripción
export class UpdateTareaDto extends PartialType(CreateTareaDto) {

    // Para cambiar el estado de la tarea (Pendiente, En curso, Terminada)
    @ApiProperty({ enum: EstadosTareasEnum, example: EstadosTareasEnum.PENDIENTE })
    @IsEnum(EstadosTareasEnum)
    @IsOptional()
    estado?: EstadosTareasEnum;

}