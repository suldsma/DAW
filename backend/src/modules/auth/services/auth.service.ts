// BACKEND/SRC/MODULES/AUTH/SERVICES/AUTH.SERVICE.TS
import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
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
        // Validar campos requeridos
        if (!dto.nombre || !dto.clave) {
            throw new BadRequestException("Usuario y contraseña son requeridos");
        }

        const usuario = await this.usuariosService.buscarUsuarioActivoPorNombre(dto.nombre);

        // Usuario no existe
        if (!usuario) {
            throw new UnauthorizedException("Usuario o contraseña incorrectos");
        }

        // Comparar contraseña usando bcrypt
        // ✅ CORREGIDO: Ahora compatible con bcrypt
        const passwordValida = await bcrypt.compare(dto.clave, usuario.clave);

        if (!passwordValida) {
            throw new UnauthorizedException("Usuario o contraseña incorrectos");
        }

        // Generar JWT con información del usuario
        const payload = { 
            sub: usuario.id, 
            nombre: usuario.nombre,
            estado: usuario.estado
        };

        return {
            accessToken: this.jwtService.sign(payload)
        };
    }

    /**
     * Hash de contraseña para crear nuevos usuarios o cambiar contraseña
     * Utiliza bcrypt con salt rounds = 10
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Validar formato de contraseña antes de guardar
     * - Mínimo 6 caracteres
     * - Al menos un número
     * - Al menos una mayúscula
     */
    validarFormatoPassword(password: string): { valido: boolean; mensaje?: string } {
        if (password.length < 6) {
            return { valido: false, mensaje: "Mínimo 6 caracteres" };
        }
        if (!/\d/.test(password)) {
            return { valido: false, mensaje: "Debe contener al menos un número" };
        }
        if (!/[A-Z]/.test(password)) {
            return { valido: false, mensaje: "Debe contener al menos una mayúscula" };
        }
        return { valido: true };
    }
}