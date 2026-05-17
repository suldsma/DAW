import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Raw } from "typeorm";
import { Usuario } from "../entities/usuario.entity";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum";

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(Usuario)
        private readonly repository: Repository<Usuario>
    ) { }

    async buscarUsuarioPorNombre(nombre: string): Promise<Usuario | null> {
        return await this.repository.findOne({
            where: {
                nombre: Raw(alias => `LOWER(${alias}) = LOWER(:val)`, { 
                    val: nombre.trim() 
                })
            },
            // Forzamos la clave porque en la entidad tiene 'select: false' por seguridad
            select: ['id', 'nombre', 'estado', 'clave'] 
        });
    }

    async buscarPorId(id: number): Promise<Usuario | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async buscarActivoPorId(id: number): Promise<Usuario | null> {
        return await this.repository.findOne({
            where: { id, estado: EstadosUsuariosEnum.ACTIVO }
        });
    }

    async obtenerPorIdOrFail(id: number): Promise<Usuario> {
        const usuario = await this.buscarPorId(id);
        if (!usuario) {
            throw new NotFoundException(`No existe un usuario con ID ${id}`);
        }
        return usuario;
    }

    async obtenerEstadisticas(): Promise<{ total: number; activos: number; inactivos: number }> {
        const [total, activos] = await Promise.all([
            this.repository.count(),
            this.repository.count({ where: { estado: EstadosUsuariosEnum.ACTIVO } })
        ]);

        return {
            total,
            activos,
            inactivos: total - activos
        };
    }
}