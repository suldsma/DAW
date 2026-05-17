-- ============================================================
-- SCRIPT COMPLETO DE BASE DE DATOS (POSTGRESQL)
-- Incluye:
-- ✔ Estructura base
-- ✔ Extensiones
-- ✔ Datos iniciales
-- ✔ Triggers 
-- ============================================================


-- ============================================================
-- 1. LIMPIEZA DE BASE DE DATOS
-- ============================================================

DROP TABLE IF EXISTS auditorias CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS estados_tareas;
DROP TYPE IF EXISTS estados_proyectos;
DROP TYPE IF EXISTS estados_clientes;
DROP TYPE IF EXISTS estados_usuarios;


-- ============================================================
-- 2. CREACIÓN DE ENUMS
-- ============================================================

CREATE TYPE estados_usuarios AS ENUM (
    'ACTIVO',
    'BAJA'
);

CREATE TYPE estados_clientes AS ENUM (
    'ACTIVO',
    'BAJA'
);

CREATE TYPE estados_proyectos AS ENUM (
    'ACTIVO',
    'FINALIZADO',
    'BAJA'
);

CREATE TYPE estados_tareas AS ENUM (
    'PENDIENTE',
    'FINALIZADA',
    'BAJA'
);


-- ============================================================
-- 3. CREACIÓN DE TABLAS
-- ============================================================

-- ------------------------------------------------------------
-- TABLA: usuarios
-- ------------------------------------------------------------

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    estado estados_usuarios NOT NULL
);


-- ------------------------------------------------------------
-- TABLA: clientes
-- ------------------------------------------------------------

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_clientes NOT NULL
);


-- ------------------------------------------------------------
-- TABLA: proyectos
-- ------------------------------------------------------------

CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_proyectos NOT NULL,
    id_cliente INT,

    CONSTRAINT fk_proyectos_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id)
);


-- ------------------------------------------------------------
-- TABLA: tareas
-- ------------------------------------------------------------

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    estado estados_tareas NOT NULL,
    id_proyecto INT NOT NULL,

    CONSTRAINT fk_tareas_proyecto
        FOREIGN KEY (id_proyecto)
        REFERENCES proyectos(id)
);


-- ------------------------------------------------------------
-- TABLA: auditorias
-- Historial de cambios del sistema
-- ------------------------------------------------------------

CREATE TABLE auditorias (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,

    tipo_entidad TEXT NOT NULL,     
    id_entidad INT NOT NULL,

    accion TEXT NOT NULL,           

    datos_anteriores JSONB,
    datos_nuevos JSONB,

    fecha_cambio TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
);


-- ============================================================
-- 4. EXTENSIONES Y DATOS INICIALES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


INSERT INTO usuarios (
    nombre,
    clave,
    estado
)
VALUES (
    'usuario',
    crypt('clave', gen_salt('bf', 10)),
    'ACTIVO'
);


-- ============================================================
-- 5. TRIGGERS Y FUNCIONES
-- ============================================================


-- ============================================================
-- TRIGGER 1:
-- Restricción de baja de clientes
-- No se puede dar de baja si está asociado a proyectos
-- ============================================================

CREATE OR REPLACE FUNCTION validar_baja_cliente()
RETURNS TRIGGER AS
$$
BEGIN

    IF NEW.estado = 'BAJA'
       AND OLD.estado <> 'BAJA'
    THEN

        IF EXISTS (
            SELECT 1
            FROM proyectos
            WHERE id_cliente = NEW.id
        ) THEN

            RAISE EXCEPTION
                'No se puede dar de baja un cliente que está registrado en algún proyecto.';

        END IF;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_validar_baja_cliente
BEFORE UPDATE ON clientes
FOR EACH ROW
WHEN (NEW.estado IS DISTINCT FROM OLD.estado)
EXECUTE FUNCTION validar_baja_cliente();


-- ============================================================
-- TRIGGER 2:
-- Solo clientes ACTIVOS pueden asignarse a proyectos
-- ============================================================

CREATE OR REPLACE FUNCTION validar_cliente_activo_en_proyecto()
RETURNS TRIGGER AS
$$
BEGIN

    IF NEW.id_cliente IS NOT NULL THEN

        IF NOT EXISTS (
            SELECT 1
            FROM clientes
            WHERE id = NEW.id_cliente
              AND estado = 'ACTIVO'
        ) THEN

            RAISE EXCEPTION
                'Solo se pueden asignar clientes en estado ACTIVO a los proyectos.';

        END IF;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_validar_cliente_activo_proyecto
BEFORE INSERT OR UPDATE ON proyectos
FOR EACH ROW
EXECUTE FUNCTION validar_cliente_activo_en_proyecto();


-- ============================================================
-- TRIGGER 3:
-- Registro automático de auditoría
-- ============================================================

CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS
$$
BEGIN

    INSERT INTO auditorias (
        id_usuario,
        tipo_entidad,
        id_entidad,
        accion,
        datos_anteriores,
        datos_nuevos,
        fecha_cambio
    )
    VALUES (
        1, -- Reemplazar dinámicamente en producción

        TG_TABLE_NAME,

        COALESCE(NEW.id, OLD.id),

        TG_OP,

        CASE
            WHEN TG_OP = 'INSERT'
                THEN NULL
            ELSE row_to_json(OLD)::jsonb
        END,

        CASE
            WHEN TG_OP = 'DELETE'
                THEN NULL
            ELSE row_to_json(NEW)::jsonb
        END,

        NOW()
    );

    RETURN COALESCE(NEW, OLD);

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_auditoria_clientes
AFTER INSERT OR UPDATE OR DELETE ON clientes
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria();


CREATE TRIGGER trigger_auditoria_proyectos
AFTER INSERT OR UPDATE OR DELETE ON proyectos
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria();


CREATE TRIGGER trigger_auditoria_tareas
AFTER INSERT OR UPDATE OR DELETE ON tareas
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria();


-- ============================================================
-- TRIGGER 4:
-- Verificación de tareas finalizadas
-- ============================================================

CREATE OR REPLACE FUNCTION verificar_tareas_vencidas()
RETURNS TRIGGER AS
$$
BEGIN

    IF NEW.estado = 'FINALIZADA' THEN

        IF NOT EXISTS (
            SELECT 1
            FROM tareas
            WHERE id_proyecto = NEW.id_proyecto
              AND estado = 'PENDIENTE'
        ) THEN

            -- Espacio para lógica futura
            -- Ejemplo:
            -- actualizar proyecto a FINALIZADO

            NULL;

        END IF;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_verificar_tareas_vencidas
AFTER UPDATE ON tareas
FOR EACH ROW
WHEN (NEW.estado IS DISTINCT FROM OLD.estado)
EXECUTE FUNCTION verificar_tareas_vencidas();
