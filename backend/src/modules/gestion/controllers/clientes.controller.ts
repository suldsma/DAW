// BACKEND/SRC/MODULES/GESTION/CONTROLLERS/CLIENTES.CONTROLLER.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

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

// DTOs INPUT
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";

// DTOs OUTPUT
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";

// ENUMS
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";

// SERVICES
import { ClientesService } from "../services/clientes.service";

// AUTH
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiTags('Clientes')

/**
 * Swagger JWT
 */
@ApiBearerAuth()

/**
 * Protección JWT
 * Todas las rutas requieren autenticación
 */
@UseGuards(AuthGuard)

@Controller('clientes')
export class ClientesController {

    constructor(
        private readonly clientesService: ClientesService
    ) { }

    /**
     * =====================================================
     * CREAR CLIENTE
     * =====================================================
     */
    @Post()

    @ApiOperation({
        summary: 'Crear un nuevo cliente'
    })

    @ApiCreatedResponse({
        description: 'Cliente creado exitosamente'
    })

    async crearCliente(
        @Body() dto: CreateClienteDto
    ): Promise<{ id: number }> {

        return await this.clientesService
            .crearCliente(dto);
    }

    /**
     * =====================================================
     * ACTUALIZAR CLIENTE
     * =====================================================
     */
    @Put(':id')

    @HttpCode(204)

    @ApiOperation({
        summary: 'Actualizar datos o estado de un cliente'
    })

    @ApiNoContentResponse({
        description: 'Cliente actualizado correctamente'
    })

    @ApiNotFoundResponse({
        description: 'Cliente no encontrado'
    })

    async actualizarCliente(

        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateClienteDto

    ): Promise<void> {

        await this.clientesService
            .actualizarCliente(id, dto);
    }

    /**
     * =====================================================
     * ELIMINAR CLIENTE
     * =====================================================
     * Solo si no tiene proyectos relacionados
     */
    @Delete(':id')

    @HttpCode(204)

    @ApiOperation({
        summary: 'Eliminar un cliente',
        description:
            'Solo es posible si el cliente no tiene proyectos relacionados'
    })

    @ApiNoContentResponse({
        description: 'Cliente eliminado correctamente'
    })

    @ApiNotFoundResponse({
        description: 'Cliente no encontrado'
    })

    async eliminarCliente(

        @Param('id', ParseIntPipe)
        id: number

    ): Promise<void> {

        await this.clientesService
            .eliminarCliente(id);
    }

    /**
     * =====================================================
     * LISTAR CLIENTES
     * =====================================================
     */
    @Get()

    @ApiOperation({
        summary: 'Listar clientes con filtros opcionales'
    })

    @ApiOkResponse({
        type: ListClienteDTO,
        isArray: true
    })

    @ApiQuery({
        name: 'estado',
        required: false,
        enum: EstadosClientesEnum
    })

    @ApiQuery({
        name: 'nombre',
        required: false,
        type: String,
        description: 'Búsqueda parcial por nombre'
    })

    async obtenerClientes(

        @Query('estado')
        estado?: EstadosClientesEnum,

        @Query('nombre')
        nombre?: string

    ): Promise<ListClienteDTO[]> {

        return await this.clientesService
            .obtenerClientes(estado, nombre);
    }

    /**
     * =====================================================
     * OBTENER CLIENTE POR ID
     * =====================================================
     */
    @Get(':id')

    @ApiOperation({
        summary: 'Obtener detalles de un cliente específico'
    })

    @ApiOkResponse({
        type: ListClienteDTO
    })

    @ApiNotFoundResponse({
        description: 'Cliente no encontrado'
    })

    async obtenerClientePorId(

        @Param('id', ParseIntPipe)
        id: number

    ): Promise<ListClienteDTO> {

        return await this.clientesService
            .obtenerClientePorId(id);
    }

}