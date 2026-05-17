import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './src/modules/auth/auth.module';
import { GestionModule } from './src/modules/gestion/gestion.module';
import { EstadisticasModule } from './src/modules/estadisticas/estadisticas.module';
import { AuditoriaModule } from './src/modules/auditoria/auditoria.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validate: (config) => {
                const requiredVars = [
                    'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME',
                    'JWT_SECRET', 'NODE_ENV', 'PORT'
                ];
                const missing = requiredVars.filter(v => !config[v]);

                if (missing.length > 0) {
                    throw new Error(`❌ ERROR: Faltan variables de entorno: ${missing.join(', ')}`);
                }

                if (config.JWT_SECRET?.length < 32) {
                    console.warn('⚠️ SEGURIDAD: JWT_SECRET es demasiado corto (mínimo 32 caracteres sugeridos).');
                }

                return config;
            }
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                autoLoadEntities: true,
                synchronize: false, 
                
                logging: configService.get('NODE_ENV') === 'development',
            })
        }),

        AuthModule,
        GestionModule,
        EstadisticasModule,
        AuditoriaModule
    ],
    controllers: [],
    providers: []
})
export class AppModule { }