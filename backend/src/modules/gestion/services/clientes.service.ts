import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere, Not } from "typeorm";

import { Cliente } from "../entities/cliente.entity";
import { Proyecto } from "../entities/proyecto.entity";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { ProyectosService } from "./proyectos.service";

@Injectable()
export class ClientesService {

    constructor(
        @InjectRepository(Cliente)
        private readonly repository: Repository<Cliente>,

        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @Inject(forwardRef(() => ProyectosService))
        private readonly proyectosService: ProyectosService
    ) { }

    /**
     * Normalizar nombre: remover espacios extras laterales e internos
     */
    private normalizarNombre(nombre: string): string {
        return nombre.trim().replace(/\s+/g, ' ');
    }

    /**
     * Obtener todos los clientes (con filtros opcionales)
     * Por defecto, excluye clientes con estado BAJA
     */
    async obtenerClientes(
        nombre?: string,
        estado?: EstadosClientesEnum
    ): Promise<ListClienteDTO[]> {
        const where: FindOptionsWhere<Cliente> = {};

        if (nombre?.trim()) {
            where.nombre = ILike(`%${nombre.trim()}%`);
        }

        // Si no especifica estado, excluir automáticamente la BAJA
        if (estado) {
            where.estado = estado;
        } else {
            where.estado = Not(EstadosClientesEnum.BAJA);
        }

        const clientes = await this.repository.find({
            where,
            order: { nombre: 'ASC' }
        });

        return clientes.map(cliente => this.mapToDto(cliente));
    }

