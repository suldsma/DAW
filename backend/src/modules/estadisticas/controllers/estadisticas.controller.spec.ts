import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from '../services/estadisticas.service';

describe('EstadisticasController', () => {
  let controller: EstadisticasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadisticasController],
      // Necesitas meter el servicio aquí porque el controlador lo pide en el constructor
      providers: [
        {
          provide: EstadisticasService,
          useValue: {}, // Un objeto vacío sirve para que el test inicial pase
        },
      ],
    }).compile();

    controller = module.get<EstadisticasController>(EstadisticasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});