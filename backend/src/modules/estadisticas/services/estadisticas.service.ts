// src/modules/estadisticas/services/estadisticas.service.ts
import { Injectable } from '@nestjs/common';
import { ClientesService } from '../../gestion/services/clientes.service';
import { ProyectosService } from '../../gestion/services/proyectos.service';
import { TareasService } from '../../gestion/services/tarea.service';
import { EstadosProyectosEnum } from '../../gestion/enums/estados-proyectos.enum';
import { EstadosTareasEnum } from '../../gestion/enums/estados-tareas.enum';

@Injectable()
export class EstadisticasService {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly proyectosService: ProyectosService,
    private readonly tareasService: TareasService,
  ) {}

  async obtenerResumenGeneral() {
    // Usamos los métodos que añadimos anteriormente en tus servicios
    const [totalClientes, activos, finalizados, tareasPendientes] = await Promise.all([
      this.clientesService.contarClientesTotales(),
      this.proyectosService.contarProyectosPorEstado(EstadosProyectosEnum.ACTIVO),
      this.proyectosService.contarProyectosPorEstado(EstadosProyectosEnum.FINALIZADO),
      this.tareasService.contarTareasPorEstado(EstadosTareasEnum.PENDIENTE),
    ]);

    return {
      totalClientes,
      proyectosActivos: activos,
      proyectosFinalizados: finalizados,
      tareasPendientesTotal: tareasPendientes,
      fechaReporte: new Date().toISOString(),
    };
  }
}