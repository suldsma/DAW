// BACKEND/SRC/MODULES/ESTADISTICAS/SERVICES/ESTADISTICAS.SERVICE.TS

import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

// Servicios
import { ClientesService } from '../../gestion/services/clientes.service';
import { ProyectosService } from '../../gestion/services/proyectos.service';
import { TareasService } from '../../gestion/services/tarea.service';

// Entidades
import { Proyecto } from '../../gestion/entities/proyecto.entity';
import { Tarea } from '../../gestion/entities/tarea.entity';
import { Cliente } from '../../gestion/entities/cliente.entity';

// Enums
import { EstadosProyectosEnum } from '../../gestion/enums/estados-proyectos.enum';
import { EstadosTareasEnum } from '../../gestion/enums/estados-tareas.enum';

@Injectable()
export class EstadisticasService {

    constructor(
        private readonly clientesService: ClientesService,
        private readonly proyectosService: ProyectosService,
        private readonly tareasService: TareasService,

        @InjectRepository(Proyecto)
        private readonly proyectoRepository: Repository<Proyecto>,

        @InjectRepository(Tarea)
        private readonly tareaRepository: Repository<Tarea>,

        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
    ) { }

    /**
     * =====================================================
     * RESUMEN GENERAL
     * =====================================================
     */
    async obtenerResumenGeneral() {

        const [
            totalClientes,
            clientesActivos,
            proyectosActivos,
            proyectosFinalizados,
            tareasPendientes,
            tareasFinalizadas
        ] = await Promise.all([

            this.clientesService.contarClientesTotales(),

            this.clientesService.contarClientesActivos(),

            this.proyectosService.contarProyectosPorEstado(
                EstadosProyectosEnum.ACTIVO
            ),

            this.proyectosService.contarProyectosPorEstado(
                EstadosProyectosEnum.FINALIZADO
            ),

            this.tareasService.contarTareasPorEstado(
                EstadosTareasEnum.PENDIENTE
            ),

            this.tareasService.contarTareasPorEstado(
                EstadosTareasEnum.FINALIZADA
            )
        ]);

        /**
         * Porcentaje proyectos finalizados
         */
        const totalProyectos =
            proyectosActivos + proyectosFinalizados;

        const porcentajeProyectosFinalizados =
            totalProyectos > 0
                ? Math.round(
                    (proyectosFinalizados / totalProyectos) * 100
                )
                : 0;

        /**
         * Porcentaje tareas completadas
         */
        const totalTareas =
            tareasPendientes + tareasFinalizadas;

        const porcentajeTareasCompletadas =
            totalTareas > 0
                ? Math.round(
                    (tareasFinalizadas / totalTareas) * 100
                )
                : 0;

        return {

            resumen: {
                totalClientes,
                clientesActivos,
                proyectosActivos,
                proyectosFinalizados,
                tareasPendientes,
                tareasFinalizadas
            },

            porcentajes: {
                proyectosFinalizados:
                    porcentajeProyectosFinalizados,

                tareasCompletadas:
                    porcentajeTareasCompletadas
            },

            fechaReporte: new Date().toISOString()
        };
    }

    /**
     * =====================================================
     * ESTADÍSTICAS POR CLIENTE
     * =====================================================
     */
    async obtenerEstadisticasPorCliente() {

        /**
         * ⚡ Optimizado:
         * cargar proyectos y tareas juntos
         */
        const clientes = await this.clienteRepository.find({
            relations: [
                'proyectos',
                'proyectos.tareas'
            ],
            order: {
                nombre: 'ASC'
            }
        });

        return clientes.map(cliente => {

            const proyectos = cliente.proyectos ?? [];

            const tareas = proyectos.flatMap(
                proyecto => proyecto.tareas ?? []
            );

            return {

                clienteId: cliente.id,

                clienteNombre: cliente.nombre,

                cantidadProyectos:
                    proyectos.length,

                proyectosActivos:
                    proyectos.filter(
                        proyecto =>
                            proyecto.estado ===
                            EstadosProyectosEnum.ACTIVO
                    ).length,

                proyectosFinalizados:
                    proyectos.filter(
                        proyecto =>
                            proyecto.estado ===
                            EstadosProyectosEnum.FINALIZADO
                    ).length,

                cantidadTareas:
                    tareas.length,

                tareasPendientes:
                    tareas.filter(
                        tarea =>
                            tarea.estado ===
                            EstadosTareasEnum.PENDIENTE
                    ).length,

                tareasFinalizadas:
                    tareas.filter(
                        tarea =>
                            tarea.estado ===
                            EstadosTareasEnum.FINALIZADA
                    ).length
            };
        });
    }

    /**
     * =====================================================
     * ESTADÍSTICAS POR PROYECTO
     * =====================================================
     */
    async obtenerEstadisticasPorProyecto() {

        const proyectos =
            await this.proyectoRepository.find({

                relations: [
                    'cliente',
                    'tareas'
                ],

                order: {
                    nombre: 'ASC'
                }
            });

        return proyectos.map(proyecto => {

            const tareas =
                proyecto.tareas ?? [];

            const tareasPendientes =
                tareas.filter(
                    tarea =>
                        tarea.estado ===
                        EstadosTareasEnum.PENDIENTE
                ).length;

            const tareasFinalizadas =
                tareas.filter(
                    tarea =>
                        tarea.estado ===
                        EstadosTareasEnum.FINALIZADA
                ).length;

            const porcentajeCompletado =
                tareas.length > 0
                    ? Math.round(
                        (
                            tareasFinalizadas /
                            tareas.length
                        ) * 100
                    )
                    : 0;

            return {

                proyectoId:
                    proyecto.id,

                proyectoNombre:
                    proyecto.nombre,

                estado:
                    proyecto.estado,

                cliente:
                    proyecto.cliente?.nombre ??
                    'Interno',

                totalTareas:
                    tareas.length,

                tareasPendientes,

                tareasFinalizadas,

                porcentajeCompletado
            };
        });
    }

    /**
     * =====================================================
     * PROYECTOS PRÓXIMOS A COMPLETARSE
     * =====================================================
     */
    async obtenerProyectosProximosACompletarse() {

        const estadisticas =
            await this.obtenerEstadisticasPorProyecto();

        return estadisticas
            .filter(
                proyecto =>
                    proyecto.estado ===
                    EstadosProyectosEnum.ACTIVO &&
                    proyecto.porcentajeCompletado >= 80
            )
            .sort(
                (a, b) =>
                    b.porcentajeCompletado -
                    a.porcentajeCompletado
            );
    }

    /**
     * =====================================================
     * PROYECTOS ATRASADOS
     * =====================================================
     */
    async obtenerProyectosAtrasados() {

        const estadisticas =
            await this.obtenerEstadisticasPorProyecto();

        return estadisticas
            .filter(
                proyecto =>
                    proyecto.estado ===
                    EstadosProyectosEnum.ACTIVO &&
                    proyecto.totalTareas > 0 &&
                    proyecto.porcentajeCompletado < 20
            )
            .sort(
                (a, b) =>
                    a.porcentajeCompletado -
                    b.porcentajeCompletado
            );
    }

}