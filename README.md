# Portafolio Programación V — Enrique López

Sitio inmersivo del curso **Programación V · UNACHI 2026-II**, construido con
React 19, Vite, TypeScript, Three.js, GSAP, Framer Motion y Tailwind CSS.

- **Sitio publicado:** <https://enrique50712344.github.io/portafolioPROGV/>
- **Repositorio:** <https://github.com/enrique50712344/portafolioPROGV>
- **Código del sitio:** [`portafolio-web/`](portafolio-web/)

El sitio incluye el **Java Vault** con el código fuente y las salidas reales de
los programas del curso, además de capturas y fichas de los sistemas web y las
APIs REST desarrolladas durante el semestre.

## Desarrollo local

```powershell
cd portafolio-web
npm install
npm run dev      # http://localhost:5183
npm run build    # genera dist/
npm run preview  # sirve el build
```

## Despliegue

Cada push a `main` ejecuta el workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que instala las
dependencias, compila el sitio y publica `portafolio-web/dist` en GitHub Pages.

Para habilitarlo por primera vez:

1. Ir a **Settings → Pages**.
2. En **Build and deployment → Source**, seleccionar **GitHub Actions**.
3. Ejecutar de nuevo el workflow desde la pestaña **Actions** si el primer
   intento falló porque Pages aún no estaba activo.

## Estructura

```text
portafolio-web/          Sitio React + Vite (código y datos del portafolio)
.github/workflows/       CI/CD para publicar en GitHub Pages
```

> Los proyectos Java y las colecciones Postman del curso no se versionan en este
> repositorio; su código ya está embebido en el Java Vault del sitio.
