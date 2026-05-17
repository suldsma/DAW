// BACKEND/SRC/MODULES/ESTADISTICAS/ESTADISTICAS.MODULE.TS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EstadisticasController } from './controllers/estadisticas.controller';
import { EstadisticasService } from './services/estadisticas.service';

import { Proyecto } from '../gestion/entities/proyecto.entity';
import { Tarea } from '../gestion/entities/tarea.entity';
import { Cliente } from '../gestion/entities/cliente.entity';

import { GestionModule } from '../gestion/gestion.module';
import { AuthModule } from '../auth/auth.module'; 

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Proyecto,
            Tarea,
            Cliente
        ]),
        GestionModule, // Provee los servicios base necesarios para contar registros
        AuthModule // Permite el uso global del JwtAuthGuard en los controladores
    ],
    controllers: [
        EstadisticasController
    ],
    providers: [
        EstadisticasService
    ],
    exports: [
        EstadisticasService
    ]
})
export class EstadisticasModule { }