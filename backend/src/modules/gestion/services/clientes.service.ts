import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere, Not } from "typeorm";

import { Cliente } from "../entities/cliente.entity";
import { Proyecto } from "../entities/proyecto.entity";
import { EstadosClientesEnum } from "../enums/estados-clientes.enum";
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { ProyectosService } from "./proyectos.service";

import { AuditoriaService } from "../../auditoria/services/auditoria.service";
import { TipoEntidadEnum, TipoOperacionEnum } from "../../auditoria/entities/auditoria.entity";

@Injectable()
export class ClientesService {

    private readonly logger = new Logger(ClientesService.name);

    constructor(
        @InjectRepository(Cliente)
        private readonly repository: Repository<Cliente>,

        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @Inject(forwardRef(() => ProyectosService))
        private readonly proyectosService: ProyectosService,

        private readonly auditoriaService: AuditoriaService
    ) { }

    private normalizarNombre(nombre: string): string {
        return nombre.trim().replace(/\s+/g, ' ');
    }

    /**
     * Obtiene lista de clientes con filtros opcionales
     * @param estado - Filtro por estado (opcional)
     * @param nombre - Filtro por nombre (opcional)
     * @returns Array de clientes DTO
     */
    async obtenerClientes(
        estado?: EstadosClientesEnum,
        nombre?: string
    ): Promise<ListClienteDTO[]> {
        const where: FindOptionsWhere<Cliente> = {};

        if (nombre?.trim()) {
            where.nombre = ILike(`%${nombre.trim()}%`);
        }

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
     * Obtiene un cliente específico por ID
     * @param id - ID del cliente
     * @returns Cliente DTO
     * @throws NotFoundException si no existe
     */
    async obtenerCliente(id: number): Promise<ListClienteDTO> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        return this.mapToDto(cliente);
    }

    /**
     * Verifica si existe un cliente con ese nombre
     * @param nombre - Nombre a buscar
     * @param excluyendoId - ID a excluir de la búsqueda (para edición)
     * @returns true si existe, false en caso contrario
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
     * Verifica si existe un cliente ACTIVO por ID
     * @param id - ID del cliente
     * @returns true si existe y está ACTIVO
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
     * Crea un nuevo cliente
     * @param dto - Datos del cliente
     * @param usuarioActual - Usuario que realiza la acción
     * @returns Objeto con ID del cliente creado
     * @throws ConflictException si ya existe un cliente con ese nombre
     */
    async crearCliente(dto: CreateClienteDto, usuarioActual: any): Promise<{ id: number }> {
        const nombreNormalizado = this.normalizarNombre(dto.nombre);

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

        try {
            await this.auditoriaService.registrarCambio(
                TipoEntidadEnum.CLIENTE,
                clienteGuardado.id,
                TipoOperacionEnum.CREAR,
                usuarioActual.sub,
                usuarioActual.nombre
            );
            this.logger.log(`Cliente creado: ID ${clienteGuardado.id} - ${nombreNormalizado}`);
        } catch (error) {
            this.logger.error(
                `Fallo al registrar auditoría de creación del cliente ID: ${clienteGuardado.id}`,
                error instanceof Error ? error.stack : String(error),
                'ClientesService.crearCliente'
            );
        }

        return { id: clienteGuardado.id };
    }

    /**
     * Actualiza los datos de un cliente
     * @param id - ID del cliente
     * @param dto - Datos a actualizar
     * @param usuarioActual - Usuario que realiza la acción
     * @throws NotFoundException si no existe
     * @throws ConflictException si intenta cambiar a nombre duplicado
     */
    async actualizarCliente(
        id: number,
        dto: UpdateClienteDto,
        usuarioActual: any
    ): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

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

        if (dto.estado) {
            cliente.estado = dto.estado;
        }

        await this.repository.save(cliente);

