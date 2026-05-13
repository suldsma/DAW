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

    // Busca usuario activo por nombre.
    // pedimos la 'clave' explícitamente porque en la entidad está oculta por defecto.
    async buscarUsuarioActivoPorNombre(nombre: string): Promise<Usuario | null> {
        return await this.repository.findOne({
            where: { 
                nombre, 
                estado: EstadosUsuariosEnum.ACTIVO 
            },
            select: ['id', 'nombre', 'estado', 'clave'] 
        });
    }

    // Buscar por ID para el Guard o el perfil
    async buscarPorId(id: number): Promise<Usuario | null> {
        return await this.repository.findOneBy({ id });
    }
    
    // Para sacar el total de usuarios activos 
    async contarUsuariosActivos(): Promise<number> {
        return await this.repository.count({
            where: { estado: EstadosUsuariosEnum.ACTIVO }
        });
    }
}