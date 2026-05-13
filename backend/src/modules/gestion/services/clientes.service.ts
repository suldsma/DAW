// BACKEND/SRC/MODULES/GESTION/SERVICES/CLIENTES.SERVICE.TS
// ✅ VERSIÓN COMPLETA, OPTIMIZADA Y CORREGIDA

import {
    Injectable,
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    NotFoundException
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import {
    Repository,
    FindOptionsWhere,
    ILike
} from "typeorm";

// =====================================================
// ENTIDADES Y ENUMS
// =====================================================

import { Cliente } from "../entities/cliente.entity";

import { EstadosClientesEnum } from "../enums/estados-clientes.enum";

// =====================================================
// DTOS
// =====================================================

import { CreateClienteDto } from "../dtos/input/create-cliente.dto";

import { UpdateClienteDto } from "../dtos/input/update-cliente.dto";

import { ListClienteDTO } from "../dtos/output/list-cliente.dto";

// =====================================================
// SERVICES
// =====================================================

import { ProyectosService } from "./proyectos.service";

@Injectable()
export class ClientesService {

    constructor(

        @InjectRepository(Cliente)
        private readonly repository: Repository<Cliente>,

        @Inject(
            forwardRef(() => ProyectosService)
        )
        private readonly proyectosService: ProyectosService

    ) { }

    // =====================================================
    // NORMALIZACIÓN
    // =====================================================

    /**
     * Normalizar nombre:
     * - trim
     * - espacios múltiples
     */
    private normalizarNombre(
        nombre: string
    ): string {

        return nombre
            .trim()
            .replace(/\s+/g, ' ');
    }

    // =====================================================
    // MÉTODOS DE LECTURA
    // =====================================================

    /**
     * Obtener clientes con filtros opcionales
     */
    async obtenerClientes(
        estado?: EstadosClientesEnum,
        nombre?: string
    ): Promise<ListClienteDTO[]> {

        const where: FindOptionsWhere<Cliente> = {};

        /**
         * Filtro estado
         */
        if (estado) {

            where.estado = estado;
        }

        /**
         * Filtro búsqueda parcial nombre
         * ILike = case insensitive PostgreSQL
         */
        if (nombre?.trim()) {

            where.nombre = ILike(
                `%${nombre.trim()}%`
            );
        }

        /**
         * Buscar clientes
         */
        const clientes =
            await this.repository.find({

                select: [
                    'id',
                    'nombre',
                    'estado'
                ],

                where,

                order: {
                    nombre: 'ASC'
                }
            });

        /**
         * Mapear DTO
         */
        return clientes.map(
            cliente => this.mapToListDto(cliente)
        );
    }

    /**
     * Obtener cliente por ID
     */
    async obtenerClientePorId(
        id: number
    ): Promise<ListClienteDTO> {

        const cliente =
            await this.repository.findOne({

                where: { id },

                select: [
                    'id',
                    'nombre',
                    'estado'
                ]
            });

        if (!cliente) {

            throw new NotFoundException(
                `Cliente con ID ${id} no encontrado`
            );
        }

        return this.mapToListDto(cliente);
    }

    /**
     * Verificar existencia cliente activo
     */
    async existeClienteActivoPorId(
        id: number
    ): Promise<boolean> {

        return await this.repository.exists({

            where: {
                id,
                estado: EstadosClientesEnum.ACTIVO
            }
        });
    }

    /**
     * Verificar existencia por nombre
     */
    async existeClientePorNombre(
        nombre: string,
        excluyendoId?: number
    ): Promise<boolean> {

        const nombreNormalizado =
            this.normalizarNombre(nombre);

        const query =
            this.repository
                .createQueryBuilder('cliente')

                .where(
                    'LOWER(cliente.nombre) = LOWER(:nombre)',
                    {
                        nombre: nombreNormalizado
                    }
                );

        /**
         * Excluir ID en update
         */
        if (excluyendoId) {

            query.andWhere(
                'cliente.id != :id',
                {
                    id: excluyendoId
                }
            );
        }

        return (
            await query.getCount()
        ) > 0;
    }

    // =====================================================
    // MÉTODOS DE ESCRITURA
    // =====================================================

    /**
     * Crear cliente
     */
    async crearCliente(
        dto: CreateClienteDto
    ): Promise<{ id: number }> {

        /**
         * Normalizar nombre
         */
        const nombreNormalizado =
            this.normalizarNombre(dto.nombre);

        /**
         * Validar duplicados
         */
        const yaExiste =
            await this.existeClientePorNombre(
                nombreNormalizado
            );

        if (yaExiste) {

            throw new ConflictException(
                `Ya existe un cliente con el nombre "${nombreNormalizado}"`
            );
        }

        /**
         * Crear entidad
         */
        const cliente =
            this.repository.create({

                ...dto,

                nombre: nombreNormalizado,

                estado:
                    EstadosClientesEnum.ACTIVO
            });

        /**
         * Guardar
         */
        const clienteGuardado =
            await this.repository.save(cliente);

        return {
            id: clienteGuardado.id
        };
    }

    /**
     * Actualizar cliente
     */
    async actualizarCliente(
        id: number,
        dto: UpdateClienteDto
    ): Promise<void> {

        /**
         * Buscar cliente
         */
        const cliente =
            await this.repository.findOneBy({ id });

        if (!cliente) {

            throw new NotFoundException(
                `Cliente con ID ${id} no encontrado`
            );
        }

        /**
         * Validar unicidad nombre
         */
        if (dto.nombre?.trim()) {

            const nombreNormalizado =
                this.normalizarNombre(
                    dto.nombre
                );

            /**
             * Verificar cambios
             */
            if (
                nombreNormalizado.toLowerCase() !==
                cliente.nombre.toLowerCase()
            ) {

                const yaExiste =
                    await this.existeClientePorNombre(
                        nombreNormalizado,
                        id
                    );

                if (yaExiste) {

                    throw new ConflictException(
                        `Ya existe un cliente con el nombre "${nombreNormalizado}"`
                    );
                }
            }

            dto.nombre = nombreNormalizado;
        }

        /**
         * Validar baja lógica
         */
        if (
            dto.estado ===
            EstadosClientesEnum.BAJA
        ) {

            const tieneProyectos =
                await this.proyectosService
                    .existeProyectoPorIdCliente(
                        id
                    );

            if (tieneProyectos) {

                throw new BadRequestException(
                    'No se puede dar de baja un cliente con proyectos relacionados'
                );
            }
        }

        /**
         * Actualizar entidad
         */
        Object.assign(
            cliente,
            dto
        );

        /**
         * Guardar cambios
         */
        await this.repository.save(cliente);
    }

    /**
     * =====================================================
     * BAJA LÓGICA CLIENTE
     * =====================================================
     * IMPORTANTE:
     * No elimina físicamente el registro.
     */
    async eliminarCliente(
        id: number
    ): Promise<void> {

        /**
         * Buscar cliente
         */
        const cliente =
            await this.repository.findOneBy({ id });

        if (!cliente) {

            throw new NotFoundException(
                `Cliente con ID ${id} no encontrado`
            );
        }

        /**
         * Validar proyectos relacionados
         */
        const tieneProyectos =
            await this.proyectosService
                .existeProyectoPorIdCliente(id);

        if (tieneProyectos) {

            throw new BadRequestException(
                'No se puede eliminar un cliente con proyectos relacionados'
            );
        }

        /**
         * Ya está dado de baja
         */
        if (
            cliente.estado ===
            EstadosClientesEnum.BAJA
        ) {

            throw new BadRequestException(
                'El cliente ya se encuentra dado de baja'
            );
        }

        /**
         * Baja lógica
         */
        cliente.estado =
            EstadosClientesEnum.BAJA;

        /**
         * Guardar cambios
         */
        await this.repository.save(cliente);
    }

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    /**
     * Total clientes
     */
    async contarClientesTotales(): Promise<number> {

        return await this.repository.count();
    }

    /**
     * Total clientes activos
     */
    async contarClientesActivos(): Promise<number> {

        return await this.repository.count({

            where: {
                estado: EstadosClientesEnum.ACTIVO
            }
        });
    }

    // =====================================================
    // MÉTODOS PRIVADOS
    // =====================================================

    /**
     * Mapper DTO listado
     */
    private mapToListDto(
        cliente: Cliente
    ): ListClienteDTO {

        return {

            id: cliente.id,

            nombre: cliente.nombre,

            estado: cliente.estado
        };
    }

}