// BACKEND/SRC/MODULES/AUTH/SERVICES/AUTH.SERVICE.TS
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "../dtos/input/login.dto";
import { UsuariosService } from "./usuarios.service";

@Injectable()
export class AuthService {

    constructor(
        private readonly usuariosService: UsuariosService,
        private jwtService: JwtService
    ) { }

    async login(dto: LoginDto): Promise<{ accessToken: string }> {

        const usuario = await this.usuariosService.buscarUsuarioActivoPorNombre(dto.nombre);

        // Si el usuario no existe o la clave no coincide
        if (!usuario || !bcrypt.compareSync(dto.clave, usuario.clave)) {
            throw new UnauthorizedException("Nombre de usuario o contraseña incorrectos");
        }

        // Añadimos el estado al payload para que el Guard pueda usarlo
        const payload = { 
            sub: usuario.id, 
            nombre: usuario.nombre,
            estado: usuario.estado // Útil para validaciones rápidas en el Guard
        };

        return {
            accessToken: this.jwtService.sign(payload)
        };
    }
}