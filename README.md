# Sistema Bibliotecario / Taller Villanueva

Aplicacion web hecha con Next.js para gestionar usuarios, clientes, obras, inventario, pagos y reportes de un taller de estructuras metalicas.

El proyecto funciona de forma local sin configurar una base de datos externa. Los datos de prueba se guardan en el archivo `data/store.json`.

## Requisitos

Antes de ejecutar el proyecto, instala:

- Node.js 20.9 o superior
- npm
- Git

Para comprobar tus versiones:

```bash
node -v
npm -v
git --version
```

## Descargar el repositorio

```bash
git clone https://github.com/DavidPM0/SistemaBibliotecario.git
cd SistemaBibliotecario
```

## Instalar dependencias

Ejecuta este comando para instalar exactamente las versiones probadas del proyecto:

```bash
npm ci
```

Este comando usa `package-lock.json`, por eso evita cambios automaticos de versiones entre computadoras.

Importante: no ejecutes `npm audit fix --force`. Ese comando puede cambiar Next.js a una version incompatible con React y romper la instalacion local.

## Ejecutar en modo desarrollo

```bash
npm run dev
```

Cuando el servidor este listo, abre en el navegador:

```text
http://localhost:3000
```

La pagina principal redirige automaticamente al login.

## Credenciales de prueba

Puedes iniciar sesion con cualquiera de estos usuarios activos:

| Rol | Usuario | Contrasena |
| --- | --- | --- |
| Administrador | `lvillanueva` | `admin123` |
| Empleado | `mtorres` | `empleado123` |

Tambien existe un usuario inactivo de prueba (`cmendoza`), pero no permite iniciar sesion.

## Comandos disponibles

```bash
npm ci
```

Instala las dependencias exactas del proyecto desde `package-lock.json`.

```bash
npm run dev
```

Levanta el servidor local de desarrollo.

```bash
npm run build
```

Compila la aplicacion para produccion y ayuda a detectar errores antes de publicar.

```bash
npm run start
```

Ejecuta la version compilada. Antes debes correr `npm run build`.

## Estructura principal

```text
app/                 Paginas y rutas API de Next.js
components/          Componentes reutilizables de interfaz
data/store.json      Datos locales de prueba
lib/                 Utilidades, tipos y acceso al archivo de datos
pdf-previews/        Imagenes usadas como vistas previas
scripts/             Scripts auxiliares del proyecto
```

## Como se guardan los datos

El sistema lee y escribe informacion en:

```text
data/store.json
```

Si agregas, editas o eliminas datos desde la aplicacion, los cambios quedan guardados en ese archivo local.

Para volver a los datos originales, puedes restaurar el archivo desde Git:

```bash
git restore data/store.json
```

## Problemas comunes

### El puerto 3000 ya esta ocupado

Deten el otro proceso o ejecuta Next.js en otro puerto:

```bash
npm run dev -- -p 3001
```

Luego abre:

```text
http://localhost:3001
```

### Error al instalar dependencias

Verifica que estes usando Node.js 20.9 o superior:

```bash
node -v
```

Si el problema continua, elimina la instalacion local y vuelve a instalar desde el lockfile.

En PowerShell:

```bash
Remove-Item -Recurse -Force node_modules
npm ci
```

Si tambien se modifico `package-lock.json` despues de ejecutar `npm audit fix --force`, restaura los archivos del proyecto y reinstala:

```bash
git restore package.json package-lock.json
Remove-Item -Recurse -Force node_modules
npm ci
```

### npm muestra vulnerabilidades o recomienda audit fix

El proyecto ya incluye un `overrides` para usar una version corregida de `postcss`.

Si npm recomienda ejecutar `npm audit fix --force`, no lo ejecutes. Primero actualiza el repositorio:

```bash
git pull
npm ci
```

### No puedo iniciar sesion

Usa un usuario activo de la tabla de credenciales. Si modificaste los datos locales, revisa el archivo `data/store.json` o restauralo con:

```bash
git restore data/store.json
```

## Flujo recomendado para probar

1. Clona el repositorio.
2. Instala dependencias con `npm ci`.
3. Ejecuta `npm run dev`.
4. Abre `http://localhost:3000`.
5. Inicia sesion con `lvillanueva` y `admin123`.
6. Revisa los modulos de dashboard, clientes, obras, usuarios, inventario y reportes.

## Notas para desarrollo

- No se requiere configurar variables de entorno.
- No se requiere instalar MySQL, PostgreSQL ni otro motor de base de datos.
- El proyecto usa App Router de Next.js.
- Las rutas API estan dentro de `app/api`.
- El almacenamiento local es suficiente para pruebas y demostraciones.
