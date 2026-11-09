// --------------------------------------------------------------------------
// generate-content.mjs
// Recorre los programas Java del curso, los clasifica y genera:
//   src/data/javaVault.generated.ts   (código fuente + metadatos + salidas)
//
// Para capturar salidas reales compila y ejecuta (JDK 24) solo los programas
// de consola que terminan solos. Los servidores se marcan como "blocking".
// --------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const BASE = path.resolve(import.meta.dirname, '..'); // portafolio-web
const SRC = path.resolve(BASE, '..'); // ProgramacionV_2026-II
const OUT = path.join(BASE, 'src', 'data', 'javaVault.generated.ts');

const JAVA_HOME = 'C:/Program Files/Java/jdk-24';
const JAVA = path.join(JAVA_HOME, 'bin', 'java.exe');
const JAVAC = path.join(JAVA_HOME, 'bin', 'javac.exe');
const JDK_OK = fs.existsSync(JAVA) && fs.existsSync(JAVAC);

// ---------------------------------------------------------------- helpers
const abs = (rel) => path.join(SRC, rel);

function readJava(rel) {
  const p = abs(rel);
  if (!fs.existsSync(p)) return null;
  const code = fs.readFileSync(p, 'utf8');
  return { code, loc: code.split('\n').filter((l) => l.trim().length > 0).length };
}

/** compila + ejecuta y devuelve la salida de consola (o null si falla) */
function captureOutput(unitId, files, mainClass, args = []) {
  if (!JDK_OK) return null;
  const workdir = path.join(os.tmpdir(), `portafolio-java-${unitId}-${randomUUID()}`);
  const bin = path.join(workdir, 'bin');
  try {
    fs.mkdirSync(bin, { recursive: true });
    const realPaths = files.map((f) => abs(f));
    const build = spawnSync(JAVAC, ['-encoding', 'UTF-8', '-d', bin, ...realPaths], {
      encoding: 'utf8',
      timeout: 30000,
      windowsHide: true,
    });
    if (build.error || build.status !== 0) return null;
    const run = spawnSync(JAVA, ['-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', '-cp', bin, mainClass, ...args], {
      encoding: 'utf8',
      timeout: 12000,
      windowsHide: true,
      input: '',
    });
    if (run.error) return null;
    const out = ((run.stdout || '') + (run.stderr ? `\n[stderr] ${run.stderr}` : '')).trim();
    return out.slice(0, 4000) || '(sin salida en consola)';
  } catch {
    return null;
  } finally {
    try {
      fs.rmSync(workdir, { recursive: true, force: true });
    } catch {
      /* noop */
    }
  }
}

