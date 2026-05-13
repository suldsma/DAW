// BACKEND/SRC/MODULES/AUDITORIA/SERVICES/AUDITORIA.SERVICE.TS (CORREGIDO)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria, TipoEntidadEnum, TipoOperacionEnum } from '../entities/auditoria.entity';

@Injectable()
export class AuditoriaService {

    constructor(
        @InjectRepository(Auditoria)
        private readonly repository: Repository<Auditoria>
    ) { }

    /**
     * Registrar una operación en la auditoría
     */
    async registrarCambio(
        tipoEntidad: TipoEntidadEnum,
        idEntidad: number,
        tipoOperacion: TipoOperacionEnum,
        idUsuario: number,
        nombreUsuario: string,
        datosCambio?: any,
        detalles?: string
    ): Promise<void> {
        // ✅ CORREGIDO: No usar null, usar undefined
        const auditoria = this.repository.create({
            tipoEntidad,
            idEntidad,
            tipoOperacion,
            idUsuario,
            nombreUsuario,
            datosCambio: datosCambio ? JSON.stringify(datosCambio) : undefined,
            detalles: detalles || undefined,
        } as any); // Usar 'as any' si TypeORM lo requiere

        await this.repository.save(auditoria);
    }

    /**
     * Obtener historial de cambios de una entidad
     */
    async obtenerHistorial(tipoEntidad: TipoEntidadEnum, idEntidad: number) {
        return await this.repository.find({
            where: { tipoEntidad, idEntidad },
            order: { fechaOperacion: 'DESC' },
            take: 100 // Últimos 100 cambios
        });
    }

    /**
     * Obtener historial de cambios de un usuario
     */
    async obtenerHistorialPorUsuario(idUsuario: number) {
        return await this.repository.find({
            where: { idUsuario },
            order: { fechaOperacion: 'DESC' },
            take: 50
        });
    }

    /**
     * Obtener historial completo del sistema
     */
    async obtenerHistorialGeneral(limite: number = 100) {
        return await this.repository.find({
            order: { fechaOperacion: 'DESC' },
            take: limite
        });
    }

}