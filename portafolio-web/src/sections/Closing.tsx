import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Blocks,
  Boxes,
  Container,
  Database,
  Github,
  Linkedin,
  Mail,
  MonitorSmartphone,
  Send,
  Server,
  TerminalSquare,
  Workflow,
} from 'lucide-react';
import { GlassCard, MagneticButton, Orb, Reveal, SectionHeading } from '../components/ui';
import { liveProjects } from '../data/projects';
import { javaFiles } from '../data/javaVault.generated';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion';
import { profile } from '../data/profile';

/* ================================================================
   ARQUITECTURA — atmósfera azul
   ================================================================ */
const CAPAS = [
  {
    icon: <MonitorSmartphone size={18} />,
    nombre: 'Capa de Presentación',
    tech: 'JSP · Servlets · CSS',
    rol: 'Formularios, listados y controladores HTTP. Nunca escribe SQL.',
  },
  {
    icon: <Workflow size={18} />,
    nombre: 'Capa de Negocio',
    tech: 'Servicios · Reglas · Excepciones',
    rol: 'Lleva las reglas del dominio: validaciones, estados y casos de uso.',
  },
  {
    icon: <Database size={18} />,
    nombre: 'Capa de Datos',
    tech: 'DAO · JDBC · HikariCP',
    rol: 'SQL y consultas. No conoce nada de la interfaz ni del negocio.',
  },
];

export function Architecture() {
  return (
    <section id="arquitectura" data-atmo="blue" className="relative mx-auto w-[min(94vw,1150px)] px-4 py-28 md:py-36">
      <Orb className="left-[8%] top-[10%] h-64 w-64" color="rgba(34,211,238,0.14)" />

      <SectionHeading
        overline="05 · Bajo el capó"
        title="Un patrón que"
        accent="se repite."
        subtitle="Todos los sistemas de este portafolio comparten la misma columna vertebral: tres capas desacopladas, servidas en contenedores con arranque automático."
      />

      <div className="relative mt-16 grid gap-5 md:grid-cols-3">
        {/* línea conectora */}
        <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-[72px] hidden h-px md:block" style={{ background: 'linear-gradient(90deg, transparent, rgb(45 212 191 / 0.35), transparent)' }} />
        {CAPAS.map((c, i) => (
          <Reveal key={c.nombre} delay={i * 0.14}>
            <GlassCard className="group relative h-full p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-agua-500/20 to-turquesa-500/10 text-agua-300">{c.icon}</span>
                <div>
                  <p className="font-display text-sm font-semibold text-niebla-100">{c.nombre}</p>
                  <p className="text-[0.68rem] text-turquesa-300/80">{c.tech}</p>
                </div>
              </div>
              <p className="mt-4 text-[0.8rem] leading-relaxed text-niebla-500">{c.rol}</p>
              {i < CAPAS.length - 1 && (
                <ArrowRight className="absolute -right-3.5 top-1/2 hidden h-5 w-5 text-agua-300/60 md:block" />
              )}
            </GlassCard>
          </Reveal>
        ))}
      </div>

      {/* infraestructura */}
      <Reveal delay={0.2} className="mt-10">
        <GlassCard className="flex flex-wrap items-center gap-x-10 gap-y-4 p-6" tilt={false}>
          <span className="chip">infraestructura</span>
          {[
            { icon: <Container size={15} />, t: '7 contenedores activos' },
            { icon: <TerminalSquare size={15} />, t: 'arranque automático al encender' },
            { icon: <Server size={15} />, t: 'Tomcat 10.1 · HttpServer JDK' },
            { icon: <Database size={15} />, t: 'MariaDB 11 con datos demo' },
          ].map((s) => (
            <span key={s.t} className="flex items-center gap-2.5 text-[0.78rem] text-niebla-300">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-agua-500/10 text-agua-300">{s.icon}</span>
              {s.t}
            </span>
          ))}
        </GlassCard>
      </Reveal>
    </section>
  );
}

/* ================================================================
   ESTADÍSTICAS con contadores ScrollTrigger
   ================================================================ */
function Counter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(value);
      ScrollTrigger.refresh();
      return;
    }
    const obj = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: value,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
            ScrollTrigger.refresh();
          },
        });
      },
    });
    return () => st.kill();
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span ref={ref} className="font-display text-5xl font-bold tabular-nums text-gradient md:text-6xl">
        0{suffix}
      </span>
      <span className="max-w-[180px] text-[0.72rem] leading-relaxed tracking-wide text-niebla-500">{label}</span>
    </div>
  );
}

