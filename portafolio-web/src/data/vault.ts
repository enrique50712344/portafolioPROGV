export type JavaCategory = 'nomina-poo' | 'poo-basica' | 'patrones' | 'redes-concurrencia' | 'api-rest';

export type JavaFile = {
  id: string;
  /** nombre del archivo */
  name: string;
  /** ruta relativa dentro del proyecto */
  path: string;
  category: JavaCategory;
  title: string;
  desc: string;
  loc: number;
  code: string;
  /** cómo ejecutarlo (líneas) */
  runNote: string[];
  /** salida de consola capturada realmente al compilar y ejecutar */
  output?: string | null;
  /** el programa se queda esperando (servidor) y no se captura aquí */
  blocking?: boolean;
};

export const CATEGORY_LABELS: Record<JavaCategory, string> = {
  'nomina-poo': 'Nómina · POO',
  'poo-basica': 'POO básica',
  patrones: 'Patrones de diseño',
  'redes-concurrencia': 'Redes · Concurrencia',
  'api-rest': 'API REST',
};

export const CATEGORY_ORDER: JavaCategory[] = ['nomina-poo', 'poo-basica', 'patrones', 'redes-concurrencia', 'api-rest'];
