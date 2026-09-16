# Sistema de Registro - API Server

API REST desarrollada con Node.js, Express, TypeScript y Microsoft SQL Server para la gestión de productos/tarjetas.

---

## Estructura del Proyecto

```text
Server/
├── db/
│   └── urbans.sql           # Script de creación de base de datos y tablas
├── src/
│   ├── Controller/
│   │   └── Productos.ts     # Lógica de controladores de productos
│   ├── Interface/
│   │   └── interface.db.ts  # Definiciones de tipos e interfaces de TypeScript
│   ├── Router/
│   │   └── Productos.route.ts # Definición de rutas/endpoints de productos
│   └── Index.ts             # Punto de entrada de la aplicación Express
├── package.json
└── tsconfig.json