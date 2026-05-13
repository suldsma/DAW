// BACKEND/src/modules/gestion/gestion.module.ts

import {
    Module,
    forwardRef
} from "@nestjs/common";

import { TypeOrmModule } from "@nestjs/typeorm";

// ======================================================
// ENTITIES
// ======================================================

import { Cliente } from "./entities/cliente.entity";
import { Proyecto } from "./entities/proyecto.entity";
import { Tarea } from "./entities/tarea.entity";
import { ComentarioTarea } from "./entities/comentario-tarea.entity";

// ======================================================
// CONTROLLERS
// ======================================================

import { ClientesController } from "./controllers/clientes.controller";
import { ProyectosController } from "./controllers/proyectos.controller";
import { TareasController } from "./controllers/tareas.controller";
import { ComentariosController } from "./controllers/comentarios.controller";

// ======================================================
// SERVICES
// ======================================================

import { ClientesService } from "./services/clientes.service";
import { ProyectosService } from "./services/proyectos.service";
import { TareasService } from "./services/tarea.service";
import { ComentariosService } from "./services/comentarios.service";

// ======================================================
// MODULES
// ======================================================

import { AuthModule } from "../auth/auth.module";

@Module({

    imports: [

        /**
         * ==================================================
         * TYPEORM ENTITIES
         * ==================================================
         */
        TypeOrmModule.forFeature([
            Cliente,
            Proyecto,
            Tarea,
            ComentarioTarea
        ]),

        /**
         * ==================================================
         * AUTH MODULE
         * ==================================================
         * forwardRef evita problemas de dependencias circulares
         */
        forwardRef(() => AuthModule)
    ],

    /**
     * ======================================================
     * CONTROLLERS
     * ======================================================
     */
    controllers: [
        ClientesController,
        ProyectosController,
        TareasController,
        ComentariosController
    ],

    /**
     * ======================================================
     * PROVIDERS
     * ======================================================
     */
    providers: [
        ClientesService,
        ProyectosService,
        TareasService,
        ComentariosService
    ],

    /**
     * ======================================================
     * EXPORTS
     * ======================================================
     * Necesario para:
     * - Estadísticas
     * - Auditoría
     * - Otros módulos futuros
     * ======================================================
     */
    exports: [
        ClientesService,
        ProyectosService,
        TareasService,
        ComentariosService,
        TypeOrmModule
    ]
})
export class GestionModule { }