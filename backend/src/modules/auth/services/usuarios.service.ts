// BACKEND/SRC/MODULES/AUTH/SERVICES/USUARIOS.SERVICE.TS
// ✅ VERSIÓN MEJORADA Y CORREGIDA

import {
    Injectable,
    NotFoundException
} from "@nestjs/common";

import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

// Entidad
import { Usuario } from "../entitites/usuario.entity";

// Enum
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(Usuario)
        private readonly repository: Repository<Usuario>
    ) { }

    /**
     * =====================================================
     * NORMALIZAR NOMBRE
     * =====================================================
     * Evita problemas:
     * - MAYUS/minus
     * - espacios
     */
    private normalizarNombre(
        nombre: string
    ): string {

        return nombre
            .trim()
            .toLowerCase();
    }

    /**
     * =====================================================
     * BUSCAR USUARIO ACTIVO POR NOMBRE
     * =====================================================
     * Se utiliza en login.
     *
     * IMPORTANTE:
     * La propiedad "clave" está oculta en la entidad
     * mediante select: false, por eso se incluye manualmente.
     */
    async buscarUsuarioActivoPorNombre(
        nombre: string
    ): Promise<Usuario | null> {

        const nombreNormalizado =
            this.normalizarNombre(nombre);

        return await this.repository.findOne({

            where: {
                nombre: nombreNormalizado,
                estado: EstadosUsuariosEnum.ACTIVO
            },

            /**
             * Traer explícitamente la contraseña hash
             */
            select: [
                'id',
                'nombre',
                'estado',
                'clave'
            ]
        });
    }

    /**
     * =====================================================
     * BUSCAR USUARIO POR ID
     * =====================================================
     * Usado en:
     * - AuthGuard
     * - Perfil
     * - Auditoría
     */
    async buscarPorId(
        id: number
    ): Promise<Usuario | null> {

        return await this.repository.findOne({
            where: { id }
        });
    }

    /**
     * =====================================================
     * BUSCAR USUARIO ACTIVO POR ID
     * =====================================================
     * Valida además que el usuario siga activo.
     */
    async buscarActivoPorId(
        id: number
    ): Promise<Usuario | null> {

        return await this.repository.findOne({
            where: {
                id,
                estado: EstadosUsuariosEnum.ACTIVO
            }
        });
    }

    /**
     * =====================================================
     * OBTENER USUARIO O FALLAR
     * =====================================================
     * Útil cuando el usuario es obligatorio.
     */
    async obtenerPorIdOrFail(
        id: number
    ): Promise<Usuario> {

        const usuario =
            await this.buscarPorId(id);

        if (!usuario) {

            throw new NotFoundException(
                `No existe un usuario con ID ${id}`
            );
        }

        return usuario;
    }

    /**
     * =====================================================
     * CONTAR USUARIOS ACTIVOS
     * =====================================================
     * Utilizado en estadísticas.
     */
    async contarUsuariosActivos(): Promise<number> {

        return await this.repository.count({

            where: {
                estado: EstadosUsuariosEnum.ACTIVO
            }
        });
    }

}