    /**
     * Obtener un cliente específico por ID
     */
    async obtenerCliente(id: number): Promise<ListClienteDTO> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        return this.mapToDto(cliente);
    }

    /**
     * Verificar si existe un cliente con ese nombre (Case-Insensitive)
     * Permite excluir un ID específico para los flujos de actualización
     */
    async existeClientePorNombre(
        nombre: string,
        excluyendoId?: number
    ): Promise<boolean> {
        const nombreNormalizado = this.normalizarNombre(nombre);
        const query = this.repository.createQueryBuilder('cliente')
            .where('LOWER(cliente.nombre) = LOWER(:nombre)', { nombre: nombreNormalizado });

        if (excluyendoId) {
            query.andWhere('cliente.id != :id', { id: excluyendoId });
        }

        return await query.getExists();
    }

    /**
     * Verificar si existe un cliente ACTIVO por ID
     * Usado por proyectos.service para validar asignación en la creación/edición
     */
    async existeClienteActivoPorId(id: number): Promise<boolean> {
        return await this.repository.exists({
            where: {
                id,
                estado: EstadosClientesEnum.ACTIVO
            }
        });
    }

    /**
     * Crear un nuevo cliente en estado ACTIVO por defecto
     */
    async crearCliente(dto: CreateClienteDto): Promise<{ id: number }> {
        const nombreNormalizado = this.normalizarNombre(dto.nombre);

        // Verificar unicidad del nombre corporativo/comercial
        if (await this.existeClientePorNombre(nombreNormalizado)) {
            throw new ConflictException(
                `Ya existe un cliente con el nombre "${nombreNormalizado}"`
            );
        }

        const cliente = this.repository.create({
            nombre: nombreNormalizado,
            estado: EstadosClientesEnum.ACTIVO
        });

        const clienteGuardado = await this.repository.save(cliente);
        return { id: clienteGuardado.id };
    }

    /**
     * Actualizar un cliente existente
     * ✅ INCLUYE CONTROL: Si el DTO intenta pasar el estado a BAJA, valida dependencias activas
     */
    async actualizarCliente(id: number, dto: UpdateClienteDto): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        // Actualizar nombre y verificar duplicados si sufrió modificaciones
        if (dto.nombre?.trim()) {
            const nombreNormalizado = this.normalizarNombre(dto.nombre);

            if (nombreNormalizado.toLowerCase() !== cliente.nombre.toLowerCase()) {
                if (await this.existeClientePorNombre(nombreNormalizado, id)) {
                    throw new ConflictException(
                        `Ya existe otro cliente con el nombre "${nombreNormalizado}"`
                    );
                }
            }
            cliente.nombre = nombreNormalizado;
        }

        // Actualizar estado evaluando la regla de negocio crítica
        if (dto.estado) {
            if (dto.estado === EstadosClientesEnum.BAJA && cliente.estado !== EstadosClientesEnum.BAJA) {
                const proyectosActivos = await this.proyectoRepository.count({
                    where: {
                        idCliente: id,
                        estado: Not(EstadosProyectosEnum.BAJA)
                    }
                });

                if (proyectosActivos > 0) {
                    throw new ConflictException(
                        `No se puede dar de baja el cliente "${cliente.nombre}" mediante la actualización porque tiene ` +
                        `${proyectosActivos} proyecto(s) activo(s) o finalizado(s). ` +
                        `Por favor, primero da de baja todos sus proyectos asociados.`
                    );
                }
            }
            cliente.estado = dto.estado;
        }

        await this.repository.save(cliente);
    }

    /**
     * Cambiar estado de un cliente (Uso directo por endpoints de alternancia de estados)
     * ✅ VALIDACIÓN CRÍTICA: Bloquea la baja si tiene proyectos activos o finalizados
     */
    async cambiarEstadoCliente(
        id: number,
        nuevoEstado: EstadosClientesEnum
    ): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        // ✅ Si intenta cambiar a BAJA, validar fehacientemente que no existan proyectos activos
        if (nuevoEstado === EstadosClientesEnum.BAJA && cliente.estado !== EstadosClientesEnum.BAJA) {
            
            const proyectosActivos = await this.proyectoRepository.count({
                where: {
                    idCliente: id,
                    estado: Not(EstadosProyectosEnum.BAJA)
                }
            });

            if (proyectosActivos > 0) {
                throw new ConflictException(
                    `No se puede dar de baja el cliente "${cliente.nombre}" porque tiene ` +
                    `${proyectosActivos} proyecto(s) activo(s) o finalizado(s). ` +
                    `Por favor, primero da de baja todos sus proyectos asociados.`
                );
            }
        }

        cliente.estado = nuevoEstado;
        await this.repository.save(cliente);
    }

    /**
     * Eliminación lógica definitiva de un cliente (Pasa a estado BAJA)
     * ✅ VALIDACIÓN CRÍTICA: Mismo control estricto relacional de integridad
     */
    async eliminarCliente(id: number): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        if (cliente.estado === EstadosClientesEnum.BAJA) {
            throw new BadRequestException('El cliente ya se encuentra dado de baja');
        }

        // ✅ Validación obligatoria por requerimiento de cátedra
        const proyectosActivos = await this.proyectoRepository.count({
            where: {
                idCliente: id,
                estado: Not(EstadosProyectosEnum.BAJA)
            }
        });

        if (proyectosActivos > 0) {
            throw new ConflictException(
                `No se puede eliminar (dar de baja) el cliente porque tiene ${proyectosActivos} ` +
                `proyecto(s) activo(s) o finalizado(s). ` +
                `Por favor, primero da de baja todos sus proyectos asociados.`
            );
        }

        cliente.estado = EstadosClientesEnum.BAJA;
        await this.repository.save(cliente);
    }

    /**
     * Obtener exclusivamente clientes activos (Para poblar selectores Dropdown en Angular)
     */
    async obtenerClientesActivos(): Promise<ListClienteDTO[]> {
        const clientes = await this.repository.find({
            where: { estado: EstadosClientesEnum.ACTIVO },
            order: { nombre: 'ASC' }
        });

        return clientes.map(cliente => this.mapToDto(cliente));
    }

    /**
     * Contar clientes por estado (Ideal para tableros de control o estadísticas)
     */
    async contarClientesPorEstado(estado: EstadosClientesEnum): Promise<number> {
        return await this.repository.countBy({ estado });
    }

    /**
     * Verificar si un cliente existe de forma simple por ID
     */
    async existeClientePorId(id: number): Promise<boolean> {
        return await this.repository.exists({ where: { id } });
    }

    /**
     * Mapper helper: Convierte una entidad Cliente a un DTO plano estructurado
     */
    private mapToDto(cliente: Cliente): ListClienteDTO {
        const dto = new ListClienteDTO();
        dto.id = cliente.id;
        dto.nombre = cliente.nombre;
        dto.estado = cliente.estado;
        return dto;
    }
}