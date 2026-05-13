// BACKEND/SRC/MODULES/ESTADISTICAS/CONTROLLERS/ESTADISTICAS.CONTROLLER.SPEC.TS

import { Test, TestingModule } from '@nestjs/testing';

import { EstadisticasController }
    from './estadisticas.controller';

import { EstadisticasService }
    from '../services/estadisticas.service';

describe('EstadisticasController', () => {

    let controller: EstadisticasController;

    /**
     * Mock del servicio
     */
    const mockEstadisticasService = {

        obtenerResumenGeneral: jest.fn(),

        obtenerEstadisticasPorCliente: jest.fn(),

        obtenerEstadisticasPorProyecto: jest.fn(),

        obtenerProyectosProximosACompletarse: jest.fn(),

        obtenerProyectosAtrasados: jest.fn()
    };

    beforeEach(async () => {

        const module: TestingModule =
            await Test.createTestingModule({

                controllers: [
                    EstadisticasController
                ],

                providers: [
                    {
                        provide: EstadisticasService,
                        useValue: mockEstadisticasService
                    }
                ]
            }).compile();

        controller = module.get<EstadisticasController>(
            EstadisticasController
        );
    });

    /**
     * =====================================================
     * TESTS
     * =====================================================
     */

    it('should be defined', () => {

        expect(controller).toBeDefined();
    });

});