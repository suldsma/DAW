// BACKEND/SRC/MODULES/AUDITORIA/CONTROLLERS/AUDITORIA.CONTROLLER.TS
import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuditoriaService } from '../services/auditoria.service';
import { TipoEntidadEnum } from '../entities/auditoria.entity';

@ApiTags('Auditoría')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('auditoria')
export class AuditoriaController {

    constructor(private readonly auditoriaService: AuditoriaService) { }

    @Get('historial')
    @ApiOperation({ summary: 'Obtener historial general de cambios del sistema' })
    @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Cantidad máxima de registros' })
    async obtenerHistorialGeneral(
        @Query('limite') limite: number = 100
    ) {
        return await this.auditoriaService.obtenerHistorialGeneral(Math.min(limite, 500));
    }

    @Get('entidad/:tipoEntidad/:idEntidad')
    @ApiOperation({ summary: 'Obtener historial de cambios de una entidad específica' })
    async obtenerHistorialEntidad(
        @Param('tipoEntidad') tipoEntidad: TipoEntidadEnum,
        @Param('idEntidad', ParseIntPipe) idEntidad: number
    ) {
        return await this.auditoriaService.obtenerHistorial(tipoEntidad, idEntidad);
    }

    @Get('usuario/:idUsuario')
    @ApiOperation({ summary: 'Obtener historial de cambios realizados por un usuario' })
    async obtenerHistorialUsuario(
        @Param('idUsuario', ParseIntPipe) idUsuario: number
    ) {
        return await this.auditoriaService.obtenerHistorialPorUsuario(idUsuario);
    }

}