        try {
            await this.auditoriaService.registrarCambio(
                TipoEntidadEnum.CLIENTE,
                cliente.id,
                TipoOperacionEnum.ACTUALIZAR,
                usuarioActual.sub,
                usuarioActual.nombre
            );
            this.logger.log(`Cliente actualizado: ID ${cliente.id}`);
        } catch (error) {
            this.logger.error(
                `Fallo al registrar auditoría de actualización del cliente ID: ${cliente.id}`,
                error instanceof Error ? error.stack : String(error),
                'ClientesService.actualizarCliente'
            );
        }
    }

    /**
     * Cambia el estado de un cliente
     * @param id - ID del cliente
     * @param nuevoEstado - Nuevo estado
     * @param usuarioActual - Usuario que realiza la acción
     * @throws NotFoundException si no existe
     * @throws ConflictException si intenta dar de baja un cliente en proyectos
     */
    async cambiarEstadoCliente(
        id: number,
        nuevoEstado: EstadosClientesEnum,
        usuarioActual: any
    ): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        if (nuevoEstado === EstadosClientesEnum.BAJA && cliente.estado !== EstadosClientesEnum.BAJA) {
            const totalProyectos = await this.proyectoRepository.count({
                where: { idCliente: id }
            });

            if (totalProyectos > 0) {
                throw new ConflictException(
                    `No se puede dar de baja el cliente porque está registrado en ${totalProyectos} proyecto(s). ` +
                    `Primero debe ser removido de sus proyectos.`
                );
            }
        }

        cliente.estado = nuevoEstado;
        await this.repository.save(cliente);

        try {
            await this.auditoriaService.registrarCambio(
                TipoEntidadEnum.CLIENTE,
                cliente.id,
                TipoOperacionEnum.ACTUALIZAR,
                usuarioActual.sub,
                usuarioActual.nombre
            );
            this.logger.log(`Estado del cliente ID ${cliente.id} cambiado a: ${nuevoEstado}`);
        } catch (error) {
            this.logger.error(
                `Fallo al registrar auditoría de cambio de estado del cliente ID: ${cliente.id}`,
                error instanceof Error ? error.stack : String(error),
                'ClientesService.cambiarEstadoCliente'
            );
        }
    }

    /**
     * Elimina un cliente (soft delete - cambia estado a BAJA)
     * @param id - ID del cliente
     * @param usuarioActual - Usuario que realiza la acción
     * @throws NotFoundException si no existe
     * @throws BadRequestException si ya está dado de baja
     * @throws ConflictException si está en proyectos activos
     */
    async eliminarCliente(id: number, usuarioActual: any): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        if (cliente.estado === EstadosClientesEnum.BAJA) {
            throw new BadRequestException('El cliente ya se encuentra dado de baja');
        }

        const totalProyectos = await this.proyectoRepository.count({
            where: { idCliente: id }
        });

        if (totalProyectos > 0) {
            throw new ConflictException(
                `No se puede eliminar el cliente porque está registrado en ${totalProyectos} proyecto(s).`
            );
        }

        cliente.estado = EstadosClientesEnum.BAJA;
        await this.repository.save(cliente);

        try {
            await this.auditoriaService.registrarCambio(
                TipoEntidadEnum.CLIENTE,
                cliente.id,
                TipoOperacionEnum.ELIMINAR,
                usuarioActual.sub,
                usuarioActual.nombre
            );
            this.logger.log(`Cliente eliminado (baja lógica): ID ${cliente.id}`);
        } catch (error) {
            this.logger.error(
                `Fallo al registrar auditoría de eliminación del cliente ID: ${cliente.id}`,
                error instanceof Error ? error.stack : String(error),
                'ClientesService.eliminarCliente'
            );
        }
    }

    /**
     * Obtiene todos los clientes en estado ACTIVO
     * @returns Array de clientes activos DTO
     */
    async obtenerClientesActivos(): Promise<ListClienteDTO[]> {
        const clientes = await this.repository.find({
            where: { estado: EstadosClientesEnum.ACTIVO },
            order: { nombre: 'ASC' }
        });

        return clientes.map(cliente => this.mapToDto(cliente));
    }

    /**
     * Cuenta el total de clientes
     * @returns Cantidad total
     */
    async contarClientesTotales(): Promise<number> {
        return await this.repository.count();
    }

    /**
     * Cuenta clientes activos
     * @returns Cantidad de clientes activos
     */
    async contarClientesActivos(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosClientesEnum.ACTIVO }
        });
    }

    /**
     * Cuenta clientes por estado
     * @param estado - Estado a contar
     * @returns Cantidad en ese estado
     */
    async contarClientesPorEstado(estado: EstadosClientesEnum): Promise<number> {
        return await this.repository.countBy({ estado });
    }

    /**
     * Verifica si existe un cliente por ID
     * @param id - ID del cliente
     * @returns true si existe
     */
    async existeClientePorId(id: number): Promise<boolean> {
        return await this.repository.exists({ where: { id } });
    }

    /**
     * Mapea entidad Cliente a DTO
     * @param cliente - Entidad Cliente
     * @returns DTO del cliente
     */
    private mapToDto(cliente: Cliente): ListClienteDTO {
        const dto = new ListClienteDTO();
        dto.id = cliente.id;
        dto.nombre = cliente.nombre;
        dto.estado = cliente.estado;
        return dto;
    }
}