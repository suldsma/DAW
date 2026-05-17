# 🛠️ Tecnologías y Herramientas

| Tecnología | Descripción |
| ⚙️ NestJS | Framework backend |
| 🟦 TypeScript | Lenguaje principal |
| 🐘 PostgreSQL | Base de datos relacional |
| 🗄️ TypeORM | ORM para manejo de entidades |
| 🔐 JWT | Autenticación y autorización |
| 🔒 Bcrypt | Encriptación de contraseñas |
| 🛡️ Helmet | Seguridad HTTP |
| 📘 Swagger | Documentación interactiva |

---

Crear un archivo .env en la raíz del proyecto:

# Aplicación

PORT=3000
NODE_ENV=development

# JWT

JWT_SECRET="TU_SECRET_KEY"

# Base de Datos

DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=2026
DB_NAME=gestion_proyectos
DB_LOGGING=true

# Swagger y CORS

SWAGGER_HABILITADO=true
CORS_ORIGIN=http://localhost:4200

---

## Ejecución del Proyecto

🔧 Modo desarrollo
npm run start:dev

🚀 Modo producción
npm run build
npm run start:prod

## 🌐 Endpoints Principales

API Base
http://localhost:3000/api/v1
📘 Swagger
http://localhost:3000/api/docs

## 🧪 Testing

Ejecutar pruebas unitarias
npm run test

Ejecutar pruebas e2e
npm run test:e2e

Cobertura de código
npm run test:cov

---

Desarrollado como Trabajo Final Integrador GRUPO "A"
para la carrera de Desarrollo de Software.
