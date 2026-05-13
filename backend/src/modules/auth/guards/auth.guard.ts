// BACKEND/SRC/MODULES/AUTH/GUARDS/AUTH.GUARD.TS
// ✅ VERSIÓN MEJORADA Y PROFESIONAL

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";

import { Request } from "express";

import { UsuariosService } from "../services/usuarios.service";

/**
 * ✅ Interface personalizada para tipar request.user
 * Mejora autocompletado y evita usar request['user']
 */
interface AuthenticatedRequest extends Request {
    user: {
        sub: number;
        nombre: string;
        estado: string;
    };
}

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly usuariosService: UsuariosService
    ) { }

    /**
     * Método principal del Guard
     * Verifica:
     * - Existencia del token
     * - Validez del JWT
     * - Existencia del usuario
     * - Estado ACTIVO del usuario
     */
    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {

        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();

        // Extraer token Bearer
        const token = this.extractTokenFromHeader(request);

        // Validar existencia del token
        if (!token) {
            throw new UnauthorizedException(
                'Acceso denegado: No se proporcionó un token Bearer'
            );
        }

        try {

            /**
             * =====================================================
             * 1. VALIDAR JWT
             * =====================================================
             * Verifica:
             * - Firma
             * - Integridad
             * - Expiración
             */
            const payload = await this.jwtService.verifyAsync(token);

            /**
             * =====================================================
             * 2. VALIDAR USUARIO EN BASE DE DATOS
             * =====================================================
             * No confiar únicamente en el token.
             * Verificar:
             * - Que el usuario exista
             * - Que siga ACTIVO
             */
            const usuario = await this.usuariosService.buscarPorId(
                payload.sub
            );

            // Usuario inexistente
            if (!usuario) {
                throw new UnauthorizedException(
                    'El usuario vinculado al token ya no existe'
                );
            }

            // Usuario inactivo
            if (usuario.estado !== 'ACTIVO') {
                throw new UnauthorizedException(
                    'Cuenta de usuario inhabilitada o dada de baja'
                );
            }

            /**
             * =====================================================
             * 3. GUARDAR USUARIO EN REQUEST
             * =====================================================
             * Disponible luego en:
             * - Controllers
             * - Decoradores personalizados
             * - Auditoría
             * - Servicios
             */
            request.user = {
                sub: usuario.id,
                nombre: usuario.nombre,
                estado: usuario.estado
            };

        } catch (error) {

            /**
             * Si ya es UnauthorizedException personalizada
             * la relanzamos.
             */
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            /**
             * Error JWT:
             * - Token expirado
             * - Firma inválida
             * - Token corrupto
             */
            throw new UnauthorizedException(
                'Token inválido, expirado o malformado'
            );
        }

        return true;
    }

    /**
     * =====================================================
     * EXTRAER TOKEN BEARER
     * =====================================================
     * Formato esperado:
     * Authorization: Bearer <token>
     */
    private extractTokenFromHeader(
        request: Request
    ): string | undefined {

        const authHeader = request.headers.authorization;

        // Header inexistente
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');

        // Validar formato Bearer
        return type === 'Bearer'
            ? token
            : undefined;
    }

}