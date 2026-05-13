// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/CLIENTES.CONTROLLER.TS
import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Post, 
    Put, 
    Query, 
    UseGuards, 
    ParseIntPipe 
} from "@nestjs/common";
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags, ApiOperation } from "@nestjs/swagger";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { ClientesService } from "../services/clientes.service";
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('clientes')
export class ClientesController {

    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo cliente' })
    @ApiOkResponse({ description: 'Cliente creado exitosamente' })
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

    /**
     * ✅ NUEVO: Endpoint DELETE para eliminar clientes
     * Validación: Solo si no tiene proyectos relacionados
     */
    @Delete(":id")
    @ApiOperation({ 
        summary: 'Eliminar un cliente',
        description: 'Solo es posible si el cliente no tiene proyectos relacionados'
    })
    async eliminarCliente(@Param("id", ParseIntPipe) id: number): Promise<void> {
        await this.clientesService.eliminarCliente(id);
    }

    @ApiOkResponse({ type: ListClienteDTO, isArray: true })
    @ApiQuery({ name: 'estado', required: false, enum: EstadosClientesEnum })
    @ApiQuery({ name: 'nombre', required: false, type: String, description: 'Búsqueda parcial por nombre' })
    @Get()
    @ApiOperation({ summary: 'Listar clientes con filtros opcionales' })
    async obtenerClientes(
        @Query("estado") estado?: EstadosClientesEnum,
        @Query("nombre") nombre?: string
    ): Promise<ListClienteDTO[]> {
        return await this.clientesService.obtenerClientes(estado, nombre);
    }

    /**
     * ✅ NUEVO: Obtener un cliente específico por ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalles de un cliente específico' })
    @ApiOkResponse({ type: ListClienteDTO })
    async obtenerClientePorId(
        @Param('id', ParseIntPipe) id: number
    ): Promise<ListClienteDTO> {
        return await this.clientesService.obtenerClientePorId(id);
    }

}