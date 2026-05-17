import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UsuariosService } from "../services/usuarios.service";

export interface AuthenticatedRequest extends Request {
    user: {
        sub: number;
        nombre: string;
        estado: string;
    };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly usuariosService: UsuariosService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Acceso denegado: No se proporcionó un token Bearer');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);

            // Validación en BD para evitar accesos si el usuario fue eliminado o modificado recientemente
            const usuario = await this.usuariosService.buscarPorId(payload.sub);

            if (!usuario) {
                throw new UnauthorizedException('El usuario vinculado al token ya no existe');
            }

            if (usuario.estado !== 'ACTIVO') {
                throw new UnauthorizedException('Cuenta de usuario inhabilitada');
            }

            // Inyecta el usuario limpio de la BD en la request para controladores, decoradores y auditoría
            request.user = {
                sub: usuario.id,
                nombre: usuario.nombre,
                estado: usuario.estado
            };

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Token inválido, expirado o malformado');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}