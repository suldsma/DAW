// BACKEND/SRC/MODULES/GESTION/SERVICES/TAREA.SERVICE.TS
// ✅ VERSIÓN OPTIMIZADA, PROFESIONAL Y CORREGIDA

import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
    ConflictException
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import {
    Repository,
    ILike,
    FindOptionsWhere,
    Not
} from "typeorm";

// =====================================================
// ENTIDADES Y ENUMS
// =====================================================

import { Tarea } from "../entities/tarea.entity";

import { EstadosTareasEnum } from "../enums/estados-tareas.enum";

import { EstadosProyectosEnum } from "../enums/estados-proyectos.enum";

// =====================================================
// DTOS
// =====================================================

import { CreateTareaDto } from "../dtos/input/create-tarea.dto";

import { UpdateTareaDto } from "../dtos/input/update-tarea.dto";

// =====================================================
// SERVICES
// =====================================================

import { ProyectosService } from "./proyectos.service";

@Injectable()
export class TareasService {

    constructor(

        @InjectRepository(Tarea)
        private readonly repository: Repository<Tarea>,

        @Inject(
            forwardRef(() => ProyectosService)
        )
        private readonly proyectosService: ProyectosService

    ) { }

    // =====================================================
    // NORMALIZACIÓN
    // =====================================================

