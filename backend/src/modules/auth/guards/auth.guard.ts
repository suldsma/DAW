//BACKEND/SRC/MODULES/AUTH/GUARDS/AUTH.GUARD.TS
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express'; // Asegúrate de tener instalado @types/express

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        
        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(token);
            
            // Verificación de seguridad adicional:
            // Si en el login guardaste el estado en el payload, podrías verificarlo aquí:
            if (payload.estado === 'BAJA') {
                throw new UnauthorizedException('Usuario inhabilitado');
            }

            request['usuario'] = payload;
        } catch {
            throw new UnauthorizedException('Token inválido o expirado');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) return undefined;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}