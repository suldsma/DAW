// BACKEND/SRC/MODULES/GESTION/SERVICES/CLIENTES.SERVICE.TS
import { Injectable, BadRequestException, forwardRef, Inject, NotFoundException } from "@nestjs/common";
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
     */
    async obtenerClientes(estado?: EstadosClientesEnum, nombre?: string): Promise<ListClienteDTO[]> {
        const where: FindOptionsWhere<Cliente> = {};

        if (estado) where.estado = estado;
        if (nombre) where.nombre = Like(`%${nombre}%`);

        const clientes = await this.repository.find({
            select: ['id', 'nombre', 'estado'],
            where,
            order: { id: 'ASC' }
        });

        return clientes.map(c => ({
            id: c.id,
            nombre: c.nombre,
            estado: c.estado
        }));
    }

    /**
     * Verifica si un cliente existe y está activo (Usado por ProyectosService)
     */
    async existeClienteActivoPorId(id: number): Promise<boolean> {
        return await this.repository.exists({ 
            where: { id, estado: EstadosClientesEnum.ACTIVO } 
        });
    }

    // --- MÉTODOS DE ESCRITURA ---

    async crearCliente(dto: CreateClienteDto): Promise<{ id: number }> {
        const cliente: Cliente = this.repository.create(dto);
        cliente.estado = EstadosClientesEnum.ACTIVO;
        
        await this.repository.save(cliente);
        return { id: cliente.id };
    }

    async actualizarCliente(id: number, dto: UpdateClienteDto): Promise<void> {
        const cliente = await this.repository.findOneBy({ id });

        if (!cliente) {
            throw new NotFoundException('Cliente no encontrado');
        }

        // REGLA DE NEGOCIO: No dar de baja si tiene proyectos activos o finalizados
        if (dto.estado === EstadosClientesEnum.BAJA) {
            const tieneProyectos = await this.proyectosService.existeProyectoPorIdCliente(id);
            if (tieneProyectos) {
                throw new BadRequestException('No se puede dar de baja un cliente con proyectos relacionados');
            }
        }

        this.repository.merge(cliente, dto);
        await this.repository.save(cliente);
    }

    /**
     * Eliminación lógica o física (según prefieras para el TFI)
     */
    async eliminarCliente(id: number): Promise<void> {
        const tieneProyectos = await this.proyectosService.existeProyectoPorIdCliente(id);
        if (tieneProyectos) {
            throw new BadRequestException('No se puede eliminar un cliente que tiene historia de proyectos');
        }
        
        const resultado = await this.repository.delete(id);
        if (resultado.affected === 0) throw new NotFoundException('Cliente no encontrado');
    }

    // --- MÉTODOS DE ESTADÍSTICAS ---

    async contarClientesTotales(): Promise<number> {
        return await this.repository.count();
    }
}