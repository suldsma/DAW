// BACKEND/SRC/MODULES/AUTH/CONTROLLER/AUTH.CONTROLLER.TS

import { 
    BadRequestException, 
    Body, 
    Controller, 
    Get, 
    Post,
    UseGuards,
    Request
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

// Servicios y Seguridad
import { AuthService } from "../services/auth.service";
import { UsuariosService } from "../services/usuarios.service";
// ✅ CORREGIDO: Se importa JwtAuthGuard según el error de compilación
import { JwtAuthGuard } from "../guards/auth.guard";

// DTOs
import { LoginDto } from "../dtos/input/login.dto";

@ApiTags('Seguridad - Autenticación')
@Controller("auth")
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly usuariosService: UsuariosService
    ) {}

    /**
     * INICIO DE SESIÓN
     * Genera el token de acceso necesario para operar en el sistema.
     */
    @Post("login")
    @ApiOperation({ summary: 'Autenticar usuario y obtener token JWT' })
    @ApiOkResponse({ description: 'Token JWT generado exitosamente' })
    async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
        return await this.authService.login(dto);
    }

    /**
     * PERFIL DE USUARIO
     * Recupera la información del usuario basada en el token activo.
     */
    @Get("me")
    // ✅ CORREGIDO: Uso de JwtAuthGuard
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    @ApiOkResponse({ 
        description: 'Datos básicos del usuario logueado',
        schema: {
            example: {
                id: 1,
                nombre: 'admin_proyectos',
                estado: 'ACTIVO'
            }
        }
    })
    async obtenerPerfil(@Request() req: any) {
        /**
         * ✅ IMPORTANTE: 
         * Tu error sugiere que el Guard inyecta el usuario. 
         * Accedemos a 'usuario' para ser coherentes con el resto de la app.
         */
        const usuarioPayload = req.usuario || req.user;
        
        if (!usuarioPayload || !usuarioPayload.sub) {
            throw new BadRequestException('No se pudo identificar al usuario en el token');
        }

        const usuario = await this.usuariosService.buscarPorId(usuarioPayload.sub);
        
        if (!usuario) {
            throw new BadRequestException('El usuario ya no existe en el sistema');
        }

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            estado: usuario.estado
        };
    }
}