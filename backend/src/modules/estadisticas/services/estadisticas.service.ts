import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { ClientesService } from '../../gestion/services/clientes.service';
import { ProyectosService } from '../../gestion/services/proyectos.service';
import { TareasService } from '../../gestion/services/tareas.service';

import { Proyecto } from '../../gestion/entities/proyecto.entity';
import { Tarea } from '../../gestion/entities/tarea.entity';
import { Cliente } from '../../gestion/entities/cliente.entity';

import { EstadosProyectosEnum } from '../../gestion/enums/estados-proyectos.enum';
import { EstadosTareasEnum } from '../../gestion/enums/estados-tareas.enum';
import { EstadosClientesEnum } from '../../gestion/enums/estados-clientes.enum';

@Injectable()
export class EstadisticasService {

    private readonly logger = new Logger(EstadisticasService.name);

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
     * Obtiene resumen general del sistema con métricas principales
     * @returns Objeto con resumen, porcentajes y fecha del reporte
     */
    async obtenerResumenGeneral() {
        try {
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
                this.proyectosService.contarProyectosPorEstado(EstadosProyectosEnum.ACTIVO),
                this.proyectosService.contarProyectosPorEstado(EstadosProyectosEnum.FINALIZADO),
                this.tareasService.contarTareasPorEstado(EstadosTareasEnum.PENDIENTE),
                this.tareasService.contarTareasPorEstado(EstadosTareasEnum.FINALIZADA)
            ]);

            const totalProyectos = proyectosActivos + proyectosFinalizados;
            const totalTareas = tareasPendientes + tareasFinalizadas;

            const resumen = {
                resumen: {
                    totalClientes,
                    clientesActivos,
                    proyectosActivos,
                    proyectosFinalizados,
                    tareasPendientes,
                    tareasFinalizadas
                },
                porcentajes: {
                    proyectosFinalizados: totalProyectos > 0 
                        ? Math.round((proyectosFinalizados / totalProyectos) * 100) 
                        : 0,
                    tareasCompletadas: totalTareas > 0 
                        ? Math.round((tareasFinalizadas / totalTareas) * 100) 
                        : 0
                },
                fechaReporte: new Date().toISOString()
            };

            this.logger.log('Resumen general calculado correctamente');
            return resumen;

        } catch (error) {
            this.logger.error(
                'Error al obtener resumen general',
                error instanceof Error ? error.stack : String(error),
                'EstadisticasService.obtenerResumenGeneral'
            );
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de clientes con sus proyectos y tareas
     * @returns Array de estadísticas por cliente
     */
    async obtenerEstadisticasPorCliente() {
        try {
            const clientes = await this.clienteRepository.find({
                where: { estado: EstadosClientesEnum.ACTIVO },
                relations: ['proyectos', 'proyectos.tareas'],
                order: { nombre: 'ASC' }
            });

            const estadisticas = clientes.map(cliente => {
                const proyectos = cliente.proyectos || [];
                const tareas = proyectos.flatMap(p => p.tareas || []);

                return {
                    clienteId: cliente.id,
                    clienteNombre: cliente.nombre,
                    cantidadProyectos: proyectos.length,
                    proyectosActivos: proyectos.filter(
                        p => p.estado === EstadosProyectosEnum.ACTIVO
                    ).length,
                    cantidadTareas: tareas.length,
                    tareasFinalizadas: tareas.filter(
                        t => t.estado === EstadosTareasEnum.FINALIZADA
                    ).length
                };
            });

            this.logger.log(`Estadísticas por cliente calculadas: ${estadisticas.length} clientes`);
            return estadisticas;

        } catch (error) {
            this.logger.error(
                'Error al obtener estadísticas por cliente',
                error instanceof Error ? error.stack : String(error),
                'EstadisticasService.obtenerEstadisticasPorCliente'
            );
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de proyectos con información de tareas
     * @returns Array de estadísticas por proyecto
     */
    async obtenerEstadisticasPorProyecto() {
        try {
            const proyectos = await this.proyectoRepository.find({
                where: { estado: EstadosProyectosEnum.ACTIVO },
                relations: ['cliente', 'tareas'],
                order: { nombre: 'ASC' }
            });

            const estadisticas = proyectos.map(proyecto => {
                const tareas = proyecto.tareas || [];
                const finalizadas = tareas.filter(
                    t => t.estado === EstadosTareasEnum.FINALIZADA
                ).length;

                return {
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.nombre,
                    estado: proyecto.estado,
                    cliente: proyecto.cliente?.nombre || 'Interno',
                    totalTareas: tareas.length,
                    porcentajeCompletado: tareas.length > 0 
                        ? Math.round((finalizadas / tareas.length) * 100) 
                        : 0
                };
            });

            this.logger.log(`Estadísticas por proyecto calculadas: ${estadisticas.length} proyectos`);
            return estadisticas;

        } catch (error) {
            this.logger.error(
                'Error al obtener estadísticas por proyecto',
                error instanceof Error ? error.stack : String(error),
                'EstadisticasService.obtenerEstadisticasPorProyecto'
            );
            throw error;
        }
    }

    /**
     * Obtiene proyectos próximos a completarse (80%+ de avance)
     * @returns Array de proyectos ordenados por porcentaje completado
     */
    async obtenerProyectosProximosACompletarse() {
        try {
            const stats = await this.obtenerEstadisticasPorProyecto();
            const proximos = stats
                .filter(p => p.estado === EstadosProyectosEnum.ACTIVO && p.porcentajeCompletado >= 80)
                .sort((a, b) => b.porcentajeCompletado - a.porcentajeCompletado);

            this.logger.log(`Proyectos próximos a completarse: ${proximos.length}`);
            return proximos;

        } catch (error) {
            this.logger.error(
                'Error al obtener proyectos próximos a completarse',
                error instanceof Error ? error.stack : String(error),
                'EstadisticasService.obtenerProyectosProximosACompletarse'
            );
            throw error;
        }
    }

    /**
     * Obtiene proyectos atrasados (menos de 20% de avance)
     * @returns Array de proyectos ordenados por porcentaje completado (menor a mayor)
     */
    async obtenerProyectosAtrasados() {
        try {
            const stats = await this.obtenerEstadisticasPorProyecto();
            const atrasados = stats
                .filter(p => 
                    p.estado === EstadosProyectosEnum.ACTIVO && 
                    p.totalTareas > 0 && 
                    p.porcentajeCompletado < 20
                )
                .sort((a, b) => a.porcentajeCompletado - b.porcentajeCompletado);

            this.logger.log(`Proyectos atrasados identificados: ${atrasados.length}`);
            return atrasados;

        } catch (error) {
            this.logger.error(
                'Error al obtener proyectos atrasados',
                error instanceof Error ? error.stack : String(error),
                'EstadisticasService.obtenerProyectosAtrasados'
            );
            throw error;
        }
    }
}