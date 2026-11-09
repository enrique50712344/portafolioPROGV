import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Boxes,
  Copy,
  Check,
  Eye,
  ExternalLink,
  Globe,
  KeyRound,
  Play,
  Radio,
  ServerCrash,
  Terminal,
  X,
} from 'lucide-react';
import { GlassCard, MagneticButton, Orb, Reveal, SectionHeading, StatusDot } from '../components/ui';
import { liveProjects } from '../data/projects';
import type { LiveProject } from '../data/types';
import { isLocalHost, useProbe } from '../hooks/useMotion';

const shotSrc = (project: LiveProject) =>
  project.shot ? `${import.meta.env.BASE_URL}${project.shot}` : '';

/* ================================================================
   Vista previa de JSON en vivo para tarjetas de API
   ================================================================ */
function ApiPeek({ project }: { project: LiveProject }) {
  const local = isLocalHost();
  const [text, setText] = useState(
    local
      ? '● esperando primera lectura…'
      : `// demo local — el servidor corre en tu PC\n// ${project.urlExterna}`,
  );
  const state = useProbe(project.urlProbe, 15000, local);

  useEffect(() => {
    if (!local) return;

    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${project.urlConsola}${project.endpoints![0].ruta}`, { cache: 'no-store' });
        const raw = await res.text();
        if (!alive) return;
        let pretty = raw;
        try {
          pretty = JSON.stringify(JSON.parse(raw), null, 1);
        } catch {
          /* respuesta no JSON */
        }
        setText(pretty.slice(0, 340) + (pretty.length > 340 ? '\n…' : ''));
      } catch {
        setText('// servidor sin respuesta — enciéndelo con docker');
      }
    };
    load();
    const id = window.setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [project, local]);

  return (
    <div className="relative h-44 overflow-hidden rounded-xl border border-agua-300/12 bg-tinta-800/70 p-4">
      <div className="mb-2.5 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.22em] text-agua-300/80">
        <Radio size={11} className={state === 'up' ? 'animate-pulse' : ''} />
        puerto {project.puerto} · {local ? 'json en vivo' : 'demo local'}
      </div>
      <pre className="whitespace-pre-wrap break-all font-mono text-[0.66rem] leading-relaxed text-agua-200/75">{text}</pre>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-tinta-900/90 to-transparent" />
    </div>
  );
}

/* ================================================================
   Captura para apps web (shot real en /shots)
   ================================================================ */
function ShotCover({ project }: { project: LiveProject }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-44 overflow-hidden rounded-xl border border-agua-300/12 bg-tinta-800/70">
      {/* barra de navegador */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        {['bg-rose-400/70', 'bg-amber-300/70', 'bg-agua-400/70'].map((c, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${c}`} />
        ))}
        <span className="ml-2 truncate rounded-md bg-agua-500/10 px-2 py-0.5 font-mono text-[0.6rem] text-agua-200/80">
          localhost:{project.puerto}
        </span>
      </div>
      <div className="relative h-[calc(100%-2.1rem)] overflow-hidden">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-agua-500/8" />}
        <img
          src={shotSrc(project)}
          alt={`${project.nombre} — vista de la aplicación`}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover object-top transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0 scale-[1.04]'}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tinta-900/60 via-transparent to-transparent" />
      </div>
    </div>
  );
}

/* ================================================================
   Consola de API en vivo (mismo origen vía proxy nginx)
   ================================================================ */
