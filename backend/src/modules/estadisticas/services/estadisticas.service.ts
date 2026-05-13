// BACKEND/SRC/MODULES/ESTADISTICAS/SERVICES/ESTADISTICAS.SERVICE.TS
import { Injectable } from '@nestjs/common';
import { ClientesService } from '../../gestion/services/clientes.service';
import { ProyectosService } from '../../gestion/services/proyectos.service';
import { TareasService } from '../../gestion/services/tarea.service';
import { EstadosProyectosEnum } from '../../gestion/enums/estados-proyectos.enum';
import { EstadosTareasEnum } from '../../gestion/enums/estados-tareas.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '../../gestion/entities/proyecto.entity';
import { Tarea } from '../../gestion/entities/tarea.entity';
import { Cliente } from '../../gestion/entities/cliente.entity';

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
     * ✅ MEJORADO: Resumen general más detallado
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
            this.proyectosService.contarProyectosPorEstado(EstadosProyectosEnum.ACTIVO),
            this.proyectosService.contarProyectosPorEstado(EstadosProyectosEnum.FINALIZADO),
            this.tareasService.contarTareasPorEstado(EstadosTareasEnum.PENDIENTE),
            this.tareasService.contarTareasPorEstado(EstadosTareasEnum.FINALIZADA),
        ]);

        const porcentajeProyectosFinalizados = proyectosActivos + proyectosFinalizados > 0
            ? Math.round((proyectosFinalizados / (proyectosActivos + proyectosFinalizados)) * 100)
            : 0;

        const porcentajeTareasCompletadas = tareasPendientes + tareasFinalizadas > 0
            ? Math.round((tareasFinalizadas / (tareasPendientes + tareasFinalizadas)) * 100)
            : 0;

        return {
            resumen: {
                totalClientes,
                clientesActivos,
                proyectosActivos,
                proyectosFinalizados,
                tareasPendientes,
                tareasFinalizadas,
            },
            porcentajes: {
                proyectosFinalizados: porcentajeProyectosFinalizados,
                tareasCompletadas: porcentajeTareasCompletadas,
            },
            fechaReporte: new Date().toISOString(),
        };
    }

    /**
     * ✅ NUEVA: Estadísticas por cliente
     */
    async obtenerEstadisticasPorCliente() {
        const clientes = await this.clienteRepository.find({
            relations: ['proyectos'],
        });

        return await Promise.all(
            clientes.map(async (cliente) => {
                const proyectos = await this.proyectoRepository.find({
                    where: { idCliente: cliente.id },
                });

                const tareasPromise = proyectos.length > 0
                    ? this.tareaRepository.createQueryBuilder('tarea')
                        .innerJoin('tarea.proyecto', 'proyecto')
                        .where('proyecto.id_cliente = :idCliente', { idCliente: cliente.id })
                        .getMany()
                    : Promise.resolve([]);

                const tareas = await tareasPromise;

                return {
                    clienteId: cliente.id,
                    clienteNombre: cliente.nombre,
                    cantidadProyectos: proyectos.length,
                    proyectosActivos: proyectos.filter(p => p.estado === EstadosProyectosEnum.ACTIVO).length,
                    cantidadTareas: tareas.length,
                    tareasCompletadas: tareas.filter(t => t.estado === EstadosTareasEnum.FINALIZADA).length,
                    tareasEnProgreso: tareas.filter(t => t.estado === EstadosTareasEnum.PENDIENTE).length,
                };
            })
        );
    }

    /**
     * ✅ NUEVA: Estadísticas detalladas por proyecto
     */
    async obtenerEstadisticasPorProyecto() {
        const proyectos = await this.proyectoRepository.find({
            relations: ['tareas', 'cliente'],
        });

        return proyectos.map((proyecto) => {
            const tareasPendientes = proyecto.tareas.filter(
                t => t.estado === EstadosTareasEnum.PENDIENTE
            ).length;
            const tareasFinalizadas = proyecto.tareas.filter(
                t => t.estado === EstadosTareasEnum.FINALIZADA
            ).length;

            const porcentajeCompletado = proyecto.tareas.length > 0
                ? Math.round((tareasFinalizadas / proyecto.tareas.length) * 100)
                : 0;

            return {
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                estado: proyecto.estado,
                cliente: proyecto.cliente?.nombre || 'Interno',
                totalTareas: proyecto.tareas.length,
                tareasPendientes,
                tareasFinalizadas,
                porcentajeCompletado,
            };
        });
    }

    /**
     * ✅ NUEVA: Tareas próximas a completarse (más del 80% completadas)
     */
    async obtenerProyectosProximosACompletarse() {
        const estadisticas = await this.obtenerEstadisticasPorProyecto();
        
        return estadisticas
            .filter(e => e.porcentajeCompletado >= 80 && e.estado === EstadosProyectosEnum.ACTIVO)
            .sort((a, b) => b.porcentajeCompletado - a.porcentajeCompletado);
    }

    /**
     * ✅ NUEVA: Proyectos atrasados (muchas tareas pendientes)
     */
    async obtenerProyectosAtrasados() {
        const estadisticas = await this.obtenerEstadisticasPorProyecto();
        
        return estadisticas
            .filter(e => e.porcentajeCompletado < 20 && e.totalTareas > 0 && e.estado === EstadosProyectosEnum.ACTIVO)
            .sort((a, b) => a.porcentajeCompletado - b.porcentajeCompletado);
    }

}