    /**
     * Normalizar descripción
     */
    private normalizarDescripcion(
        descripcion: string
    ): string {

        return descripcion
            .trim()
            .replace(/\s+/g, ' ');
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    /**
     * Verificar existencia proyecto
     */
    async existeProyecto(
        idProyecto: number
    ): Promise<boolean> {

        return await this.proyectosService
            .existeProyectoPorId(
                idProyecto
            );
    }

    /**
     * Validar proyecto existente
     */
    private async validarProyectoExiste(
        idProyecto: number
    ): Promise<void> {

        const existe =
            await this.existeProyecto(
                idProyecto
            );

        if (!existe) {

            throw new BadRequestException(
                `El proyecto con ID ${idProyecto} no existe`
            );
        }
    }

    /**
     * Validar transición estados
     */
    private validarCambioEstado(
        estadoActual: EstadosTareasEnum,
        nuevoEstado: EstadosTareasEnum
    ): void {

        /**
         * Evitar reactivar BAJA
         */
        if (

            estadoActual ===
            EstadosTareasEnum.BAJA &&

            nuevoEstado !==
            EstadosTareasEnum.BAJA

        ) {

            throw new BadRequestException(
                'No se puede reactivar una tarea dada de baja'
            );
        }

        /**
         * Evitar cambios innecesarios
         */
        if (estadoActual === nuevoEstado) {

            throw new ConflictException(
                'La tarea ya posee ese estado'
            );
        }
    }

    // =====================================================
    // MÉTODOS DE LECTURA
    // =====================================================

    /**
     * Obtener tareas proyecto
     */
    async obtenerTareas(
        idProyecto: number,
        descripcion?: string,
        estado?: EstadosTareasEnum
    ): Promise<Tarea[]> {

        /**
         * Validar proyecto
         */
        await this.validarProyectoExiste(
            idProyecto
        );

        const where:
            FindOptionsWhere<Tarea> = {

            idProyecto
        };

        /**
         * Filtro descripción
         */
        if (descripcion?.trim()) {

            where.descripcion = ILike(
                `%${descripcion.trim()}%`
            );
        }

        /**
         * Filtro estado
         */
        if (estado) {

            where.estado = estado;

        } else {

            /**
             * Excluir BAJA
             */
            where.estado =
                Not(
                    EstadosTareasEnum.BAJA
                ) as any;
        }

        /**
         * Buscar tareas
         */
        return await this.repository.find({

            where,

            order: {
                id: 'ASC'
            }
        });
    }

    /**
     * Obtener tarea por ID
     */
    async obtenerTareaPorId(
        idTarea: number
    ): Promise<Tarea> {

        const tarea =
            await this.repository.findOneBy({

                id: idTarea
            });

        if (!tarea) {

            throw new NotFoundException(
                `Tarea con ID ${idTarea} no encontrada`
            );
        }

        return tarea;
    }

    // =====================================================
    // MÉTODOS DE ESCRITURA
    // =====================================================

    /**
     * Crear tarea
     */
    async crearTarea(
        dto: CreateTareaDto,
        idProyecto: number
    ): Promise<{ id: number }> {

        /**
         * Validar proyecto
         */
        await this.validarProyectoExiste(
            idProyecto
        );

        /**
         * Validar descripción
         */
        if (

            !dto.descripcion ||
            !dto.descripcion.trim()

        ) {

            throw new BadRequestException(
                'La descripción de la tarea no puede estar vacía'
            );
        }

        /**
         * Normalizar descripción
         */
        const descripcionNormalizada =
            this.normalizarDescripcion(
                dto.descripcion
            );

        /**
         * Crear entidad
         */
        const tarea =
            this.repository.create({

                ...dto,

                descripcion:
                    descripcionNormalizada,

                estado:
                    EstadosTareasEnum.PENDIENTE,

                idProyecto
            });

        /**
         * Guardar
         */
        const tareaGuardada =
            await this.repository.save(
                tarea
            );

        return {
            id: tareaGuardada.id
        };
    }

    /**
     * Actualizar tarea
     */
    async actualizarTarea(
        idTarea: number,
        dto: UpdateTareaDto
    ): Promise<void> {

        /**
         * Buscar tarea
         */
        const tarea =
            await this.repository.findOneBy({

                id: idTarea
            });

        if (!tarea) {

            throw new NotFoundException(
                `Tarea con ID ${idTarea} no encontrada`
            );
        }

        /**
         * Validar descripción
         */
        if (
            dto.descripcion !== undefined
        ) {

            if (!dto.descripcion.trim()) {

                throw new BadRequestException(
                    'La descripción no puede estar vacía'
                );
            }

            dto.descripcion =
                this.normalizarDescripcion(
                    dto.descripcion
                );
        }

        /**
         * Validar cambio estado
         */
        if (dto.estado) {

            this.validarCambioEstado(
                tarea.estado,
                dto.estado
            );
        }

        /**
         * Actualizar entidad
         */
        Object.assign(
            tarea,
            dto
        );

        /**
         * Guardar
         */
        await this.repository.save(
            tarea
        );
    }

    /**
     * =====================================================
     * BAJA LÓGICA
     * =====================================================
     */
    async eliminarTarea(
        idTarea: number
    ): Promise<void> {

        /**
         * Buscar tarea
         */
        const tarea =
            await this.repository.findOneBy({

                id: idTarea
            });

        if (!tarea) {

            throw new NotFoundException(
                `Tarea con ID ${idTarea} no encontrada`
            );
        }

        /**
         * Ya está en BAJA
         */
        if (

            tarea.estado ===
            EstadosTareasEnum.BAJA

        ) {

            throw new BadRequestException(
                'La tarea ya fue dada de baja'
            );
        }

        /**
         * Baja lógica
         */
        tarea.estado =
            EstadosTareasEnum.BAJA;

        /**
         * Guardar
         */
        await this.repository.save(
            tarea
        );
    }

    // =====================================================
    // KANBAN
    // =====================================================

    /**
     * Obtener tablero Kanban
     */
    async obtenerTareasKanban(
        idProyecto: number
    ): Promise<Record<string, Tarea[]>> {

        /**
         * Validar proyecto
         */
        await this.validarProyectoExiste(
            idProyecto
        );

        /**
         * Obtener tareas activas
         */
        const tareas =
            await this.repository.find({

                where: {

                    idProyecto,

                    estado:
                        Not(
                            EstadosTareasEnum.BAJA
                        ) as any
                },

                order: {
                    id: 'ASC'
                }
            });

        /**
         * Estructura tablero
         */
        const tablero:
            Record<string, Tarea[]> = {

            [EstadosTareasEnum.PENDIENTE]: [],

            [EstadosTareasEnum.FINALIZADA]: []
        };

        /**
         * Agrupar tareas
         */
        tareas.forEach(tarea => {

            const estado =
                tarea.estado.toString();

            /**
             * Crear bucket dinámico
             */
            if (!tablero[estado]) {

                tablero[estado] = [];
            }

            tablero[estado].push(
                tarea
            );
        });

        return tablero;
    }

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    /**
     * Contar tareas por estado
     */
    async contarTareasPorEstado(
        estado: EstadosTareasEnum
    ): Promise<number> {

        return await this.repository.count({

            where: { estado }
        });
    }

    /**
     * Contar tareas proyecto
     */
    async contarTareasPorProyecto(
        idProyecto: number
    ): Promise<number> {

        return await this.repository.count({

            where: {

                idProyecto,

                estado:
                    Not(
                        EstadosTareasEnum.BAJA
                    ) as any
            }
        });
    }

    /**
     * Contar tareas finalizadas
     */
    async contarTareasFinalizadasPorProyecto(
        idProyecto: number
    ): Promise<number> {

        return await this.repository.count({

            where: {

                idProyecto,

                estado:
                    EstadosTareasEnum.FINALIZADA
            }
        });
    }

    /**
     * Contar tareas pendientes
     */
    async contarTareasPendientesPorProyecto(
        idProyecto: number
    ): Promise<number> {

        return await this.repository.count({

            where: {

                idProyecto,

                estado:
                    EstadosTareasEnum.PENDIENTE
            }
        });
    }

}