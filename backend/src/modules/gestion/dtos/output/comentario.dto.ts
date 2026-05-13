// BACKEND/SRC/MODULES/GESTION/DTOS/OUTPUT/COMENTARIO.DTO.TS
import { ApiProperty } from "@nestjs/swagger";

export class ComentarioDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    contenido!: string;

    @ApiProperty()
    nombreUsuario!: string;

    @ApiProperty()
    fechaCreacion!: Date;

    @ApiProperty()
    fechaActualizacion!: Date;

}