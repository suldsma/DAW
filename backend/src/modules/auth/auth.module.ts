import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

// Entidades y Servicios
import { Usuario } from "./entitites/usuario.entity";
import { UsuariosService } from "./services/usuarios.service";
import { AuthService } from "./services/auth.service";

// Controladores y Seguridad
import { AuthController } from "./controllers/auth.controller";
import { AuthGuard } from "./guards/auth.guard";

@Global() // Hacemos que el módulo sea global para no tener que importarlo en cada módulo de gestión
@Module({
    imports: [
        // Registro de la entidad Usuario para acceso a la tabla usuarios de la DB
        TypeOrmModule.forFeature([Usuario]),
        
        // Configuración asíncrona del JWT usando variables de entorno
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>('JWT_SECRET') || 'CLAVE_SECRETA_POR_DEFECTO',
                signOptions: { 
                    expiresIn: '8h',
                    algorithm: 'HS256'
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        UsuariosService, 
        AuthService, 
        AuthGuard
    ],
    // Exportamos JwtModule y AuthGuard para que estén disponibles en toda la app
    exports: [
        AuthGuard, 
        AuthService, 
        UsuariosService,
        JwtModule
    ],
})
export class AuthModule { }