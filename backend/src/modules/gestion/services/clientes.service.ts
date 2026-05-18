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
import { CreateClienteDto } from "../dtos/input/create-cliente.dto";
import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";
import { ListClienteDTO } from "../dtos/output/list-cliente.dto";
import { ProyectosService } from "./proyectos.service";

import { AuditoriaService } from "../../auditoria/services/auditoria.service";
import { TipoEntidadEnum, TipoOperacionEnum } from "../../auditoria/entities/auditoria.entity";

@Injectable()
export class ClientesService {

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

    async obtenerCliente(id: number): Promise<ListClienteDTO> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        return this.mapToDto(cliente);
    }

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

    async existeClienteActivoPorId(id: number): Promise<boolean> {
        return await this.repository.exists({
            where: {
                id,
                estado: EstadosClientesEnum.ACTIVO
            }
        });
    }

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

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.CLIENTE,
            clienteGuardado.id,
            TipoOperacionEnum.CREAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );

        return { id: clienteGuardado.id };
    }

    async actualizarCliente(id: number, dto: UpdateClienteDto, usuarioActual: any): Promise<void> {
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
            if (dto.estado === EstadosClientesEnum.BAJA && cliente.estado !== EstadosClientesEnum.BAJA) {
                const totalProyectos = await this.proyectoRepository.count({
                    where: { cliente: { id: id } }
                });

                if (totalProyectos > 0) {
                    throw new ConflictException(
                        `No se puede dar de baja el cliente "${cliente.nombre}" mediante la actualización porque ` +
                        `está registrado en ${totalProyectos} proyecto(s). Según las reglas de negocio, ` +
                        `no debe figurar en ningún proyecto para poder efectuar la baja.`
                    );
                }
            }
            cliente.estado = dto.estado;
        }

        await this.repository.save(cliente);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.CLIENTE,
            cliente.id,
            TipoOperacionEnum.ACTUALIZAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

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
                where: { cliente: { id: id } }
            });

            if (totalProyectos > 0) {
                throw new ConflictException(
                    `No se puede dar de baja el cliente "${cliente.nombre}" porque está registrado en ` +
                    `${totalProyectos} proyecto(s). Primero debe ser removido o desvinculado de sus proyectos.`
                );
            }
        }

        cliente.estado = nuevoEstado;
        await this.repository.save(cliente);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.CLIENTE,
            cliente.id,
            TipoOperacionEnum.ACTUALIZAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async eliminarCliente(id: number, usuarioActual: any): Promise<void> {
        const cliente = await this.repository.findOne({ where: { id } });

        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
        }

        if (cliente.estado === EstadosClientesEnum.BAJA) {
            throw new BadRequestException('El cliente ya se encuentra dado de baja');
        }

        const totalProyectos = await this.proyectoRepository.count({
            where: { cliente: { id: id } }
        });

        if (totalProyectos > 0) {
            throw new ConflictException(
                `No se puede eliminar (dar de baja) el cliente porque está registrado en ${totalProyectos} proyecto(s).`
            );
        }

        cliente.estado = EstadosClientesEnum.BAJA;
        await this.repository.save(cliente);

        await this.auditoriaService.registrarCambio(
            TipoEntidadEnum.CLIENTE,
            cliente.id,
            TipoOperacionEnum.ELIMINAR,
            usuarioActual.sub,
            usuarioActual.nombre
        );
    }

    async obtenerClientesActivos(): Promise<ListClienteDTO[]> {
        const clientes = await this.repository.find({
            where: { estado: EstadosClientesEnum.ACTIVO },
            order: { nombre: 'ASC' }
        });

        return clientes.map(cliente => this.mapToDto(cliente));
    }

    async contarClientesTotales(): Promise<number> {
        return await this.repository.count();
    }

    async contarClientesActivos(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosClientesEnum.ACTIVO }
        });
    }

    async contarClientesPorEstado(estado: EstadosClientesEnum): Promise<number> {
        return await this.repository.countBy({ estado });
    }

    async existeClientePorId(id: number): Promise<boolean> {
        return await this.repository.exists({ where: { id } });
    }

    private mapToDto(cliente: Cliente): ListClienteDTO {
        const dto = new ListClienteDTO();
        dto.id = cliente.id;
        dto.nombre = cliente.nombre;
        dto.estado = cliente.estado;
        return dto;
    }
}