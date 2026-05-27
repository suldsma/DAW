-- ============================================================
-- SCRIPT DE BASE DE DATOS FINAL Y INTEGRADO (POSTGRESQL)
-- ============================================================

-- 1. LIMPIEZA
DROP TABLE IF EXISTS metas CASCADE;
DROP TABLE IF EXISTS auditorias CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS roles_usuarios;
DROP TYPE IF EXISTS estados_tareas;
DROP TYPE IF EXISTS estados_proyectos;
DROP TYPE IF EXISTS estados_clientes;
DROP TYPE IF EXISTS estados_usuarios;

-- 2. ENUMS
CREATE TYPE roles_usuarios AS ENUM ('ADMIN', 'USER');
CREATE TYPE estados_usuarios AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE estados_clientes AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE estados_proyectos AS ENUM ('ACTIVO', 'FINALIZADO', 'BAJA');
CREATE TYPE estados_tareas AS ENUM ('PENDIENTE', 'FINALIZADA', 'BAJA');

-- 3. TABLAS PRINCIPALES
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    estado estados_usuarios NOT NULL,
    rol roles_usuarios DEFAULT 'USER'
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_clientes NOT NULL,
    email TEXT,
    telefono TEXT
);

CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    estado estados_proyectos NOT NULL,
    "idCliente" INT,
    "fechaFinalizacionObjetivo" DATE,
    "fechaCreacion" TIMESTAMP DEFAULT NOW(),
    "fechaActualizacion" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_proyectos_cliente FOREIGN KEY ("idCliente") REFERENCES clientes(id)
);

CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    "fechaLimite" DATE,
    "idProyecto" INT NOT NULL,
    CONSTRAINT fk_metas_proyecto FOREIGN KEY ("idProyecto") REFERENCES proyectos(id) ON DELETE CASCADE
);

CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    estado estados_tareas NOT NULL,
    "idProyecto" INT NOT NULL,
    "idMeta" INT,
    CONSTRAINT fk_tareas_proyecto FOREIGN KEY ("idProyecto") REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT fk_tareas_meta FOREIGN KEY ("idMeta") REFERENCES metas(id) ON DELETE SET NULL
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
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY ("id_usuario") REFERENCES usuarios(id)
);

-- Índices
CREATE INDEX idx_proyectos_fecha ON proyectos("fechaFinalizacionObjetivo");

-- 4. DATOS INICIALES
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO usuarios (nombre, clave, estado, rol)
VALUES ('admin', crypt('admin123', gen_salt('bf', 10)), 'ACTIVO', 'ADMIN');

-- 5. FUNCIONES Y TRIGGERS

-- Trigger: Validación de clientes activos
CREATE OR REPLACE FUNCTION validar_cliente_activo_en_proyecto() RETURNS TRIGGER AS $$
BEGIN
    IF NEW."idCliente" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clientes WHERE id = NEW."idCliente" AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'Solo se pueden asignar clientes en estado ACTIVO.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_val_cliente BEFORE INSERT OR UPDATE ON proyectos FOR EACH ROW EXECUTE FUNCTION validar_cliente_activo_en_proyecto();

-- Trigger: Auditoría General
CREATE OR REPLACE FUNCTION registrar_auditoria() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditorias ("id_usuario", "nombre_usuario", "tipo_entidad", "id_entidad", "tipo_operacion", "datosCambio")
    VALUES (1, 'Sistema', TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP, row_to_json(COALESCE(NEW, OLD))::jsonb);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_clientes AFTER INSERT OR UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();
CREATE TRIGGER trg_auditoria_proyectos AFTER INSERT OR UPDATE ON proyectos FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();