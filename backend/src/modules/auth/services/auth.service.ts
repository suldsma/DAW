import {
    Injectable,
    UnauthorizedException,
    Logger
} from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { UsuariosService } from "./usuarios.service";
import { LoginDto } from "../dtos/input/login.dto";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

interface JwtPayload {
    sub: number;
    nombre: string;
    estado: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService
    ) { }

    async login(dto: LoginDto): Promise<{ accessToken: string }> {
        const { nombre, clave } = dto;

        const usuario = await this.usuariosService.buscarUsuarioPorNombre(nombre.trim());

        if (!usuario || usuario.estado !== EstadosUsuariosEnum.ACTIVO) {
            this.logger.warn(`Intento de login fallido: Usuario inexistente o inactivo -> ${nombre}`);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const passwordValida = await bcrypt.compare(clave, usuario.clave);

        if (!passwordValida) {
            this.logger.warn(`Intento de login fallido: Contraseña incorrecta para el usuario -> ${nombre}`);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        this.logger.log(`LOGIN EXITOSO: ID ${usuario.id} - Usuario: ${usuario.nombre}`);

        const payload: JwtPayload = {
            sub: usuario.id,
            nombre: usuario.nombre,
            estado: usuario.estado
        };

        return {
            accessToken: await this.jwtService.signAsync(payload)
        };
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10; 
        return await bcrypt.hash(password, saltRounds);
    }
}