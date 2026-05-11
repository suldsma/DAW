// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/CLIENTES.CONTROLLER.TS
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, ParseIntPipe } from "@nestjs/common";
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags, ApiOperation } from "@nestjs/swagger";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { ClientesService } from "../services/clientes.service";
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiTags('Clientes') // Organiza los endpoints en Swagger
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('clientes')
export class ClientesController {

    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo cliente' })
    async crearCliente(@Body() dto: CreateClienteDto): Promise<{ id: number }> {
        return await this.clientesService.crearCliente(dto);
    }

    @Put(":id")
    @ApiOperation({ summary: 'Actualizar datos o estado de un cliente' })
    async actualizarCliente(
        @Param("id", ParseIntPipe) id: number, 
        @Body() dto: UpdateClienteDto
    ): Promise<void> {
        await this.clientesService.actualizarCliente(id, dto);
    }

    @ApiOkResponse({ type: ListClienteDTO, isArray: true })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosClientesEnum })
    @ApiQuery({ name: 'nombre', required: false, type: String }) // ✅ Agregado para Búsqueda Avanzada
    @Get()
    @ApiOperation({ summary: 'Listar clientes con filtros opcionales' })
    async obtenerClientes(
        @Query("estado") estado?: EstadosClientesEnum,
        @Query("nombre") nombre?: string // ✅ Recibe el parámetro de búsqueda
    ): Promise<ListClienteDTO[]> {
        return await this.clientesService.obtenerClientes(estado, nombre);
    }
}