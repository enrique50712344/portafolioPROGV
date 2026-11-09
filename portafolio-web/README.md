# Portafolio Web — Enrique López · Programación V · UNACHI 2026-II

Sitio inmersivo (React + Three.js + GSAP + Framer Motion + Tailwind) que muestra
**todo el trabajo del curso**: las apps web que corren en Docker y, para los
programas que solo son Java, un **Java Vault** con código fuente, salidas reales
capturadas al ejecutarlos ese día, y los pasos para compilarlos y correrlos.

| URL |Qué es |
|---|---|
| **http://localhost:8083** | Este portafolio (contenedor `portafolio-web`) |
| http://localhost:8080/gestion-inventario/ | Nexorys · Inventario (demo: `admin / 1234`) |
| http://localhost:8081/rrhh/ | Sistema de personal RRHH |
| http://localhost:8082/api/reservas | ReservasLab API |
| http://localhost:3000/api/espacios | Prototipo ReservaFE |

## Uso diario

```powershell
cd C:\xampp\htdocs\Programas\ProgramacionV_2026-II\portafolio-web
docker compose up -d        # encender
docker compose stop         # apagar
docker compose up -d --build  # reconstruir tras cambios de código
```

## Arranque automático

- Docker Desktop ya inicia con Windows, y el contenedor tiene
  `restart: unless-stopped`.
- Además, `Portafolio-Docker.bat` (en la carpeta *Startup* de Windows) ejecuta
  `scripts/arranque-automatico.ps1`: espera al motor Docker y levanta el
  contenedor si hiciera falta.

## Regenerar contenido (Java Vault y capturas)

```powershell
npm run codegen   # recorre los .java, los cataloga y captura salidas reales (JDK 24)
npm run shots     # recaptura las imágenes de Nexorys (con login) y RRHH con Chrome headless
npm run build     # recompila el sitio
```

El archivo generado `src/data/javaVault.generated.ts` ya está versionado, así que
el build de Docker funciona sin JDK ni acceso a los proyectos vecinos.

## Arquitectura

- `Vite + React 19 + TypeScript` → bundle estático servido por **nginx**.
- `nginx.conf` expone **proxies internos** hacia las apps del equipo
  (`/probe/*` para semáforos, `/api-live/*` para la consola de APIs), de modo
  que el portafolio consulta las APIs **sin problemas de CORS**.
- El contenedor usa `extra_hosts: host.docker.internal:host-gateway`.

## Editar datos personales

Todo lo personal (nombre, correo, redes, bio) vive en
`src/data/profile.ts`; los proyectos en `src/data/projects.ts`.

## Publicación en GitHub Pages

El sitio se publica automáticamente desde `main` con
`.github/workflows/deploy.yml`. Vite usa `base: './'`, así que el mismo build
funciona en local y en
<https://enrique50712344.github.io/portafolioPROGV/>.

Las demos de las aplicaciones siguen siendo locales: en GitHub Pages se muestran
las capturas y un aviso de **demo local** en lugar de los iframes y las consolas
que dependen de Docker.
