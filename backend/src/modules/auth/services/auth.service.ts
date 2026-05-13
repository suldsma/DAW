// BACKEND/SRC/MODULES/AUTH/SERVICES/AUTH.SERVICE.TS
// ✅ VERSIÓN COMPLETA, SEGURA Y MEJORADA

import {
    Injectable,
    UnauthorizedException,
    BadRequestException
} from "@nestjs/common";

import * as bcrypt from 'bcrypt';

import { JwtService } from "@nestjs/jwt";

// DTOs
import { LoginDto } from "../dtos/input/login.dto";

// Services
import { UsuariosService } from "./usuarios.service";

// Enum
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

/**
 * =====================================================
 * INTERFACE JWT PAYLOAD
 * =====================================================
 */
interface JwtPayload {

    sub: number;

    nombre: string;

    estado: EstadosUsuariosEnum;
}

@Injectable()
export class AuthService {

    constructor(

        private readonly usuariosService: UsuariosService,

        private readonly jwtService: JwtService

    ) { }

    /**
     * =====================================================
     * LOGIN
     * =====================================================
     * Flujo:
     * - Validar datos
     * - Buscar usuario activo
     * - Comparar contraseña
     * - Generar JWT
     */
    async login(
        dto: LoginDto
    ): Promise<{ accessToken: string }> {

        /**
         * =====================================================
         * VALIDAR DATOS REQUERIDOS
         * =====================================================
         */
        if (!dto.nombre?.trim()) {

            throw new BadRequestException(
                'El nombre de usuario es obligatorio'
            );
        }

        if (!dto.clave?.trim()) {

            throw new BadRequestException(
                'La contraseña es obligatoria'
            );
        }

        /**
         * =====================================================
         * NORMALIZAR NOMBRE
         * =====================================================
         */
        const nombreNormalizado =
            dto.nombre
                .trim()
                .toLowerCase();

        /**
         * =====================================================
         * BUSCAR USUARIO ACTIVO
         * =====================================================
         */
        const usuario =
            await this.usuariosService
                .buscarUsuarioActivoPorNombre(
                    nombreNormalizado
                );

        /**
         * =====================================================
         * USUARIO NO EXISTE
         * =====================================================
         * Mensaje genérico por seguridad
         */
        if (!usuario) {

            throw new UnauthorizedException(
                'Usuario o contraseña incorrectos'
            );
        }

        /**
         * =====================================================
         * VALIDAR CONTRASEÑA
         * =====================================================
         */
        const passwordValida =
            await bcrypt.compare(
                dto.clave,
                usuario.clave
            );

        if (!passwordValida) {

            throw new UnauthorizedException(
                'Usuario o contraseña incorrectos'
            );
        }

        /**
         * =====================================================
         * VALIDACIÓN EXTRA DE ESTADO
         * =====================================================
         */
        if (
            usuario.estado !==
            EstadosUsuariosEnum.ACTIVO
        ) {

            throw new UnauthorizedException(
                'La cuenta de usuario está inhabilitada'
            );
        }

        /**
         * =====================================================
         * GENERAR PAYLOAD JWT
         * =====================================================
         */
        const payload: JwtPayload = {

            sub: usuario.id,

            nombre: usuario.nombre,

            estado: usuario.estado
        };

        /**
         * =====================================================
         * GENERAR TOKEN JWT
         * =====================================================
         */
        const accessToken =
            await this.jwtService.signAsync(payload);

        /**
         * =====================================================
         * RESPUESTA
         * =====================================================
         */
        return {
            accessToken
        };
    }

    /**
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     * Utilizado para:
     * - Crear usuarios
     * - Cambiar contraseña
     */
    async hashPassword(
        password: string
    ): Promise<string> {

        /**
         * Validar formato antes de hashear
         */
        const validacion =
            this.validarFormatoPassword(password);

        if (!validacion.valido) {

            throw new BadRequestException(
                validacion.mensaje
            );
        }

        /**
         * Salt rounds bcrypt
         */
        const saltRounds = 10;

        return await bcrypt.hash(
            password,
            saltRounds
        );
    }

    /**
     * =====================================================
     * VALIDAR FORMATO PASSWORD
     * =====================================================
     * Reglas:
     * - mínimo 6 caracteres
     * - al menos 1 número
     * - al menos 1 mayúscula
     * - al menos 1 carácter especial
     */
    validarFormatoPassword(
        password: string
    ): {
        valido: boolean;
        mensaje?: string;
    } {

        /**
         * Password vacía
         */
        if (!password?.trim()) {

            return {
                valido: false,
                mensaje: 'La contraseña es obligatoria'
            };
        }

        /**
         * Longitud mínima
         */
        if (password.length < 6) {

            return {
                valido: false,
                mensaje: 'La contraseña debe tener al menos 6 caracteres'
            };
        }

        /**
         * Número obligatorio
         */
        if (!/\d/.test(password)) {

            return {
                valido: false,
                mensaje: 'La contraseña debe contener al menos un número'
            };
        }

        /**
         * Mayúscula obligatoria
         */
        if (!/[A-Z]/.test(password)) {

            return {
                valido: false,
                mensaje: 'La contraseña debe contener al menos una mayúscula'
            };
        }

        /**
         * Carácter especial obligatorio
         */
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {

            return {
                valido: false,
                mensaje: 'La contraseña debe contener al menos un carácter especial'
            };
        }

        return {
            valido: true
        };
    }

}