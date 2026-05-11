import { Module } from '@nestjs/common';
import { EstadisticasController } from './controllers/estadisticas.controller';
import { EstadisticasService } from './services/estadisticas.service';
import { GestionModule } from '../gestion/gestion.module'; // Importante para acceder a los repositorios

@Module({
  imports: [GestionModule], 
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}