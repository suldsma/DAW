//BACKEND/SRC/MODULES/AUTH/SERVICES/USUARIOS.SERVICE.TS
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Usuario } from "../entitites/usuario.entity";
import { Repository } from "typeorm";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Injectable()
export class UsuariosService {

    constructor(@InjectRepository(Usuario) private readonly usuariosRespository: Repository<Usuario>) { }

    async buscarUsuarioActivoPorNombre(nombre: string): Promise<Usuario | null> {

        return await this.usuariosRespository.findOneBy({ estado: EstadosUsuariosEnum.ACTIVO, nombre });

    }
}