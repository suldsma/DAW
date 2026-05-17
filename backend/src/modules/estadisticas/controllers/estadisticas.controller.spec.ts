import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from '../services/estadisticas.service';
import { ClientesService } from '../../gestion/services/clientes.service';
import { ProyectosService } from '../../gestion/services/proyectos.service';
import { TareasService } from '../../gestion/services/tareas.service';
import { UsuariosService } from '../../auth/services/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Proyecto } from '../../gestion/entities/proyecto.entity';
import { Tarea } from '../../gestion/entities/tarea.entity';
import { Cliente } from '../../gestion/entities/cliente.entity';

describe('EstadisticasController', () => {
  let controller: EstadisticasController;
  let service: EstadisticasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadisticasController],
      providers: [
        {
          provide: EstadisticasService,
          useValue: {
            obtenerResumenGeneral: jest.fn().mockResolvedValue({
              resumen: {
                totalClientes: 5,
                clientesActivos: 4,
                proyectosActivos: 3,
                proyectosFinalizados: 2,
                tareasPendientes: 10,
                tareasFinalizadas: 8
              },
              porcentajes: {
                proyectosFinalizados: 40,
                tareasCompletadas: 44
              },
              fechaReporte: new Date().toISOString()
            }),
            obtenerEstadisticasPorCliente: jest.fn().mockResolvedValue([]),
            obtenerEstadisticasPorProyecto: jest.fn().mockResolvedValue([]),
            obtenerProyectosProximosACompletarse: jest.fn().mockResolvedValue([]),
            obtenerProyectosAtrasados: jest.fn().mockResolvedValue([]),
          },
        },
        // Mocks vacíos para cumplir con las dependencias del JwtAuthGuard y decoradores
        { provide: ClientesService, useValue: {} },
        { provide: ProyectosService, useValue: {} },
        { provide: TareasService, useValue: {} },
        { provide: UsuariosService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: getRepositoryToken(Proyecto), useValue: {} },
        { provide: getRepositoryToken(Tarea), useValue: {} },
        { provide: getRepositoryToken(Cliente), useValue: {} },
      ],
    }).compile();

    controller = module.get<EstadisticasController>(EstadisticasController);
    service = module.get<EstadisticasService>(EstadisticasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('obtenerResumen() debe retornar estadísticas', async () => {
    const resultado = await controller.obtenerResumen();
    
    expect(resultado).toBeDefined();
    expect(resultado.resumen).toBeDefined();
    expect(resultado.resumen.totalClientes).toBe(5);
    expect(resultado.resumen.proyectosActivos).toBe(3);
    expect(resultado.porcentajes).toBeDefined();
  });

  it('obtenerEstadisticasPorCliente() debe retornar array', async () => {
    const resultado = await controller.obtenerEstadisticasPorCliente();
    
    expect(Array.isArray(resultado)).toBe(true);
  });
});