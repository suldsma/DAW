// BACKEND/SRC/APP.MODULE.TS
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { GestionModule } from './modules/gestion/gestion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';

@Module({
  imports: [
    // 1. Cargamos configuración global primero
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Asegura que busque el archivo .env en la raíz
    }),

    // 2. Conexión a la base de datos
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true, // Esto es clave: carga automáticamente Usuario, Cliente, Proyecto, Tarea
      synchronize: false,    // Mantenemos en false porque usas Script SQL
      logging: process.env.NODE_ENV === 'development', // Solo loguea en desarrollo
    }),

    // 3. Módulos funcionales
    AuthModule,
    GestionModule,
    EstadisticasModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
