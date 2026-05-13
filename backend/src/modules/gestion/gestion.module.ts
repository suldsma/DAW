// src/modules/gestion/gestion.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientesController } from "./controllers/clientes.controller";
import { ProyectosController } from "./controllers/proyectos.controller";
import { TareasController } from "./controllers/tareas.controller";
import { Tarea } from "./entities/tarea.entity";
import { Cliente } from "./entities/cliente.entity";
import { Proyecto } from "./entities/proyecto.entity";
import { TareasService } from "./services/tarea.service";
import { ClientesService } from "./services/clientes.service";
import { ProyectosService } from "./services/proyectos.service";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Tarea, Cliente, Proyecto]),
        AuthModule
    ],
    controllers: [ClientesController, ProyectosController, TareasController],
    providers: [TareasService, ClientesService, ProyectosService],
    exports: [TareasService, ClientesService, ProyectosService] // Crítico para Estadísticas
})
export class GestionModule {}