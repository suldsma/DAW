// backend/src/modules/auth/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * ✅ NUEVO: Decorador personalizado para extraer datos del usuario del request
 * 
 * Uso en controladores:
 * ```typescript
 * async crearComentario(
 *     @Param('idTarea', ParseIntPipe) idTarea: number,
 *     @Body() dto: CreateComentarioDto,
 *     @GetUser() user: { sub: number; nombre: string }
 * ) {
 *     const usuarioId = user.sub;
 *     const usuarioNombre = user.nombre;
 * }
 * ```
 * 
 * Ventajas:
 * - Código más limpio (sin acceder manualmente a req['user'])
 * - Reutilizable en todos los controladores
 * - TypeScript-friendly con tipo personalizado
 * - Evita errores por typos en nombres de propiedades
 */
export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request['user'];
    }
);

/**
 * Tipo personalizado para la respuesta del decorador
 */
export type CurrentUser = {
    sub: number;           // ID del usuario
    nombre: string;        // Nombre del usuario
    estado: string;        // Estado del usuario (ACTIVO/BAJA)
};