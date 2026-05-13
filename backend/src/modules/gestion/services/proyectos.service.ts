// BACKEND/SRC/MODULES/GESTION/SERVICES/PROYECTOS.SERVICE.TS
// ✅ VERSIÓN OPTIMIZADA, CORREGIDA Y PROFESIONAL

import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import {
    Repository,
    In,
    ILike,
    FindOptionsWhere
} from "typeorm";

// =====================================================
// ENTIDADES Y ENUMS
// =====================================================

import { Proyecto } from "../entities/proyecto.entity";

import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

import { EstadosTareasEnum } from "../enums/estados-tareas.enum";

// =====================================================
// DTOS
// =====================================================

import { CreateProyectoDto } from "../dtos/input/create-proyecto.dto";

import { UpdateProyectoDto } from "../dtos/input/update-proyecto.dto";

import { ListProyectoDTO } from "../dtos/output/list-proyecto.dto";

import { ProyectoDTO } from "../dtos/output/proyecto.dto";

import { ListTareaDTO } from "../dtos/output/list-tarea.dto";

import { ListClienteDTO } from "../dtos/output/list-cliente.dto";

// =====================================================
// SERVICES
// =====================================================

import { ClientesService } from "./clientes.service";

@Injectable()
export class ProyectosService {

    constructor(

        @InjectRepository(Proyecto)
        private readonly repository: Repository<Proyecto>,

        @Inject(
            forwardRef(() => ClientesService)
        )
        private readonly clientesService: ClientesService

    ) { }

    // =====================================================
    // NORMALIZACIÓN
    // =====================================================

    /**
     * Normalizar nombre
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
     * Obtener listado proyectos
     */
    async obtenerProyectos(
        nombre?: string,
        estado?: EstadosProyectosEnum
    ): Promise<ListProyectoDTO[]> {

        const where:
            FindOptionsWhere<Proyecto> = {};

        /**
         * Filtro nombre
         */
        if (nombre?.trim()) {

            where.nombre = ILike(
                `%${nombre.trim()}%`
            );
        }

        /**
         * Filtro estado
         */
        if (estado) {

            where.estado = estado;

        } else {

            /**
             * Excluir BAJA por defecto
             */
            where.estado = In([
                EstadosProyectosEnum.ACTIVO,
                EstadosProyectosEnum.FINALIZADO
            ]);
        }

        /**
         * Buscar proyectos
         */
        const proyectos =
            await this.repository.find({

                where,

                relations: {
                    cliente: true
                },

                order: {
                    nombre: 'ASC'
                }
            });

        /**
         * Mapear DTOs
         */
        return proyectos.map(
            proyecto => this.mapToListDto(proyecto)
        );
    }

    /**
     * Obtener detalle proyecto
     */
    async obtenerProyecto(
        id: number
    ): Promise<ProyectoDTO> {

        const proyecto =
            await this.repository.findOne({

                where: { id },

                relations: {
                    cliente: true,
                    tareas: true
                }
            });

        if (!proyecto) {

            throw new NotFoundException(
                `Proyecto con ID ${id} no encontrado`
            );
        }

        /**
         * Filtrar tareas NO dadas de baja
         */
        const tareasActivas =
            proyecto.tareas.filter(

                tarea =>
                    tarea.estado !==
                    EstadosTareasEnum.BAJA
            );

        /**
         * Construir DTO
         */
        const dto =
            new ProyectoDTO();

        dto.id = proyecto.id;

        dto.nombre = proyecto.nombre;

        dto.estado = proyecto.estado;

        dto.cliente =
            proyecto.cliente?.nombre;

        dto.tareas =
            tareasActivas.map(tarea => {

                const tareaDto =
                    new ListTareaDTO();

                tareaDto.id = tarea.id;

                tareaDto.descripcion =
                    tarea.descripcion;

                tareaDto.estado =
                    tarea.estado;

                return tareaDto;
            });

        return dto;
    }

    /**
     * Verificar nombre único
     */
    async existeProyectoPorNombre(
        nombre: string,
        excluyendoId?: number
    ): Promise<boolean> {

        const nombreNormalizado =
            this.normalizarNombre(nombre);

        const query =
            this.repository
                .createQueryBuilder('proyecto')

                .where(
                    'LOWER(proyecto.nombre) = LOWER(:nombre)',
                    {
                        nombre: nombreNormalizado
                    }
                );

        /**
         * Excluir ID
         */
        if (excluyendoId) {

            query.andWhere(
                'proyecto.id != :id',
                {
                    id: excluyendoId
                }
            );
        }

        return (
            await query.getCount()
        ) > 0;
    }

    /**
     * Verificar existencia por ID
     */
    async existeProyectoPorId(
        id: number
    ): Promise<boolean> {

        return await this.repository.exists({

            where: { id }
        });
    }

    // =====================================================
    // MÉTODOS DE ESCRITURA
    // =====================================================

    /**
     * Crear proyecto
     */
    async crearProyecto(
        dto: CreateProyectoDto
    ): Promise<{ id: number }> {

        /**
         * Normalizar nombre
         */
        const nombreNormalizado =
            this.normalizarNombre(
                dto.nombre
            );

        /**
         * Validar nombre único
         */
        const yaExiste =
            await this.existeProyectoPorNombre(
                nombreNormalizado
            );

        if (yaExiste) {

            throw new ConflictException(
                `Ya existe un proyecto con el nombre "${nombreNormalizado}"`
            );
        }

        /**
         * Validar cliente activo
         */
        if (dto.idCliente) {

            const clienteActivo =
                await this.clientesService
                    .existeClienteActivoPorId(
                        dto.idCliente
                    );

            if (!clienteActivo) {

                throw new BadRequestException(
                    'Solo se puede asociar un cliente ACTIVO'
                );
            }
        }

        /**
         * Crear entidad
         */
        const proyecto =
            this.repository.create({

                ...dto,

                nombre: nombreNormalizado,

                estado:
                    EstadosProyectosEnum.ACTIVO
            });

        /**
         * Guardar
         */
        const proyectoGuardado =
            await this.repository.save(
                proyecto
            );

        return {
            id: proyectoGuardado.id
        };
    }

