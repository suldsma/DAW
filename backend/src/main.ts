import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
    // Creamos la instancia con CORS habilitado dinámicamente
    const app = await NestFactory.create(AppModule);

    // 1. Configuración de CORS optimizada para Angular
    app.enableCors({
        origin: (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',').map(o => o.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        optionsSuccessStatus: 200,
    });

    // 2. Seguridad: Headers HTTP (Configurado para no romper Swagger)
    app.use(helmet({
        contentSecurityPolicy: false, // Deshabilitado para que Swagger UI cargue sus scripts/estilos
    }));

    // 3. Prefijo Global para la API (Opcional pero recomendado)
    app.setGlobalPrefix('api/v1');

    // 4. Validación global de DTOs (Blindaje contra datos basura)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,               // Elimina propiedades que no estén en el DTO
            forbidNonWhitelisted: true,    // Lanza error si hay propiedades no permitidas
            transform: true,               // Convierte tipos automáticamente (ej: string a number en IDs)
            transformOptions: {
                enableImplicitConversion: true,
            },
            exceptionFactory: (errors) => {
                const messages = errors.map(e => ({
                    field: e.property,
                    errors: Object.values(e.constraints || {})
                }));
                return new BadRequestException({
                    statusCode: 400,
                    message: 'Error de validación en los datos enviados',
                    errors: messages
                });
            }
        }),
    );

    // 5. Configuración de Swagger (Documentación Interactiva)
    const config = new DocumentBuilder()
        .setTitle('Sistema de Gestión de Proyectos - API')
        .setDescription('Documentación oficial de la API para la gestión de clientes, proyectos y tareas.')
        .setVersion('1.0.0')
        .addBearerAuth() // Habilita el botón de "Authorize" para el JWT
        .addTag('Gestión - Clientes')
        .addTag('Gestión - Proyectos')
        .addTag('Gestión - Tareas')
        .addTag('Gestión - Estadísticas')
        .addTag('Seguridad - Autenticación')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    // La documentación estará en: http://localhost:3000/api/v1/docs
    SwaggerModule.setup('api/v1/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`---`);
    console.log(`🚀 Servidor listo en: http://localhost:${port}/api/v1`);
    console.log(`📘 Swagger Docs: http://localhost:${port}/api/v1/docs`);
    console.log(`---`);
}

bootstrap().catch(err => {
    console.error('❌ Error crítico al iniciar el servidor:', err);
    process.exit(1);
});