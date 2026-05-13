// BACKEND/SRC/APP.MODULE.TS
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Módulos funcionales
import { AuthModule } from './modules/auth/auth.module';
import { GestionModule } from './modules/gestion/gestion.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
@Module({
  imports: [
    // 1. Configuración global con validación de seguridad
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        const requiredVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
        const missing = requiredVars.filter(v => !config[v]);
        
        if (missing.length > 0) {
          throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
        }
        
        if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
          console.warn('⚠️ ADVERTENCIA: JWT_SECRET debe tener al menos 32 caracteres en producción');
        }
        
        return config;
      }
    }),

    // 2. Conexión a la base de datos (PostgreSQL)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false, // Mantener en false y usar migraciones
      logging: process.env.NODE_ENV === 'development',
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    }),

    // 3. Registro de Módulos
    AuthModule,
    GestionModule,
    EstadisticasModule,
    AuditoriaModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}