    /**
     * Actualizar proyecto
     */
    async actualizarProyecto(
        id: number,
        dto: UpdateProyectoDto
    ): Promise<void> {

        /**
         * Buscar proyecto
         */
        const proyecto =
            await this.repository.findOneBy({
                id
            });

        if (!proyecto) {

            throw new NotFoundException(
                `Proyecto con ID ${id} no encontrado`
            );
        }

        /**
         * Validar cambio nombre
         */
        if (dto.nombre?.trim()) {

            const nombreNormalizado =
                this.normalizarNombre(
                    dto.nombre
                );

            /**
             * Comparar cambios
             */
            if (

                nombreNormalizado.toLowerCase() !==
                proyecto.nombre.toLowerCase()

            ) {

                const yaExiste =
                    await this.existeProyectoPorNombre(
                        nombreNormalizado,
                        id
                    );

                if (yaExiste) {

                    throw new ConflictException(
                        `Ya existe un proyecto con el nombre "${nombreNormalizado}"`
                    );
                }
            }

            dto.nombre =
                nombreNormalizado;
        }

        /**
         * Validar cliente nuevo
         */
        if (

            dto.idCliente &&
            dto.idCliente !== proyecto.idCliente

        ) {

            const clienteActivo =
                await this.clientesService
                    .existeClienteActivoPorId(
                        dto.idCliente
                    );

            if (!clienteActivo) {

                throw new BadRequestException(
                    'El nuevo cliente debe estar ACTIVO'
                );
            }
        }

        /**
         * Evitar reactivar proyectos dados de baja
         */
        if (

            proyecto.estado ===
            EstadosProyectosEnum.BAJA &&

            dto.estado ===
            EstadosProyectosEnum.ACTIVO

        ) {

            throw new BadRequestException(
                'No se puede reactivar un proyecto dado de baja'
            );
        }

        /**
         * Actualizar entidad
         */
        Object.assign(
            proyecto,
            dto
        );

        /**
         * Guardar cambios
         */
        await this.repository.save(
            proyecto
        );
    }

    /**
     * =====================================================
     * BAJA LÓGICA PROYECTO
     * =====================================================
     */
    async eliminarProyecto(
        id: number
    ): Promise<void> {

        /**
         * Buscar proyecto
         */
        const proyecto =
            await this.repository.findOneBy({
                id
            });

        if (!proyecto) {

            throw new NotFoundException(
                `Proyecto con ID ${id} no encontrado`
            );
        }

        /**
         * Ya dado de baja
         */
        if (

            proyecto.estado ===
            EstadosProyectosEnum.BAJA

        ) {

            throw new BadRequestException(
                'El proyecto ya se encuentra dado de baja'
            );
        }

        /**
         * Baja lógica
         */
        proyecto.estado =
            EstadosProyectosEnum.BAJA;

        /**
         * Guardar
         */
        await this.repository.save(
            proyecto
        );
    }

    // =====================================================
    // EXPORTACIÓN CSV
    // =====================================================

    /**
     * Obtener proyectos para exportación
     */
    async obtenerProyectosParaExportacion():
        Promise<Proyecto[]> {

        return await this.repository.find({

            relations: {
                cliente: true
            },

            where: {
                estado: In([
                    EstadosProyectosEnum.ACTIVO,
                    EstadosProyectosEnum.FINALIZADO
                ])
            },

            order: {
                nombre: 'ASC'
            }
        });
    }

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    /**
     * Contar proyectos por estado
     */
    async contarProyectosPorEstado(
        estado: EstadosProyectosEnum
    ): Promise<number> {

        return await this.repository.count({

            where: { estado }
        });
    }

    /**
     * Verificar proyectos cliente
     */
    async existeProyectoPorIdCliente(
        idCliente: number
    ): Promise<boolean> {

        return await this.repository.exists({

            where: {

                idCliente,

                estado: In([
                    EstadosProyectosEnum.ACTIVO,
                    EstadosProyectosEnum.FINALIZADO
                ])
            }
        });
    }

    /**
     * Contar proyectos activos
     */
    async contarProyectosActivos():
        Promise<number> {

        return await this.repository.count({

            where: {
                estado:
                    EstadosProyectosEnum.ACTIVO
            }
        });
    }

    /**
     * Contar proyectos finalizados
     */
    async contarProyectosFinalizados():
        Promise<number> {

        return await this.repository.count({

            where: {
                estado:
                    EstadosProyectosEnum.FINALIZADO
            }
        });
    }

    // =====================================================
    // MAPPERS
    // =====================================================

    /**
     * Mapear DTO listado
     */
    private mapToListDto(
        proyecto: Proyecto
    ): ListProyectoDTO {

        const dto =
            new ListProyectoDTO();

        dto.id =
            proyecto.id;

        dto.nombre =
            proyecto.nombre;

        dto.estado =
            proyecto.estado;

        /**
         * Cliente
         */
        if (proyecto.cliente) {

            dto.cliente =
                new ListClienteDTO();

            dto.cliente.id =
                proyecto.cliente.id;

            dto.cliente.nombre =
                proyecto.cliente.nombre;

            dto.cliente.estado =
                proyecto.cliente.estado;

        } else {

            dto.cliente = null;
        }

        return dto;
    }

}