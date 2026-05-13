// backend/src/modules/auditoria/auditoria.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { AuditoriaService } from './services/auditoria.service';
import { AuditoriaController } from './controllers/auditoria.controller';

// Importamos las entidades de Gestión que están relacionadas
import { Tarea } from '../gestion/entities/tarea.entity';
import { Proyecto } from '../gestion/entities/proyecto.entity';
import { Cliente } from '../gestion/entities/cliente.entity';
import { ComentarioTarea } from '../gestion/entities/comentario-tarea.entity'; // ✅ Entidad clave para el error de metadata

@Module({
  imports: [
    // ✅ Agregamos todas las entidades involucradas en las relaciones
    TypeOrmModule.forFeature([
      Auditoria, 
      Tarea, 
      Proyecto, 
      Cliente, 
      ComentarioTarea
    ])
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}