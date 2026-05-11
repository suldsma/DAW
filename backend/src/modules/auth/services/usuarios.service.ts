// BACKEND/SRC/MODULES/AUTH/SERVICES/USUARIOS.SERVICE.TS
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Usuario } from "../entitites/usuario.entity";
import { Repository } from "typeorm";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(Usuario) 
        private readonly repository: Repository<Usuario>
    ) { }

    /**
     * Busca un usuario por nombre y que esté en estado ACTIVO.
     * Se utiliza addSelect para traer la clave, ya que en la entidad
     * está marcada como select: false por seguridad.
     */
    async buscarUsuarioActivoPorNombre(nombre: string): Promise<Usuario | null> {
        return await this.repository.findOne({
            where: { 
                nombre, 
                estado: EstadosUsuariosEnum.ACTIVO 
            },
            select: ['id', 'nombre', 'estado', 'clave'] // Forzamos la inclusión de la clave para el login
        });
    }

    /**
     * Busca un usuario por su ID.
     * Útil para el AuthGuard o para obtener el perfil del usuario logueado.
     * Aquí NO traemos la clave por seguridad.
     */
    async buscarPorId(id: number): Promise<Usuario | null> {
        return await this.repository.findOneBy({ id });
    }
    
    // Funcionalidad Extra opcional: Método para estadísticas de usuarios
    async contarUsuariosActivos(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosUsuariosEnum.ACTIVO }
        });
    }
}