// BACKEND/SRC/MODULES/AUTH/AUTH.MODULE.TS
// ✅ VERSIÓN CORREGIDA Y MEJORADA

import {
    Module,
    Global
} from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

import { JwtModule } from "@nestjs/jwt";

import {
    ConfigModule,
    ConfigService
} from "@nestjs/config";

// Entidades
import { Usuario } from "./entitites/usuario.entity";

// Servicios
import { UsuariosService } from "./services/usuarios.service";
import { AuthService } from "./services/auth.service";

// Controllers
import { AuthController } from "./controllers/auth.controller";

// Guards
import { AuthGuard } from "./guards/auth.guard";

@Global()
@Module({
    imports: [

        /**
         * =====================================================
         * TYPEORM
         * =====================================================
         * Registro de entidad Usuario
         */
        TypeOrmModule.forFeature([
            Usuario
        ]),

        /**
         * =====================================================
         * JWT MODULE
         * =====================================================
         * Configuración segura usando .env
         */
        JwtModule.registerAsync({

            imports: [ConfigModule],

            inject: [ConfigService],

            useFactory: (
                configService: ConfigService
            ) => {

                /**
                 * Obtener JWT_SECRET desde variables de entorno
                 */
                const jwtSecret =
                    configService.get<string>('JWT_SECRET');

                /**
                 * Validación adicional de seguridad
                 */
                if (!jwtSecret) {
                    throw new Error(
                        'JWT_SECRET no está definido en el archivo .env'
                    );
                }

                return {

                    /**
                     * Clave secreta JWT
                     */
                    secret: jwtSecret,

                    /**
                     * Configuración del token
                     */
                    signOptions: {

                        /**
                         * Duración del token
                         */
                        expiresIn: '8h',

                        /**
                         * Algoritmo de firma
                         */
                        algorithm: 'HS256'
                    }
                };
            }
        })
    ],

    /**
     * =====================================================
     * CONTROLLERS
     * =====================================================
     */
    controllers: [
        AuthController
    ],

    /**
     * =====================================================
     * PROVIDERS
     * =====================================================
     */
    providers: [
        UsuariosService,
        AuthService,
        AuthGuard
    ],

    /**
     * =====================================================
     * EXPORTS
     * =====================================================
     * Disponibles globalmente
     */
    exports: [
        AuthGuard,
        AuthService,
        UsuariosService,
        JwtModule
    ]
})
export class AuthModule { }