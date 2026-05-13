// BACKEND/SRC/MODULES/ESTADISTICAS/ESTADISTICAS.MODULE.TS

import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

// Controller
import { EstadisticasController }
    from './controllers/estadisticas.controller';

// Service
import { EstadisticasService }
    from './services/estadisticas.service';

// Entidades
import { Proyecto }
    from '../gestion/entities/proyecto.entity';

import { Tarea }
    from '../gestion/entities/tarea.entity';

import { Cliente }
    from '../gestion/entities/cliente.entity';

import { ComentarioTarea }
    from '../gestion/entities/comentario-tarea.entity';

// Módulos
import { GestionModule }
    from '../gestion/gestion.module';

@Module({

    imports: [

        /**
         * =====================================================
         * TYPEORM
         * =====================================================
         * Entidades necesarias para estadísticas
         */
        TypeOrmModule.forFeature([
            Proyecto,
            Tarea,
            Cliente,
            ComentarioTarea
        ]),

        /**
         * =====================================================
         * GESTIÓN MODULE
         * =====================================================
         * Acceso a:
         * - ClientesService
         * - ProyectosService
         * - TareasService
         */
        GestionModule
    ],

    /**
     * =====================================================
     * CONTROLLERS
     * =====================================================
     */
    controllers: [
        EstadisticasController
    ],

    /**
     * =====================================================
     * PROVIDERS
     * =====================================================
     */
    providers: [
        EstadisticasService
    ],

    /**
     * =====================================================
     * EXPORTS
     * =====================================================
     */
    exports: [
        EstadisticasService
    ]
})
export class EstadisticasModule { }