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
import { LoginDto } from "../dtos/input/login.dto";
import { AuthService } from "../services/auth.service";
import { UsuariosService } from "../services/usuarios.service";
import { AuthGuard } from "../guards/auth.guard";

@ApiTags('Autenticación')
@Controller("auth")
export class AuthController{

    constructor(
        private readonly authService: AuthService,
        private readonly usuariosService: UsuariosService
    ){}

    @Post("login")
    @ApiOperation({ summary: 'Autenticar usuario y obtener token JWT' })
    @ApiOkResponse({ description: 'Token JWT generado exitosamente' })
    async login(@Body() dto: LoginDto): Promise<{ accessToken: string }>{
        return await this.authService.login(dto);
    }

    /**
     * ✅ NUEVA FUNCIONALIDAD: Obtener datos del usuario autenticado
     * Endpoint necesario para el frontend obtener perfil del usuario logueado
     */
    @Get("me")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    @ApiOkResponse({ 
        description: 'Datos del usuario logueado',
        schema: {
            example: {
                id: 1,
                nombre: 'usuario',
                estado: 'ACTIVO'
            }
        }
    })
    async obtenerPerfil(@Request() req: any) {
        // ✅ El token ya fue validado por AuthGuard
        // El payload está en req['usuario']
        const usuarioId = req['usuario'].sub;
        
        const usuario = await this.usuariosService.buscarPorId(usuarioId);
        
        if (!usuario) {
            throw new BadRequestException('Usuario no encontrado');
        }

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            estado: usuario.estado
        };
    }

}