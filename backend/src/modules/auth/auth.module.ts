import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { Usuario } from "./entities/usuario.entity";
import { UsuariosService } from "./services/usuarios.service";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import { JwtAuthGuard } from "./guards/auth.guard";

@Global() // Lo hacemos global para no tener que importar AuthModule en cada módulo que requiera proteger rutas
@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario]),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('JWT_SECRET');
                if (!secret) {
                    // Falla en el arranque si falta la variable crítica de entorno
                    throw new Error('FATAL: JWT_SECRET no definido en .env');
                }
                return {
                    secret,
                    signOptions: {
                        expiresIn: '8h',
                        algorithm: 'HS256',
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        UsuariosService,
        AuthService,
        JwtAuthGuard,
    ],
    exports: [
        AuthService,
        UsuariosService,
        JwtAuthGuard,
        JwtModule, 
    ],
})
export class AuthModule {}