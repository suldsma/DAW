import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUser = {
    sub: number;    
    nombre: string; 
    estado: string; 
};

export const GetUser = createParamDecorator(
    (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        
        // Mapea a 'user' que es el estándar por defecto de Passport / JwtAuthGuard
        const user = request.user;

        return data ? user?.[data] : user;
    },
);