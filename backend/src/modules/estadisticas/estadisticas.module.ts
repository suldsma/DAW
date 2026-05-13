// BACKEND/SRC/MODULES/ESTADISTICAS/ESTADISTICAS.MODULE.TS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticasController } from './controllers/estadisticas.controller';
import { EstadisticasService } from './services/estadisticas.service';

// Importación de Entidades
import { Proyecto } from '../gestion/entities/proyecto.entity';
import { Tarea } from '../gestion/entities/tarea.entity';
import { Cliente } from '../gestion/entities/cliente.entity';
import { ComentarioTarea } from '../gestion/entities/comentario-tarea.entity'; // ✅ Entidad necesaria para resolver el error de metadata

// Importación de Módulos
import { GestionModule } from '../gestion/gestion.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        // ✅ Agregamos ComentarioTarea al forFeature. 
        // TypeORM necesita todas las entidades relacionadas para construir el mapa de la base de datos.
        TypeOrmModule.forFeature([
            Proyecto, 
            Tarea, 
            Cliente, 
            ComentarioTarea
        ]),
        
        // Importamos GestionModule para acceder a los servicios (ProyectosService, etc.)
        GestionModule,
        
        // Importamos AuthModule para los guards del controlador
        AuthModule
    ], 
    controllers: [EstadisticasController],
    providers: [EstadisticasService],
    exports: [EstadisticasService]
})
export class EstadisticasModule {}