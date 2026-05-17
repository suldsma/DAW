// BACKEND/SRC/MODULES/GESTION/GESTION.MODULE.TS

import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Cliente } from "./entities/cliente.entity";
import { Proyecto } from "./entities/proyecto.entity";
import { Tarea } from "./entities/tarea.entity";

import { ClientesController } from "./controllers/clientes.controller";
import { ProyectosController } from "./controllers/proyectos.controller";
import { TareasController } from "./controllers/tareas.controller";

import { ClientesService } from "./services/clientes.service";
import { ProyectosService } from "./services/proyectos.service";
import { TareasService } from "./services/tareas.service";

import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Cliente,
            Proyecto,
            Tarea
        ]),
        forwardRef(() => AuthModule)
    ],

    controllers: [
        ClientesController,
        ProyectosController,
        TareasController
    ],

    providers: [
        ClientesService,
        ProyectosService,
        TareasService
    ],

    exports: [
        ClientesService,
        ProyectosService,
        TareasService,
        TypeOrmModule 
    ]
})
export class GestionModule { }