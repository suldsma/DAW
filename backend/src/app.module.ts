// BACKEND/SRC/APP.MODULE.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

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

        /**
         * =====================================================
         * CONFIG MODULE
         * =====================================================
         * Configuración global de variables de entorno
         */
        ConfigModule.forRoot({

            /**
             * Disponible globalmente
             */
            isGlobal: true,

            /**
             * Archivo .env
             */
            envFilePath: '.env',

            /**
             * Validación de variables críticas
             */
            validate: (config) => {

                /**
                 * Variables obligatorias
                 */
                const requiredVars = [

                    // Database
                    'DB_HOST',
                    'DB_USERNAME',
                    'DB_PASSWORD',
                    'DB_NAME',

                    // JWT
                    'JWT_SECRET',

                    // App
                    'NODE_ENV',
                    'PORT'
                ];

                /**
                 * Detectar faltantes
                 */
                const missing = requiredVars.filter(
                    variable => !config[variable]
                );

                /**
                 * Lanzar error si faltan variables
                 */
                if (missing.length > 0) {

                    throw new Error(
                        `Variables de entorno faltantes: ${missing.join(', ')}`
                    );
                }

                /**
                 * Validación de seguridad JWT
                 */
                if (
                    config.JWT_SECRET &&
                    config.JWT_SECRET.length < 32
                ) {

                    console.warn(
                        '⚠️ ADVERTENCIA: JWT_SECRET debería tener al menos 32 caracteres'
                    );
                }

                return config;
            }
        }),

        /**
         * =====================================================
         * TYPEORM
         * =====================================================
         * Configuración PostgreSQL
         */
        TypeOrmModule.forRoot({

            /**
             * Base de datos
             */
            type: 'postgres',

            /**
             * Host
             */
            host: process.env.DB_HOST || 'localhost',

            /**
             * Puerto
             */
            port: Number(process.env.DB_PORT) || 5432,

            /**
             * Usuario
             */
            username: process.env.DB_USERNAME,

            /**
             * Password
             */
            password: process.env.DB_PASSWORD,

            /**
             * Nombre DB
             */
            database: process.env.DB_NAME,

            /**
             * Cargar entidades automáticamente
             */
            autoLoadEntities: true,

            /**
             * IMPORTANTE:
             * Mantener en FALSE en producción
             */
            synchronize: false,

            /**
             * Mostrar queries solo en desarrollo
             */
            logging:
                process.env.NODE_ENV === 'development',

            /**
             * Configuración pool conexiones
             */
            extra: {

                /**
                 * Máximo conexiones
                 */
                max: 20,

                /**
                 * Tiempo máximo idle
                 */
                idleTimeoutMillis: 30000,

                /**
                 * Timeout conexión
                 */
                connectionTimeoutMillis: 2000
            }
        }),

        /**
         * =====================================================
         * MÓDULOS FUNCIONALES
         * =====================================================
         */
        AuthModule,
        GestionModule,
        EstadisticasModule,
        AuditoriaModule
    ],

    /**
     * =====================================================
     * CONTROLLERS
     * =====================================================
     */
    controllers: [],

    /**
     * =====================================================
     * PROVIDERS
     * =====================================================
     */
    providers: []
})
export class AppModule { }