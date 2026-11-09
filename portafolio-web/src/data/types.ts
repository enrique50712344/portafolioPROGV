// Catálogo de las aplicaciones en vivo. La generación de contenido RF/ARF se hace en el pipeline; estos
// metadatos son la parte "curada" del portafolio.

export type Endpoint = { metodo: 'GET' | 'POST' | 'PUT' | 'DELETE'; ruta: string; desc: string };

export type LiveProject = {
  id: string;
  nombre: string;
  tagline: string;
  categoria: 'Sistema web JSP' | 'API REST Java';
  descripcion: string;
  features: string[];
  stack: string[];
  /** URL directa para abrir en nueva pestaña (navegador del usuario) */
  urlExterna: string;
  /** Ruta del proxy del portafolio para probes y consola API */
  urlProbe: string;
  /** Ruta base (proxy) para la consola API en vivo */
  urlConsola?: string;
  /** URL para embeber el iframe de vista previa */
  urlIframe?: string;
  /** captura guardada en /shots */
  shot?: string | null;
  puerto: string;
  tipo: 'web' | 'api';
  credencialesDemo?: { usuario: string; clave: string };
  endpoints?: Endpoint[];
  coleccionPostman?: string;
};
