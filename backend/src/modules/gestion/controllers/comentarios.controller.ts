import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Post, 
    Put, 
    UseGuards, 
    ParseIntPipe,
    Request
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ComentariosService } from "../services/comentarios.service";
import { CreateComentarioDto } from "../dtos/input/create-comentario.dto";
import { UpdateComentarioDto } from "../dtos/input/update-comentario.dto";
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiTags('Comentarios')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('proyectos/:idProyecto/tareas/:idTarea/comentarios')
export class ComentariosController {

    constructor(private readonly comentariosService: ComentariosService) { }

    @Post()
    @ApiOperation({ summary: 'Agregar un comentario a una tarea' })
    async crearComentario(
        @Param('idTarea', ParseIntPipe) idTarea: number,
        @Body() dto: CreateComentarioDto,
        @Request() req: any
    ): Promise<{ id: number }> {
        // Extraemos solo el ID (sub), ya que el nombre no se usa para guardar en BD
        const usuarioId = req['usuario'].sub;

        // ✅ CORREGIDO: Eliminamos 'usuarioNombre' de la llamada para que coincida con el Service
        return await this.comentariosService.crearComentario(
            idTarea,
            usuarioId,
            dto
        );
    }

    @Get()
    @ApiOperation({ summary: 'Obtener comentarios de una tarea' })
    async obtenerComentarios(
        @Param('idTarea', ParseIntPipe) idTarea: number
    ) {
        return await this.comentariosService.obtenerComentariosPorTarea(idTarea);
    }

    @Put(':idComentario')
    @ApiOperation({ summary: 'Actualizar un comentario (solo el autor)' })
    async actualizarComentario(
        @Param('idComentario', ParseIntPipe) idComentario: number,
        @Body() dto: UpdateComentarioDto,
        @Request() req: any
    ): Promise<void> {
        const usuarioId = req['usuario'].sub;

        await this.comentariosService.actualizarComentario(
            idComentario,
            usuarioId,
            dto
        );
    }

    @Delete(':idComentario')
    @ApiOperation({ summary: 'Eliminar un comentario (solo el autor)' })
    async eliminarComentario(
        @Param('idComentario', ParseIntPipe) idComentario: number,
        @Request() req: any
    ): Promise<void> {
        const usuarioId = req['usuario'].sub;

        await this.comentariosService.eliminarComentario(
            idComentario,
            usuarioId
        );
    }
}