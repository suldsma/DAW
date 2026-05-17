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

    async registrarCambio(
        tipoEntidad: TipoEntidadEnum,
        idEntidad: number,
        tipoOperacion: TipoOperacionEnum,
        idUsuario: number,
        nombreUsuario: string,
        datosCambio?: any,
        detalles?: string
    ): Promise<void> {
        const auditoria = this.repository.create({
            tipoEntidad,
            idEntidad,
            tipoOperacion,
            idUsuario,
            nombreUsuario,
            datosCambio: datosCambio || undefined, 
            detalles: detalles || undefined,
        });

        // Fire and forget o await según la prioridad. Aquí bloqueamos para asegurar el log.
        await this.repository.save(auditoria);
    }

    async obtenerHistorial(tipoEntidad: TipoEntidadEnum, idEntidad: number): Promise<Auditoria[]> {
        return await this.repository.find({
            where: { tipoEntidad, idEntidad },
            order: { fechaOperacion: 'DESC' },
            take: 100 // Capado hardcoded por rendimiento para evitar respuestas masivas
        });
    }

    async obtenerHistorialPorUsuario(idUsuario: number): Promise<Auditoria[]> {
        return await this.repository.find({
            where: { idUsuario },
            order: { fechaOperacion: 'DESC' },
            take: 50
        });
    }

    async obtenerHistorialGeneral(limite: number = 100): Promise<Auditoria[]> {
        return await this.repository.find({
            order: { fechaOperacion: 'DESC' },
            take: limite
        });
    }
}