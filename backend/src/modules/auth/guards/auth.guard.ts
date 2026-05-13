import { 
    CanActivate, 
    ExecutionContext, 
    Injectable, 
    UnauthorizedException 
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';
import { UsuariosService } from "../services/usuarios.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usuariosService: UsuariosService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        
        if (!token) {
            throw new UnauthorizedException('Acceso denegado: No se proporcionó un token Bearer');
        }
        
        try {
            // 1. Verificar la integridad y expiración del token
            const payload = await this.jwtService.verifyAsync(token);
            
            // 2. Validar existencia y estado del usuario en la Base de Datos
            // Esto cumple con la consigna de acceso restringido y usuarios activos
            const usuario = await this.usuariosService.buscarPorId(payload.sub);
            
            if (!usuario) {
                throw new UnauthorizedException('El usuario vinculado al token ya no existe');
            }

            // Según el Script_BD.sql y las reglas de negocio, validamos el estado
            if (usuario.estado !== 'ACTIVO') {
                throw new UnauthorizedException('Cuenta de usuario inhabilitada o dada de baja');
            }

            /**
             * IMPORTANTE: Adjuntamos la información al objeto Request.
             * Esto permite que el decorador @GetUser() extraiga los datos 
             * necesarios para el HistorialCambiosService (usuarioId y nombre).
             */
            request['user'] = {
                sub: usuario.id,
                nombre: usuario.nombre,
                // Puedes agregar más datos del perfil si el frontend los necesita
            };

        } catch (error) {
            // Si es un error de Unauthorized propio lo relanzamos, sino es un error de JWT
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Token inválido, expirado o malformado');
        }

        return true;
    }

    /**
     * Extrae el token del encabezado Authorization: Bearer <token>
     */
    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) return undefined;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}