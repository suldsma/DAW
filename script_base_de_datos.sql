-- ============================================================
-- SCRIPT DE BASE DE DATOS COMPLETO (POSTGRESQL)
-- ============================================================

-- 1. LIMPIEZA DE BASE DE DATOS
DROP TABLE IF EXISTS auditorias CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS estados_tareas;
DROP TYPE IF EXISTS estados_proyectos;
DROP TYPE IF EXISTS estados_clientes;
DROP TYPE IF EXISTS estados_usuarios;

-- 2. CREACIÓN DE ENUMS
CREATE TYPE estados_usuarios AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE estados_clientes AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE estados_proyectos AS ENUM ('ACTIVO', 'FINALIZADO', 'BAJA');
CREATE TYPE estados_tareas AS ENUM ('PENDIENTE', 'FINALIZADA', 'BAJA');

-- 3. CREACIÓN DE TABLAS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    estado estados_usuarios NOT NULL
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_clientes NOT NULL
);

CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_proyectos NOT NULL,
    "idCliente" INT,
    "fechaFinalizacionObjetivo" DATE NULL,
    "fechaCreacion" TIMESTAMP DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_proyectos_cliente
        FOREIGN KEY ("idCliente")
        REFERENCES clientes(id)
);

-- Índice para mejorar búsquedas por fecha
CREATE INDEX idx_proyectos_fecha ON proyectos("fechaFinalizacionObjetivo");

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    estado estados_tareas NOT NULL,
    "idProyecto" INT NOT NULL,

    CONSTRAINT fk_tareas_proyecto
        FOREIGN KEY ("idProyecto")
        REFERENCES proyectos(id)
);

CREATE TABLE auditorias (
    id SERIAL PRIMARY KEY,
    "tipo_entidad" TEXT NOT NULL,
    "id_entidad" INT NOT NULL,
    "tipo_operacion" TEXT NOT NULL,
    "id_usuario" INT NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "datosCambio" JSONB,
    "detalles" TEXT,
    "fecha_operacion" TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY ("id_usuario")
        REFERENCES usuarios(id)
);

-- 4. EXTENSIONES Y DATOS INICIALES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (nombre, clave, estado)
VALUES ('usuario', crypt('clave', gen_salt('bf', 10)), 'ACTIVO');

-- 5. FUNCIONES Y TRIGGERS

-- Trigger 1: Restricción de baja de clientes
CREATE OR REPLACE FUNCTION validar_baja_cliente() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'BAJA' AND OLD.estado <> 'BAJA' THEN
        IF EXISTS (SELECT 1 FROM proyectos WHERE "idCliente" = NEW.id) THEN
            RAISE EXCEPTION 'No se puede dar de baja un cliente que está registrado en algún proyecto.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_baja_cliente
BEFORE UPDATE ON clientes FOR EACH ROW
WHEN (NEW.estado IS DISTINCT FROM OLD.estado)
EXECUTE FUNCTION validar_baja_cliente();

-- Trigger 2: Clientes activos en proyectos
CREATE OR REPLACE FUNCTION validar_cliente_activo_en_proyecto() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."idCliente" IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = NEW."idCliente" AND estado = 'ACTIVO') THEN
            RAISE EXCEPTION 'Solo se pueden asignar clientes en estado ACTIVO a los proyectos.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_cliente_activo_proyecto
BEFORE INSERT OR UPDATE ON proyectos FOR EACH ROW
EXECUTE FUNCTION validar_cliente_activo_en_proyecto();

-- Trigger 3: Auditoría
CREATE OR REPLACE FUNCTION registrar_auditoria() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditorias ("id_usuario", "nombre_usuario", "tipo_entidad", "id_entidad", "tipo_operacion", "datosCambio", "detalles", "fecha_operacion")
    VALUES (1, 'Sistema (Trigger)', TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP,
        CASE
            WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)::jsonb
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb
            ELSE jsonb_build_object('antes', row_to_json(OLD)::jsonb, 'despues', row_to_json(NEW)::jsonb)
        END,
        'Operación automática ejecutada por la base de datos.', NOW());
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_clientes AFTER INSERT OR UPDATE OR DELETE ON clientes FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();
CREATE TRIGGER trigger_auditoria_proyectos AFTER INSERT OR UPDATE OR DELETE ON proyectos FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();
CREATE TRIGGER trigger_auditoria_tareas AFTER INSERT OR UPDATE OR DELETE ON tareas FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- Trigger 4: Verificación tareas
CREATE OR REPLACE FUNCTION verificar_tareas_vencidas() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'FINALIZADA' THEN
        -- Lógica de validación aquí si fuera necesaria
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_tareas_vencidas
AFTER UPDATE ON tareas FOR EACH ROW
WHEN (NEW.estado IS DISTINCT FROM OLD.estado)
EXECUTE FUNCTION verificar_tareas_vencidas();