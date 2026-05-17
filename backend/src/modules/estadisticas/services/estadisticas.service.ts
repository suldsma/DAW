import { Injectable } from '@nestjs/common';
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

    async obtenerResumenGeneral() {
        // Ejecución en paralelo para optimizar la carga inicial del dashboard
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
                proyectosFinalizados: totalProyectos > 0 ? Math.round((proyectosFinalizados / totalProyectos) * 100) : 0,
                tareasCompletadas: totalTareas > 0 ? Math.round((tareasFinalizadas / totalTareas) * 100) : 0
            },
            fechaReporte: new Date().toISOString()
        };
    }

    async obtenerEstadisticasPorCliente() {
        const clientes = await this.clienteRepository.find({
            where: { estado: Not('BAJA' as any) },
            relations: ['proyectos', 'proyectos.tareas'],
            order: { nombre: 'ASC' }
        });

        return clientes.map(cliente => {
            const proyectos = cliente.proyectos || [];
            const tareas = proyectos.flatMap(p => p.tareas || []);

            return {
                clienteId: cliente.id,
                clienteNombre: cliente.nombre,
                amountProyectos: proyectos.length,
                proyectosActivos: proyectos.filter(p => p.estado === EstadosProyectosEnum.ACTIVO).length,
                cantidadTareas: tareas.length,
                tareasFinalizadas: tareas.filter(t => t.estado === EstadosTareasEnum.FINALIZADA).length
            };
        });
    }

    async obtenerEstadisticasPorProyecto() {
        const proyectos = await this.proyectoRepository.find({
            where: { estado: Not('BAJA' as any) },
            relations: ['cliente', 'tareas'],
            order: { nombre: 'ASC' }
        });

        return proyectos.map(proyecto => {
            const tareas = proyecto.tareas || [];
            const finalizadas = tareas.filter(t => t.estado === EstadosTareasEnum.FINALIZADA).length;
            
            return {
                proyectoId: proyecto.id,
                proyectoNombre: proyecto.nombre,
                estado: proyecto.estado,
                cliente: proyecto.cliente?.nombre || 'Sin Cliente', 
                totalTareas: tareas.length,
                porcentajeCompletado: tareas.length > 0 ? Math.round((finalizadas / tareas.length) * 100) : 0
            };
        });
    }

    async obtenerProyectosProximosACompletarse() {
        const stats = await this.obtenerEstadisticasPorProyecto();
        return stats
            .filter(p => p.estado === EstadosProyectosEnum.ACTIVO && p.porcentajeCompletado >= 80)
            .sort((a, b) => b.porcentajeCompletado - a.porcentajeCompletado);
    }

    async obtenerProyectosAtrasados() {
        const stats = await this.obtenerEstadisticasPorProyecto();
        return stats
            .filter(p => p.estado === EstadosProyectosEnum.ACTIVO && p.totalTareas > 0 && p.porcentajeCompletado < 20)
            .sort((a, b) => a.porcentajeCompletado - b.porcentajeCompletado);
    }
}