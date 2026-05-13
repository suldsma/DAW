// BACKEND/SRC/MODULES/GESTION/SERVICES/CLIENTES.SERVICE.TS
import { 
    Injectable, 
    BadRequestException, 
    forwardRef, 
    Inject, 
    NotFoundException,
    ConflictException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Like } from "typeorm";

// Entidades y Enums
import { Cliente } from "../entities/cliente.entity";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";

// DTOs
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";

// Servicios Relacionados
import { ProyectosService } from "./proyectos.service";

@Injectable()
export class ClientesService {

    constructor(
        @InjectRepository(Cliente) 
        private readonly repository: Repository<Cliente>,
        
        @Inject(forwardRef(() => ProyectosService)) 
        private readonly proyectosService: ProyectosService
    ) { }

    // --- MÉTODOS DE LECTURA ---

    /**
     * Obtener listado con filtros de búsqueda avanzada
     * @param estado - Filtro opcional por estado
     * @param nombre - Filtro opcional por nombre (búsqueda parcial)
     * @returns Array de clientes mapeados a DTO
     */
    async obtenerClientes(estado?: EstadosClientesEnum, nombre?: string): Promise<ListClienteDTO[]> {
        const where: FindOptionsWhere<Cliente> = {};

        if (estado) where.estado = estado;
        if (nombre) where.nombre = Like(`%${nombre}%`);

        const clientes = await this.repository.find({
            select: ['id', 'nombre', 'estado'],
            where,
            order: { nombre: 'ASC' } // ✅ MEJORADO: Ordenar alfabéticamente por defecto
        });

        return clientes.map(this.mapToListDto);
    }

    /**
     * Obtener un cliente específico por ID con sus proyectos
     */
    async obtenerClientePorId(id: number): Promise<ListClienteDTO> {
        const cliente = await this.repository.findOneBy({ id });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        return this.mapToListDto(cliente);
    }

    /**
     * Verifica si un cliente existe y está activo
     * Usado por ProyectosService para validar cliente activo
     */
    async existeClienteActivoPorId(id: number): Promise<boolean> {
        return await this.repository.exists({ 
            where: { id, estado: EstadosClientesEnum.ACTIVO } 
        });
    }

    /**
     * Verifica si un nombre de cliente ya existe
     */
    async existeClientePorNombre(nombre: string, excluyendoId?: number): Promise<boolean> {
        const query = this.repository.createQueryBuilder('cliente')
            .where('LOWER(cliente.nombre) = LOWER(:nombre)', { nombre });
        
        if (excluyendoId) {
            query.andWhere('cliente.id != :id', { id: excluyendoId });
        }

        return (await query.getCount()) > 0;
    }

    // --- MÉTODOS DE ESCRITURA ---

    async crearCliente(dto: CreateClienteDto): Promise<{ id: number }> {
        // ✅ VALIDACIÓN: Verificar que el nombre sea único
        const yaExiste = await this.existeClientePorNombre(dto.nombre);
        if (yaExiste) {
            throw new ConflictException(`Ya existe un cliente con el nombre "${dto.nombre}"`);
        }

        const cliente: Cliente = this.repository.create(dto);
        cliente.estado = EstadosClientesEnum.ACTIVO;
        
        await this.repository.save(cliente);
        return { id: cliente.id };
    }

    async actualizarCliente(id: number, dto: UpdateClienteDto): Promise<void> {
        const cliente = await this.repository.findOneBy({ id });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        // ✅ VALIDACIÓN: Si se actualiza el nombre, verificar unicidad
        if (dto.nombre && dto.nombre !== cliente.nombre) {
            const yaExiste = await this.existeClientePorNombre(dto.nombre, id);
            if (yaExiste) {
                throw new ConflictException(`Ya existe un cliente con el nombre "${dto.nombre}"`);
            }
        }

        // ✅ REGLA DE NEGOCIO: No dar de baja si tiene proyectos
        if (dto.estado === EstadosClientesEnum.BAJA) {
            const tieneProyectos = await this.proyectosService.existeProyectoPorIdCliente(id);
            if (tieneProyectos) {
                throw new BadRequestException(
                    'No se puede dar de baja un cliente con proyectos relacionados'
                );
            }
        }

        Object.assign(cliente, dto);
        await this.repository.save(cliente);
    }

    /**
     * Eliminar un cliente (solo si no tiene proyectos activos o finalizados)
     */
    async eliminarCliente(id: number): Promise<void> {
        const cliente = await this.repository.findOneBy({ id });
        
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        const tieneProyectos = await this.proyectosService.existeProyectoPorIdCliente(id);
        if (tieneProyectos) {
            throw new BadRequestException(
                'No se puede eliminar un cliente que tiene proyectos relacionados'
            );
        }
        
        await this.repository.delete(id);
    }

    // --- MÉTODOS DE ESTADÍSTICAS ---

    async contarClientesTotales(): Promise<number> {
        return await this.repository.count();
    }

    async contarClientesActivos(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosClientesEnum.ACTIVO }
        });
    }

    // --- MÉTODOS PRIVADOS ---

    private mapToListDto(cliente: Cliente): ListClienteDTO {
        return {
            id: cliente.id,
            nombre: cliente.nombre,
            estado: cliente.estado
        };
    }

}