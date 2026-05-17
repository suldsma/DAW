import {
    BadRequestException,
    Logger,
    ValidationPipe,
    VersioningType
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    
    const app = await NestFactory.create(AppModule);

    const port = Number(process.env.PORT) || 3000;
    const nodeEnv = process.env.NODE_ENV || 'development';

    const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
        .split(',')
        .map(origin => origin.trim());

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Authorization'],
    });

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    }));

    app.setGlobalPrefix('api');

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1'
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            exceptionFactory: (errors) => {
                const formattedErrors = errors.map(error => ({
                    field: error.property,
                    errors: Object.values(error.constraints || {})
                }));
                return new BadRequestException({
                    statusCode: 400,
                    message: 'Error de validación en los datos enviados',
                    errors: formattedErrors
                });
            }
        })
    );

    if (process.env.SWAGGER_HABILITADO === 'true' || nodeEnv === 'development') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Sistema de Gestión de Proyectos - API')
            .setDescription('API REST para la gestión integral de clientes, proyectos y tareas.')
            .setVersion('1.0.0')
            .addBearerAuth(
                { 
                    type: 'http', 
                    scheme: 'bearer', 
                    bearerFormat: 'JWT', 
                    description: 'Introduce el token JWT' 
                },
                'JWT-auth'
            )
            .addTag('Seguridad - Autenticación')
            .addTag('Gestión - Clientes')
            .addTag('Gestión - Proyectos')
            .addTag('Gestión - Tareas')
            .addTag('Gestión - Comentarios')
            .addTag('Auditoría')
            .build();

        const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup('api/docs', app, swaggerDocument, {
            swaggerOptions: { 
                persistAuthorization: true
            }
        });
    }

    await app.listen(port);

    logger.log('================================================');
    logger.log(`🚀 SERVIDOR LISTO EN PUERTO: ${port}`);
    logger.log(`🌍 ENTORNO: ${nodeEnv}`);
    logger.log(`📡 URL API: http://localhost:${port}/api/v1`);
    logger.log(`📘 SWAGGER: http://localhost:${port}/api/docs`);
    logger.log('================================================');
}

bootstrap().catch(error => {
    const logger = new Logger('Bootstrap');
    logger.error('❌ Error crítico en el arranque');
    logger.error(error.stack || error);
    process.exit(1);
});