// ---------------------------------------------------------------- spec
// Cada entrada: ruta relativa, título, descripción, categoría, cómo ejecutar.
const SPEC = [
  // ===== NÓMINA / POO =====
  {
    rel: 'main1.java',
    id: 'main1',
    title: 'Sistema de nómina (main)',
    category: 'nomina-poo',
    desc: 'Punto de entrada de la nómina: construye la lista de empleados con todas sus especialidades, calcula salarios finales y recorre la nómina mostrando el detalle de cada tipo.',
    runNote: ['javac -encoding UTF-8 empleado.java gerente.java operario.java vendedor.java pasante.java main1.java', 'java main1'],
    runFiles: ['empleado.java', 'gerente.java', 'operario.java', 'vendedor.java', 'pasante.java', 'main1.java'],
    runMain: 'main1',
  },
  {
    rel: 'empleado.java',
    id: 'empleado',
    title: 'empleado (clase abstracta)',
    category: 'nomina-poo',
    desc: 'Clase abstracta que especializan el gerente, operario, vendedor y pasante: encapsula nombre, cédula y salario base, y declara el cálculo del salario final.',
    runNote: ['Compílalas en grupo: javac -encoding UTF-8 empleado.java gerente.java operario.java vendedor.java pasante.java main1.java', 'Prueba con: java main1'],
  },
  {
    rel: 'gerente.java',
    id: 'gerente',
    title: 'gerente (herencia)',
    category: 'nomina-poo',
    desc: 'Especialización de empleado con bono de dirección: demuestra encapsulamiento en la subclase y datos privados propios.',
    runNote: ['javac -encoding UTF-8 empleado.java gerente.java operario.java vendedor.java pasante.java main1.java', 'java main1'],
  },
  {
    rel: 'operario.java',
    id: 'operario',
    title: 'operario (herencia)',
    category: 'nomina-poo',
    desc: 'Especialización con horas extra y pago por hora extra; recalcula el salario final sumando las extras.',
    runNote: ['javac -encoding UTF-8 empleado.java gerente.java operario.java vendedor.java pasante.java main1.java', 'java main1'],
  },
  {
    rel: 'vendedor.java',
    id: 'vendedor',
    title: 'vendedor (herencia)',
    category: 'nomina-poo',
    desc: 'Especialización con monto de ventas y porcentaje de comisión: el salario final se compone del base más las comisiones ganadas.',
    runNote: ['javac -encoding UTF-8 empleado.java gerente.java operario.java vendedor.java pasante.java main1.java', 'java main1'],
  },
  {
    rel: 'pasante.java',
    id: 'pasante',
    title: 'pasante (herencia)',
    category: 'nomina-poo',
    desc: 'Especialización que agrega el monto de beca al salario base de un pasante de la empresa.',
    runNote: ['javac -encoding UTF-8 empleado.java gerente.java operario.java vendedor.java pasante.java main1.java', 'java main1'],
  },
  {
    rel: 'logos.java',
    id: 'logos',
    title: 'logos (utilidad)',
    category: 'nomina-poo',
    desc: 'Utilidad estática para la cabecera visual del sistema de nómina en la consola.',
    runNote: ['javac -encoding UTF-8 logos.java', 'Instanciar/invocar desde otra clase (no tiene main)'],
  },

  // ===== POO BÁSICA =====
  {
    rel: 'cuentabancaria.java',
    id: 'cuentabancaria',
    title: 'cuentabancaria (modelo)',
    category: 'poo-basica',
    desc: 'Modelo de dominio de una cuenta bancaria: número de cuenta y saldo con operaciones. Ejemplo de encapsulamiento con getters.',
    runNote: ['Es una clase de modelo sin main: instánciala desde otra clase o consola.'],
  },
  {
    rel: 'factura.java',
    id: 'factura',
    title: 'factura (modelo)',
    category: 'poo-basica',
    desc: 'Modelo de dominio de una factura con número y monto; base conceptual para la facturación del sistema de inventario.',
    runNote: ['Es una clase de modelo sin main: instánciala desde otra clase o consola.'],
  },

  // ===== PATRONES =====
  {
    rel: 'BlackboardDemo.java',
    id: 'blackboard',
    title: 'Blackboard (pizarra compartida)',
    category: 'patrones',
    desc: 'Varios módulos escriben y leen un mapa común: especialistas que resuelven fragmentos de un problema sobre una pizarra compartida. Patrón Blackboard.',
    runNote: ['java BlackboardDemo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['BlackboardDemo.java'],
    runMain: 'BlackboardDemo',
  },
  {
    rel: 'BrokerDemo.java',
    id: 'broker',
    title: 'Broker (registro de servicios)',
    category: 'patrones',
    desc: 'Un registro central publica los servicios disponibles y el cliente los localiza por nombre: el patrón Broker en miniatura.',
    runNote: ['java BrokerDemo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['BrokerDemo.java'],
    runMain: 'BrokerDemo',
  },
  {
    rel: 'CapasDemo.java',
    id: 'capas',
    title: 'Capas (Presentación → Negocio → Datos)',
    category: 'patrones',
    desc: 'La arquitectura de 3 capas en un archivo: simulación de un DAO, un servicio con reglas de negocio y la vista de presentación.',
    runNote: ['java CapasDemo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['CapasDemo.java'],
    runMain: 'CapasDemo',
  },
  {
    rel: 'MVCDemo.java',
    id: 'mvc',
    title: 'MVC con temperatura',
    category: 'patrones',
    desc: 'Un modelo de temperatura, dos vistas (Celsius / Fahrenheit) y un controlador que las sincroniza: MVC de consola.',
    runNote: ['java MVCDemo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['MVCDemo.java'],
    runMain: 'MVCDemo',
  },
  {
    rel: 'InterpreteDemo.java',
    id: 'interprete',
    title: 'Intérprete (expresiones matemáticas)',
    category: 'patrones',
    desc: 'Árbol de expresiones con interprete(): cada expresión se interpreta a sí misma y construye el resultado. Patrón Interpreter.',
    runNote: ['java InterpreteDemo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['InterpreteDemo.java'],
    runMain: 'InterpreteDemo',
  },
  {
    rel: 'PipeFilter.java',
    id: 'pipefilter',
    title: 'Pipe & Filter (pipeline)',
    category: 'patrones',
    desc: 'Cada filtro transforma la entrada y entrega el resultado al siguiente en el pipeline: como etapas de compilación sobre un fragmento de código.',
    runNote: ['java PipeFilter.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['PipeFilter.java'],
    runMain: 'PipeFilter',
  },
  {
    rel: 'EventusSimple.java',
    id: 'eventus',
    title: 'Event Bus (Eventus)',
    category: 'patrones',
    desc: 'Comunicación publica/suscripción: los componentes publican eventos y los consumidores reaccionan sin acoplarse entre sí.',
    runNote: ['java EventusSimple.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['EventusSimple.java'],
    runMain: 'EventusSimple',
  },
  {
    rel: 'P2PDemo.java',
    id: 'p2p',
    title: 'Peer to Peer',
    category: 'patrones',
    desc: 'Nodos iguales que se conocen entre sí e intercambian mensajes sin intermediario: arquitectura P2P de consola.',
    runNote: ['java P2PDemo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['P2PDemo.java'],
    runMain: 'P2PDemo',
  },
  {
    rel: 'MaestroEsclavo.java',
    id: 'maestro',
    title: 'Maestro-Esclavo (con hilos)',
    category: 'patrones',
    desc: 'Un maestro distribuye tareas con ExecutorService; los esclavos computan en paralelo y el maestro recoge los resultados con Future.',
    runNote: ['java MaestroEsclavo.java   (JDK 11+: lanza fuentes directo)'],
    runFiles: ['MaestroEsclavo.java'],
    runMain: 'MaestroEsclavo',
  },

  // ===== REDES / CONCURRENCIA =====
  {
    rel: 'cliente-servidor.java',
    id: 'cliente-servidor',
    title: 'Cliente y servidor TCP (sockets)',
    category: 'redes-concurrencia',
    desc: 'Un servidor espera conexiones en un ServerSocket; un cliente conecta, envía un mensaje y recibe la respuesta. El bloque de comunicaciones de red más básico.',
    runNote: ['Abre dos consolas en la carpeta del programa.', 'Consola 1 (servidor):  java cliente-servidor.java', 'Consola 2 (cliente):   la clase Cliente se ejecuta cuando así se indique en clase'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto1/Servidor.java',
    id: 'reto1-servidor',
    title: 'Reto 1 — servidor de reservas',
    category: 'redes-concurrencia',
    desc: 'Servidor HTTP con pool de hilos fijo (o hilos virtuales): endpoints para espacios y reservas, y tolerancia a las solicitudes lentas.',
    runNote: ['cd Retos/Reto1', 'java Servidor.java 4            (4 hilos de trabajo)', 'java Servidor.java virtual      (un hilo virtual por solicitud)'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto1/Carga.java',
    id: 'reto1-carga',
    title: 'Reto 1 — generador de carga',
    category: 'redes-concurrencia',
    desc: 'Dispara N solicitudes concurrentes a un endpoint y mide cuántas responden y en cuánto tiempo: la herramienta de pruebas de estrés.',    runNote: ['cd Retos/Reto1 (con el servidor corriendo en otra consola)', 'java Carga.java "ruta" 20'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto1/Cliente.java',
    id: 'reto1-cliente',
    title: 'Reto 1 — cliente HTTP',
    category: 'redes-concurrencia',
    desc: 'Cliente simple que se conecta al servidor del retos y consume endpoints de reservas.',
    runNote: ['cd Retos/Reto1 (con el servidor corriendo)', 'java Cliente.java "Ana Perez"'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto2/ServidorCarrera.java',
    id: 'reto2-carrera',
    title: 'Reto 2 — servidor con hilos virtuales (carrera)',
    category: 'redes-concurrencia',
    desc: 'Evolución del Reto 1: cada solicitud se atiende en un hilo virtual y se compara el rendimiento con el pool fijo.',
    runNote: ['cd Retos/Reto2', 'java ServidorCarrera.java virtual'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto2/Servidor.java',
    id: 'reto2-servidor',
    title: 'Reto 2 — servidor de reservas v2',
    category: 'redes-concurrencia',
    desc: 'Continuación del servidor con workers mejorados y bloqueo de hilo para ralentizar respuestas de forma controlada.',
    runNote: ['cd Retos/Reto2', 'java Servidor.java 4'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto2/Carga.java',
    id: 'reto2-carga',
    title: 'Reto 2 — generador de carga',
    category: 'redes-concurrencia',
    desc: 'Prueba de estrés del servidor del Reto 2 con un lote de solicitudes concurrentes.',
    runNote: ['cd Retos/Reto2 (servidor en otra consola)', 'java Carga.java "ruta" 20'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto3/Servidor.java',
    id: 'reto3-servidor',
    title: 'Reto 3 — servidor con seguridad y semáforos',
    category: 'redes-concurrencia',
    desc: 'Protege recursos compartidos con Semaphore para limitar la concurrencia real, evitando el agotamiento del servidor.',
    runNote: ['cd Retos/Reto3', 'java Servidor.java 4'],
    blocking: true,
  },
  {
    rel: 'Retos/Reto3/Carga.java',
    id: 'reto3-carga',
    title: 'Reto 3 — generador de carga',
    category: 'redes-concurrencia',
    desc: 'Satura el servidor del Reto 3 para demostrar el efecto del semáforo bajo presión.',
    runNote: ['cd Retos/Reto3 (servidor en otra consola)', 'java Carga.java "ruta" 20'],
    blocking: true,
  },

  // ===== PROTOTIPO RESERVAFE =====
  {
    rel: 'Prototipo_ReservaFE_Java8/prototipo/Servidor.java',
    id: 'prototipo-servidor',
    title: 'ReservaFE (Servidor HTTP)',
    category: 'api-rest',
    desc: 'Server core del prototipo de reservas: HttpServer con espacios y reservas y rutas de estrés de rendimiento.',
    runNote: ['cd Prototipo_ReservaFE_Java8/prototipo', 'java Servidor 4        (servidor con 4 hilos)', 'java Servidor ilimitado (un hilo por solicitud)'],
    blocking: true,
  },
  {
    rel: 'Prototipo_ReservaFE_Java8/prototipo/Http.java',
    id: 'prototipo-http',
    title: 'ReservaFE (Cliente HTTP utilitario)',
    category: 'api-rest',
    desc: 'Wrapper de HttpURLConnection para comunicarse con el servidor de reservas.',
    runNote: ['Se usa desde Cliente.java y Carga.java (no tiene main)'],
  },
  {
    rel: 'Prototipo_ReservaFE_Java8/prototipo/Cliente.java',
    id: 'prototipo-cliente',
    title: 'ReservaFE (Cliente de reservas)',
    category: 'api-rest',
    desc: 'Consumidor del servidor: crea y consulta reservas por HTTP mostrando la respuesta en consola.',
    runNote: ['cd Prototipo_ReservaFE_Java8/prototipo (con el Servidor corriendo)', 'java Cliente "Ana Perez"'],
    blocking: false,
  },
  {
    rel: 'Prototipo_ReservaFE_Java8/prototipo/Carga.java',
    id: 'prototipo-carga',
    title: 'ReservaFE (Generador de carga)',
    category: 'api-rest',
    desc: 'Dispara muchas solicitudes concurrentes; sirve para demostrar la diferencia entre pool fijo e hilos ilimitados.',
    runNote: ['cd Prototipo_ReservaFE_Java8/prototipo (con el Servidor corriendo)', 'java Carga "/api/lento?ms=500" 20', 'java Carga reservas 10'],
    blocking: true,
  },

  // ===== RESERVAS LAB API =====
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/servidor/ServidorReservas.java',
    id: 'lab-servidor',
    title: 'ReservasLabAPI (Servidor)',
    category: 'api-rest',
    desc: 'main del servidor REST: pool de hilos, bitácora de rendimiento y despacho a ReservasHandler.',
    runNote: ['cd ReservasLabAPISemana10/ReservasLabAPI', 'javac -encoding UTF-8 -d build src/reservas/*/*.java', 'java -cp build reservas.servidor.ServidorReservas'],
    blocking: true,
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/servidor/ReservasHandler.java',
    id: 'lab-handler',
    title: 'ReservasLabAPI (Rutas HTTP)',
    category: 'api-rest',
    desc: 'Router HTTP: GET/POST/PUT/DELETE de /api/reservas con códigos de estado estándar y validación de la X-API-KEY.',
    runNote: ['Compila y ejecuta la API (ver ServidorReservas) y consulta desde Postman'],
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/servidor/Json.java',
    id: 'lab-json',
    title: 'ReservasLabAPI (Serializador JSON)',
    category: 'api-rest',
    desc: 'Conversor manual objeto↔JSON sin librerías externas: serializa y parsea los modelos de reservas.',
    runNote: ['Se usa dentro del servidor (no tiene main)'],
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/negocio/ServicioReservas.java',
    id: 'lab-servicio',
    title: 'ReservasLabAPI (Reglas de negocio)',
    category: 'api-rest',
    desc: 'Aquí viven las RF: laboratorios válidos, fechas y horas correctas, sin choques de horario, datos completos.',
    runNote: ['Se usa dentro del servidor (no tiene main)'],
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/negocio/ValidacionException.java',
    id: 'lab-excepcion',
    title: 'ReservasLabAPI (Excepción de dominio)',
    category: 'api-rest',
    desc: 'Excepción propia de las reglas del negocio que el handler traduce a un error HTTP 400/409.',
    runNote: ['Clase utilitaria (no tiene main)'],
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/datos/RepositorioReservas.java',
    id: 'lab-repositorio',
    title: 'ReservasLabAPI (Repositorio)',
    category: 'api-rest',
    desc: 'Almacenamiento en memoria con estructuras thread-safe para soportar el pool de hilos del servidor.',
    runNote: ['Se usa dentro del servidor (no tiene main)'],
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/modelo/Reserva.java',
    id: 'lab-modelo',
    title: 'ReservasLabAPI (Entidad Reserva)',
    category: 'api-rest',
    desc: 'Entidad del dominio: id, laboratorio, solicitante, fecha y horas de la reserva.',
    runNote: ['Se usa dentro del servidor (no tiene main)'],
  },
  {
    rel: 'ReservasLabAPISemana10/ReservasLabAPI/src/reservas/cliente/ClienteConsola.java',
    id: 'lab-cliente',
    title: 'ReservasLabAPI (Cliente consola)',
    category: 'api-rest',
    desc: 'Menú de consola para probar la API y su modo "demo" automático con casos encadenados.',
    runNote: ['Con el servidor corriendo:', 'java -cp build reservas.cliente.ClienteConsola', 'java -cp build reservas.cliente.ClienteConsola demo    (demo automática)'],
    blocking: true,
  },
];

// ---------------------------------------------------------------- build
const entries = [];

for (const item of SPEC) {
  const data = readJava(item.rel.replace(/\//g, '\\')) ?? readJava(item.rel);
  if (!data) {
    console.warn(`[codegen] no encontré ${item.rel} — se omite`);
    continue;
  }
  let output = null;
  if (item.runMain && item.runFiles) {
    output = captureOutput(item.id, item.runFiles, item.runMain, item.runArgs || []);
  }
  entries.push({
    id: item.id,
    name: path.basename(item.rel),
    path: item.rel.replace(/\\/g, '/'),
    category: item.category,
    title: item.title,
    desc: item.desc,
    loc: data.loc,
    code: data.code,
    runNote: item.runNote,
    output,
    blocking: Boolean(item.blocking),
  });
}

// ---------------------------------------------------------------- write
const serialized = JSON.stringify(entries, null, 2);
const generatedAt = new Date().toISOString();
const file = `// AUTO-GENERADO por scripts/generate-content.mjs — no editar a mano.
// Recorre todos los .java del curso, los cataloga y captura su salida real de consola.
import type { JavaFile } from './vault';

export const javaFiles: JavaFile[] = ${serialized};

export const vaultGeneratedAt = '${generatedAt}';
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, file, 'utf8');

const totalLoc = entries.reduce((a, e) => a + e.loc, 0);
console.log(`[codegen] ${entries.length} archivos · ${totalLoc} líneas · salida capturada en ${entries.filter((e) => e.output !== null).length}`);
console.log(`[codegen] JDK: ${JDK_OK ? 'ok' : 'NO DISPONIBLE (salidas sin captura)'}`);
console.log(`[codegen] escrito: ${OUT}`);