function ApiConsole({ project }: { project: LiveProject }) {
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<{ code: number; ms: number; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const local = isLocalHost();

  if (!local) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-amber-300/15 bg-amber-400/5 p-6 text-center">
        <ServerCrash size={26} className="text-amber-300/80" />
        <p className="font-display text-sm font-semibold text-niebla-100">Demo local</p>
        <p className="max-w-md text-xs leading-relaxed text-niebla-400">
          Esta consola consulta la API Java en <span className="font-mono text-agua-200">localhost:{project.puerto}</span>.
          En la versión publicada no hay servidor disponible; clona el repositorio y ejecútalo con Docker para probarla.
        </p>
        <a
          href={project.urlExterna}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-agua-300/25 px-4 py-2 text-xs text-niebla-100 transition hover:border-agua-300/60 hover:bg-agua-500/10"
        >
          Ver ruta local <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  const ep = project.endpoints![sel];

  const run = async () => {
    setBusy(true);
    setResp(null);
    const t0 = performance.now();
    try {
      const res = await fetch(`${project.urlConsola}${ep.ruta}`, {
        cache: 'no-store',
        headers: apiKey.trim() ? { 'X-API-KEY': apiKey.trim() } : undefined,
      });
      const body = await res.text();
      let pretty = body;
      try {
        pretty = JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        /* json inválido */
      }
      setResp({ code: res.status, ms: Math.round(performance.now() - t0), body: pretty.slice(0, 6000) });
    } catch {
      setResp({
        code: 0,
        ms: Math.round(performance.now() - t0),
        body: '// El servidor no responde.\n// ¿Está el contenedor encendido?  docker start <nombre>',
      });
    }
    setBusy(false);
  };

  const codeColor = !resp ? '' : resp.code >= 200 && resp.code < 300 ? 'text-agua-300' : resp.code === 0 ? 'text-rose-300' : 'text-amber-300';

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {project.endpoints!.map((e, i) => (
          <button
            key={e.ruta}
            onClick={() => setSel(i)}
            className={`rounded-lg border px-2.5 py-1 font-mono text-[0.68rem] transition-colors ${
              i === sel
                ? 'border-agua-400/50 bg-agua-500/15 text-agua-200'
                : 'border-agua-300/12 text-niebla-500 hover:border-agua-300/35 hover:text-niebla-300'
            }`}
          >
            <span className="mr-1.5 font-semibold text-turquesa-300">{e.metodo}</span>
            {e.ruta}
          </button>
        ))}
      </div>

      {/* barra de ejecución */}
      <div className="flex items-center gap-2 rounded-lg border border-agua-300/12 bg-tinta-800/60 px-3 py-2">
        <span className="font-mono text-[0.68rem] text-niebla-500">
          GET <span className="text-agua-200">localhost:8083{project.urlConsola}{ep.ruta}</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          {project.id === 'reservas-api' && (
            <div className="hidden items-center gap-1.5 rounded-md border border-agua-300/15 px-2 py-1 md:flex">
              <KeyRound size={11} className="text-amber-300/80" />
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="X-API-KEY…"
                className="w-36 bg-transparent font-mono text-[0.66rem] text-niebla-100 outline-none placeholder:text-niebla-500/60"
              />
            </div>
          )}
          <MagneticButton className="!px-4 !py-1.5 text-xs" onClick={run}>
            {busy ? <Terminal size={13} className="animate-pulse" /> : <Play size={13} />}
            <span className="truncate">{busy ? 'ejecutando' : 'Probar'}</span>
          </MagneticButton>
        </div>
      </div>
      <p className="text-[0.68rem] text-niebla-500">{ep.desc}</p>

      {/* respuesta */}
      <div className="relative min-h-40 flex-1 overflow-auto rounded-lg border border-agua-300/12 bg-tinta-800/80">
        {resp && (
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-agua-300/10 bg-tinta-800/95 px-3 py-1.5 backdrop-blur">
            <span className={`font-mono text-[0.66rem] font-semibold ${codeColor}`}>
              {resp.code === 0 ? 'SIN RESPUESTA' : resp.code}
            </span>
            <span className="font-mono text-[0.62rem] text-niebla-500">{resp.ms} ms</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(resp.body);
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              }}
              className="ml-auto text-niebla-500 transition-colors hover:text-agua-300"
              aria-label="Copiar respuesta"
            >
              {copied ? <Check size={13} className="text-agua-300" /> : <Copy size={13} />}
            </button>
          </div>
        )}
        {!resp && !busy && (
          <div className="flex h-36 flex-col items-center justify-center gap-2 text-niebla-500">
            <Terminal size={18} className="opacity-50" />
            <span className="text-[0.7rem]">Pulsa “Probar” para obtener una respuesta real</span>
          </div>
        )}
        {resp && (
          <pre className="whitespace-pre-wrap break-all p-4 font-mono text-[0.7rem] leading-relaxed text-agua-200/85">{resp.body}</pre>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Modal de proyecto
   ================================================================ */
function ProjectModal({ project, onClose }: { project: LiveProject; onClose: () => void }) {
  const [tab, setTab] = useState<'vivo' | 'detalles'>('vivo');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const local = isLocalHost();

  return (
    <motion.div
      className="fixed inset-0 z-[170] flex items-center justify-center p-3 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-tinta-900/75 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: 46, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden"
      >
        {/* cabecera */}
        <div className="flex items-center gap-3 border-b border-agua-300/12 px-5 py-3.5">
          <Boxes size={16} className="text-agua-300" />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-niebla-100">{project.nombre}</p>
            <p className="truncate text-[0.68rem] text-niebla-500">
              {project.categoria} · puerto {project.puerto}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={project.urlExterna}
              target="_blank"
              rel="noreferrer"
              title={local ? undefined : 'Requiere ejecutar la demo en tu PC'}
              className="flex items-center gap-1.5 rounded-full border border-agua-300/25 px-3.5 py-1.5 text-xs text-niebla-100 transition hover:border-agua-300/60 hover:bg-agua-500/10"
            >
              {local ? 'Abrir' : 'Abrir local'} <ExternalLink size={12} />
            </a>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-agua-300/20 text-niebla-300 transition hover:text-niebla-100" aria-label="Cerrar">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-2 px-5 pt-3">
          {(['vivo', 'detalles'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-xl px-3.5 py-1.5 text-xs font-medium ${tab === t ? 'text-tinta-900' : 'text-niebla-300 hover:text-niebla-100'}`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {t === 'vivo' ? <Globe size={12} /> : <Eye size={12} />}
                {t === 'vivo' ? 'Vista en vivo' : 'Detalles'}
              </span>
              {tab === t && (
                <motion.span layoutId="modal-tab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-agua-400 to-turquesa-400" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
              )}
            </button>
          ))}
        </div>

        {/* contenido */}
        <div className="min-h-0 flex-1 overflow-hidden p-5">
          <AnimatePresence mode="wait">
            {tab === 'vivo' ? (
              <motion.div key="vivo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="h-full">
                {project.tipo === 'web' ? (
                  <div className="relative h-full overflow-hidden rounded-xl border border-agua-300/15 bg-tinta-800">
                    {local ? (
                      <iframe
                        src={project.urlIframe}
                        title={`Vista en vivo de ${project.nombre}`}
                        className="h-full w-full bg-white"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative h-full">
                        <img
                          src={shotSrc(project)}
                          alt={`${project.nombre} — captura de la aplicación`}
                          className="h-full w-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-tinta-900/95 via-tinta-900/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-amber-300/90">
                            <ServerCrash size={13} /> demo local
                          </p>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-niebla-300">
                            Esta aplicación corre en Docker en la PC del autor. La captura es real; para usarla en vivo,
                            clona el repositorio y ejecuta el contenedor.
                          </p>
                        </div>
                      </div>
                    )}
                    {local && project.credencialesDemo && (
                      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-agua-300/25 bg-tinta-900/85 px-4 py-1.5 text-[0.68rem] text-niebla-300 backdrop-blur">
                        Demo: <b className="text-agua-300">{project.credencialesDemo.usuario}</b> / {project.credencialesDemo.clave}
                      </div>
                    )}
                  </div>
                ) : (
                  <ApiConsole project={project} />
                )}
              </motion.div>
            ) : (
              <motion.div key="det" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="scrollbar-auto h-full overflow-auto pr-2">
                <p className="text-sm leading-relaxed text-niebla-300">{project.descripcion}</p>
                <p className="mt-5 text-[0.68rem] uppercase tracking-[0.24em] text-agua-300/80">Características</p>
                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                  {project.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[0.8rem] text-niebla-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-agua-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <span key={s} className="chip !normal-case !tracking-normal !text-[0.72rem]">{s}</span>
                  ))}
                </div>
                {project.coleccionPostman && (
                  <p className="mt-4 flex items-center gap-2 text-[0.72rem] text-niebla-500">
                    <Terminal size={12} /> Incluye <b className="text-niebla-300">{project.coleccionPostman}</b> para probar cada caso.
                  </p>
                )}
                {project.tipo === 'api' && (
                  <p className="mt-6 flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-400/5 p-3 text-[0.72rem] leading-relaxed text-amber-200/80">
                    <ServerCrash size={14} className="mt-0.5 shrink-0 text-amber-300/80" />
                    {local ? (
                      <>
                        Las APIs escuchan solo en esta PC (localhost:{project.puerto}). El portafolio las consulta a través de un
                        proxy interno, así que funcionan igual desde el navegador que desde Postman.
                      </>
                    ) : (
                      <>
                        Estas APIs corren en local (localhost:{project.puerto}). En la versión publicada no hay servidor
                        disponible; clona el repositorio y ejecútalo con Docker para probarlas.
                      </>
                    )}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================
   Tarjeta
   ================================================================ */
function ProjectCard({ project, onPreview, index }: { project: LiveProject; onPreview: () => void; index: number }) {
  return (
    <Reveal delay={(index % 2) * 0.12}>
      <GlassCard className="flex h-full flex-col gap-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="chip !text-[0.66rem]">{project.categoria}</span>
          </div>
          <StatusDot url={project.urlProbe} label={project.puerto} />
        </div>

        {project.shot ? <ShotCover project={project} /> : <ApiPeek project={project} />}

        <div>
          <h3 className="font-display text-lg font-semibold text-niebla-100">{project.nombre}</h3>
          <p className="mt-1 text-xs text-niebla-500">{project.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((s) => (
            <span key={s} className="rounded-md border border-agua-300/12 bg-agua-500/5 px-2 py-0.5 text-[0.64rem] text-niebla-300">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex gap-2.5 pt-1">
          <button
            onClick={onPreview}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-agua-500/90 to-turquesa-400/90 px-4 py-2.5 text-xs font-semibold text-tinta-900 transition hover:brightness-110"
          >
            <Eye size={14} /> Vista en vivo
          </button>
          <a
            href={project.urlExterna}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-agua-300/25 px-4 py-2.5 text-xs text-niebla-100 transition hover:border-agua-300/60 hover:bg-agua-500/10"
          >
            Abrir <ArrowUpRight size={13} />
          </a>
        </div>
      </GlassCard>
    </Reveal>
  );
}

/* ================================================================
   Sección
   ================================================================ */
export default function LiveApps() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => liveProjects.find((p) => p.id === openId) ?? null, [openId]);
  const local = isLocalHost();

  return (
    <section id="apps" data-atmo="emerald" className="relative mx-auto w-[min(94vw,1200px)] px-4 py-28 md:py-36">
      <Orb className="left-[2%] bottom-[8%] h-64 w-64" color="rgba(16,185,129,0.18)" />

      <SectionHeading
        overline="03 · Sistemas en ejecución"
        title="Aplicaciones"
        accent="vivas."
        subtitle={
          local
            ? 'No son capturas: están corriendo ahora mismo en esta PC, sobre Docker, con arranque automático. Ábrelas, úsalas y pruébalas.'
            : 'Estas aplicaciones corren en local sobre Docker. En esta versión publicada puedes ver capturas reales y el código; clona el repositorio para probarlas en vivo.'
        }
      />

      <Reveal delay={0.2} className="mt-8 flex justify-center">
        <span className="flex items-center gap-2 text-[0.7rem] text-niebla-500">
          <Radio size={12} className="text-agua-300" />
          {local ? 'estado medido en tiempo real desde el navegador' : 'demos locales · capturas reales'}
        </span>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {liveProjects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} onPreview={() => setOpenId(p.id)} />
        ))}
      </div>

      <AnimatePresence>{open && <ProjectModal project={open} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </section>
  );
}