export function Stats() {
  const totalLoc = javaFiles.reduce((a, f) => a + f.loc, 0);
  const items = [
    { value: javaFiles.length, label: 'programas Java publicados con su código' },
    { value: liveProjects.length, label: 'aplicaciones corriendo en Docker ahora mismo' },
    { value: totalLoc, label: 'líneas de código listas para copiar y ejecutar' },
    { value: 7, label: 'contenedores sosteniendo toda la demostración' },
  ];
  return (
    <section id="estadisticas" data-atmo="blue" className="relative mx-auto w-[min(92vw,1050px)] px-4 pb-28 md:pb-36">
      <div className="glass-strong grid grid-cols-2 gap-x-6 gap-y-10 p-10 md:grid-cols-4 md:p-14">
        {items.map((it) => (
          <Counter key={it.label} value={it.value} label={it.label} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   STACK — marquee de tecnologías
   ================================================================ */
const TECS = [
  'React', 'TypeScript', 'Three.js', 'React Three Fiber', 'GSAP', 'ScrollTrigger',
  'Framer Motion', 'Tailwind CSS', 'Lenis', 'Java', 'JSP · Servlets', 'JDBC',
  'MariaDB', 'MySQL', 'Docker', 'Compose', 'Tomcat 10.1', 'Maven', 'Postman',
  'Hilos · Concurrency', 'HttpServer JDK', 'NetBeans', 'HikariCP', 'Git',
];

export function StackSection() {
  return (
    <section id="stack" data-atmo="emerald" className="relative overflow-hidden py-28 md:py-36">
      <SectionHeading
        overline="06 · Herramientas"
        title="Stack"
        accent="completo."
        subtitle="Del HttpServer puro de Java hasta una escena WebGL: el mismo criterio de diseño guiando la infraestructura y la interfaz."
      />
      <div className="mt-14 flex flex-col gap-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        {[TECS.slice(0, 12), TECS.slice(12)].map((row, ri) => (
          <div key={ri} className="overflow-hidden py-1">
            <div className="marquee-track flex w-max gap-4">
              {[...row, ...row].map((t, i) => (
                <span
                  key={i}
                  className="glass flex items-center gap-2.5 whitespace-nowrap px-6 py-3.5 font-display text-sm font-medium text-niebla-200"
                  style={{ borderRadius: '1rem' }}
                >
                  <Boxes size={14} className="text-agua-300/70" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   CONTACTO + FOOTER
   ================================================================ */
export function Contact() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [sent, setSent] = useState(false);
  const github = profile.socials.find((s) => s.label === 'GitHub');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portafolio — contacto de ${form.nombre || 'un visitante'}`);
    const body = encodeURIComponent(`Nombre: ${form.nombre}\nEmail: ${form.email}\n\n${form.mensaje}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 3200);
  };

  return (
    <section id="contacto" data-atmo="emerald" className="relative mx-auto w-[min(92vw,1120px)] px-4 py-28 md:py-36">
      <Orb className="right-[12%] bottom-[10%] h-72 w-72" color="rgba(16,185,129,0.22)" />

      <SectionHeading
        overline="07 · Contacto"
        title="Construyamos"
        accent="algo juntos."
        subtitle={
          profile.email
            ? '¿Idea de proyecto, pasantía o colaboración? Escríbeme y reviso el caso la misma semana.'
            : '¿Idea de proyecto, pasantía o colaboración? Escríbeme por GitHub y reviso el caso la misma semana.'
        }
      />

      <div className="mt-14 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="flex h-full flex-col gap-5">
            {profile.email && (
              <GlassCard className="flex items-center gap-4 p-5" tilt={false}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-agua-500/12 text-agua-300"><Mail size={17} /></span>
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-niebla-500">correo</p>
                  <a href={`mailto:${profile.email}`} className="font-display text-sm font-semibold text-niebla-100 transition hover:text-agua-300">{profile.email}</a>
                </div>
              </GlassCard>
            )}
            {profile.socials.map((s) => (
              <GlassCard key={s.label} className="flex items-center gap-4 p-5" tilt={false}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-agua-500/12 text-agua-300">
                  {s.label === 'GitHub' ? <Github size={17} /> : <Linkedin size={17} />}
                </span>
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-niebla-500">{s.label}</p>
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-display text-sm font-semibold text-niebla-100 transition hover:text-agua-300">{s.handle}</a>
                </div>
              </GlassCard>
            ))}
            <p className="flex items-center gap-2 px-1 text-[0.72rem] text-niebla-500">
              <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-agua-400 opacity-60" /><span className="relative h-2 w-2 rounded-full bg-agua-400" /></span>
              {profile.disponibilidad}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <GlassCard className="h-full p-7 md:p-9" tilt={false}>
            {profile.email ? (
              <form onSubmit={submit} className="flex h-full flex-col gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
                  <Field label="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                </div>
                <Field label="mensaje" isArea value={form.mensaje} onChange={(v) => setForm({ ...form, mensaje: v })} required />
                <div className="mt-auto flex items-center gap-4">
                  <MagneticButton type="submit">
                    <Send size={15} /> Enviar mensaje
                  </MagneticButton>
                  {sent && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[0.72rem] text-agua-300">
                      Se abrió tu cliente de correo ✓
                    </motion.span>
                  )}
                </div>
              </form>
            ) : (
              <div className="flex h-full flex-col items-start justify-center gap-4">
                <p className="text-sm leading-relaxed text-niebla-300">
                  ¿Idea de proyecto, pasantía o colaboración? Escríbeme por GitHub y reviso el caso la misma semana.
                </p>
                {github && (
                  <a
                    href={github.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-agua-500/90 to-turquesa-400/90 px-5 py-2.5 text-xs font-semibold text-tinta-900 transition hover:brightness-110"
                  >
                    <Github size={15} /> Abrir GitHub
                  </a>
                )}
                <p className="text-[0.72rem] text-niebla-500">Respondo por GitHub en 1–2 días.</p>
              </div>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  isArea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  isArea?: boolean;
}) {
  const cls =
    'glass w-full bg-transparent px-4 py-3 text-sm text-niebla-100 outline-none transition-colors placeholder:text-niebla-500/50 focus:border-agua-300/60';
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.62rem] uppercase tracking-[0.22em] text-niebla-500">{label}</span>
      {isArea ? (
        <textarea required={required} rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Cuéntame de tu idea…" className={`${cls} resize-none`} />
      ) : (
        <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-agua-300/10 py-8">
      <div className="mx-auto flex w-[min(92vw,1120px)] flex-wrap items-center justify-center gap-4 px-4 text-[0.7rem] text-niebla-500">
        <p className="flex items-center gap-2">
          <Blocks size={13} className="text-agua-300/70" />
          {profile.nombre} · {profile.universidad}
        </p>
      </div>
    </footer>
  );
}
