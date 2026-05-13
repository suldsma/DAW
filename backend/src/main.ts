// BACKEND/SRC/MAIN.TS
// ✅ VERSIÓN COMPLETA, SEGURA Y MEJORADA

import {
    BadRequestException,
    Logger,
    ValidationPipe,
    VersioningType
} from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import {
    DocumentBuilder,
    SwaggerModule
} from '@nestjs/swagger';

import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {

    /**
     * =====================================================
     * LOGGER
     * =====================================================
     */
    const logger = new Logger('Bootstrap');

    /**
     * =====================================================
     * CREAR APP NEST
     * =====================================================
     */
    const app = await NestFactory.create(AppModule);

    /**
     * =====================================================
     * VARIABLES ENTORNO
     * =====================================================
     */
    const port =
        Number(process.env.PORT) || 3000;

    const nodeEnv =
        process.env.NODE_ENV || 'development';

    /**
     * =====================================================
     * CORS
     * =====================================================
     * Soporta múltiples origins:
     * CORS_ORIGIN=http://localhost:4200,http://localhost:5173
     */
    const corsOrigins = (
        process.env.CORS_ORIGIN ||
        'http://localhost:4200'
    )
        .split(',')
        .map(origin => origin.trim());

    app.enableCors({

        origin: corsOrigins,

        credentials: true,

        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],

        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With'
        ],

        exposedHeaders: [
            'Authorization'
        ],

        optionsSuccessStatus: 200
    });

    /**
     * =====================================================
     * SEGURIDAD HEADERS HTTP
     * =====================================================
     */
    app.use(

        helmet({

            /**
             * Swagger necesita scripts inline
             */
            contentSecurityPolicy: false,

            /**
             * Protección adicional
             */
            crossOriginEmbedderPolicy: false
        })
    );

    /**
     * =====================================================
     * PREFIJO GLOBAL API
     * =====================================================
     */
    app.setGlobalPrefix('api');

    /**
     * =====================================================
     * VERSIONADO API
     * =====================================================
     * Resultado:
     * /api/v1/clientes
     */
    app.enableVersioning({

        type: VersioningType.URI,

        defaultVersion: '1'
    });

    /**
     * =====================================================
     * VALIDACIÓN GLOBAL DTOs
     * =====================================================
     */
    app.useGlobalPipes(

        new ValidationPipe({

            /**
             * Eliminar propiedades extra
             */
            whitelist: true,

            /**
             * Lanzar error si llegan propiedades extra
             */
            forbidNonWhitelisted: true,

            /**
             * Transformar tipos automáticamente
             */
            transform: true,

            transformOptions: {

                enableImplicitConversion: true
            },

            /**
             * Respuesta personalizada errores validación
             */
            exceptionFactory: (errors) => {

                const formattedErrors =
                    errors.map(error => ({

                        field: error.property,

                        errors: Object.values(
                            error.constraints || {}
                        )
                    }));

                return new BadRequestException({

                    statusCode: 400,

                    message:
                        'Error de validación en los datos enviados',

                    errors: formattedErrors
                });
            }
        })
    );

    /**
     * =====================================================
     * SWAGGER
     * =====================================================
     */
    const swaggerConfig =
        new DocumentBuilder()

            .setTitle(
                'Sistema de Gestión de Proyectos - API'
            )

            .setDescription(
                'API REST para gestión de clientes, proyectos, tareas, comentarios, estadísticas y auditoría.'
            )

            .setVersion('1.0.0')

            /**
             * JWT
             */
            .addBearerAuth(

                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description:
                        'Ingresar token JWT'
                },

                'JWT-auth'
            )

            /**
             * TAGS
             */
            .addTag('Seguridad - Autenticación')

            .addTag('Gestión - Clientes')

            .addTag('Gestión - Proyectos')

            .addTag('Gestión - Tareas')

            .addTag('Gestión - Comentarios')

            .addTag('Gestión - Estadísticas')

            .addTag('Auditoría')

            .build();

    /**
     * =====================================================
     * GENERAR DOCUMENTO SWAGGER
     * =====================================================
     */
    const swaggerDocument =
        SwaggerModule.createDocument(
            app,
            swaggerConfig
        );

    /**
     * =====================================================
     * SWAGGER ENDPOINT
     * =====================================================
     * URL:
     * http://localhost:3000/api/docs
     */
    SwaggerModule.setup(
        'api/docs',
        app,
        swaggerDocument,
        {
            swaggerOptions: {

                persistAuthorization: true
            }
        }
    );

    /**
     * =====================================================
     * LEVANTAR SERVIDOR
     * =====================================================
     */
    await app.listen(port);

    /**
     * =====================================================
     * LOGS INICIO
     * =====================================================
     */
    logger.log('========================================');
    logger.log(
        `🚀 Servidor iniciado correctamente`
    );
    logger.log(
        `🌍 Ambiente: ${nodeEnv}`
    );
    logger.log(
        `📡 API: http://localhost:${port}/api/v1`
    );
    logger.log(
        `📘 Swagger: http://localhost:${port}/api/docs`
    );
    logger.log('========================================');
}

/**
 * =====================================================
 * BOOTSTRAP ERROR HANDLER
 * =====================================================
 */
bootstrap().catch(error => {

    const logger =
        new Logger('Bootstrap');

    logger.error(
        '❌ Error crítico al iniciar la aplicación',
        error
    );

    process.exit(1);
});