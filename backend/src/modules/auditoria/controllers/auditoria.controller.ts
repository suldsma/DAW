// backend/src/modules/auditoria/controllers/auditoria.controller.ts
import { 
    Controller, 
    Get, 
    Param, 
    Query, 
    UseGuards, 
    ParseIntPipe, 
    ParseEnumPipe, 
    HttpStatus 
} from '@nestjs/common';
import { 
    ApiBearerAuth, 
    ApiOperation, 
    ApiTags, 
    ApiQuery, 
    ApiParam, 
    ApiOkResponse 
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { AuditoriaService } from '../services/auditoria.service';
import { TipoEntidadEnum } from '../entities/auditoria.entity';

@ApiTags('Auditoría')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('auditoria')
export class AuditoriaController {

    constructor(private readonly auditoriaService: AuditoriaService) { }

    @Get('historial')
    @ApiOperation({ summary: 'Obtener historial general de cambios del sistema' })
    @ApiQuery({ 
        name: 'limite', 
        required: false, 
        type: Number, 
        description: 'Cantidad máxima de registros (Default: 100, Máx: 500)' 
    })
    async obtenerHistorialGeneral(
        @Query('limite') limite: number = 100
    ) {
        // Evita sobrecarga en la base de datos capando el máximo de registros solicitados
        const limitToUse = (limite && limite > 0) ? Math.min(limite, 500) : 100;
        return await this.auditoriaService.obtenerHistorialGeneral(limitToUse);
    }

    @Get('entidad/:tipoEntidad/:idEntidad')
    @ApiOperation({ summary: 'Obtener historial de cambios de una entidad específica' })
    @ApiParam({ name: 'tipoEntidad', enum: TipoEntidadEnum, description: 'Tipo de entidad a consultar' })
    async obtenerHistorialEntidad(
        @Param('tipoEntidad', new ParseEnumPipe(TipoEntidadEnum)) tipoEntidad: TipoEntidadEnum,
        @Param('idEntidad', ParseIntPipe) idEntidad: number
    ) {
        return await this.auditoriaService.obtenerHistorial(tipoEntidad, idEntidad);
    }

    @Get('usuario/:idUsuario')
    @ApiOperation({ summary: 'Obtener historial de acciones de un usuario' })
    @ApiParam({ name: 'idUsuario', type: Number })
    async obtenerHistorialUsuario(
        @Param('idUsuario', ParseIntPipe) idUsuario: number
    ) {
        return await this.auditoriaService.obtenerHistorialPorUsuario(idUsuario);
    }
}