// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/CLIENTES.CONTROLLER.TS

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags
} from "@nestjs/swagger";

import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { ClientesService } from "../services/clientes.service";
import { JwtAuthGuard } from "../../auth/guards/auth.guard";

@ApiTags('Gestión - Clientes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {

    constructor(
        private readonly clientesService: ClientesService
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo cliente' })
    @ApiCreatedResponse({ description: 'Cliente creado con éxito.' })
    async crearCliente(
        @Body() dto: CreateClienteDto
    ): Promise<{ id: number }> {
        return await this.clientesService.crearCliente(dto);
    }

    @Put(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Actualizar datos de un cliente existente' })
    @ApiNoContentResponse({ description: 'Datos actualizados correctamente.' })
    async actualizarCliente(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateClienteDto
    ): Promise<void> {
        await this.clientesService.actualizarCliente(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ 
        summary: 'Eliminar un cliente', 
        description: 'No se podrá eliminar si tiene proyectos asociados para mantener la integridad referencial.' 
    })
    @ApiNoContentResponse({ description: 'Cliente eliminado correctamente.' })
    async eliminarCliente(
        @Param('id', ParseIntPipe) id: number
    ): Promise<void> {
        await this.clientesService.eliminarCliente(id);
    }

    @Get()
    @ApiOperation({ summary: 'Listar clientes con filtros de búsqueda' })
    @ApiOkResponse({ type: ListClienteDTO, isArray: true })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosClientesEnum })
    @ApiQuery({ name: 'nombre', required: false, description: 'Filtrar por nombre parcial' })
    async obtenerClientes(
        @Query('estado') estado?: string,
        @Query('nombre') nombre?: string
    ): Promise<ListClienteDTO[]> {
        
        return await this.clientesService.obtenerClientes(estado as EstadosClientesEnum, nombre);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener el detalle completo de un cliente' })
    @ApiOkResponse({ type: ListClienteDTO })
    @ApiNotFoundResponse({ description: 'El cliente no existe en la base de datos.' })
    async obtenerClientePorId(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ListClienteDTO> {
        
        return await this.clientesService.obtenerCliente(id);
    }
}