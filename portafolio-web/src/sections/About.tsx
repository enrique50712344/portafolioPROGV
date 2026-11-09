import { motion } from 'framer-motion';
import {
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  ServerCog,
  Layers,
  Boxes,
} from 'lucide-react';
import { GlassCard, Orb, Reveal, SectionHeading } from '../components/ui';
import { profile } from '../data/profile';

export default function About() {
  return (
    <section id="sobremi" data-atmo="emerald" className="relative mx-auto w-[min(92vw,1150px)] px-4 py-28 md:py-36">
      <Orb className="right-[4%] top-[6%] h-56 w-56" color="rgba(45,212,191,0.2)" size={230} />

      <SectionHeading
        overline="02 · Sobre mí"
        title="Diseño, construyo,"
        accent="despliego."
        subtitle="Ingeniería en capas de la vida real: de la base de datos hasta la interfaz. Cada proyecto que ves aquí corre en mi propia infraestructura Docker local, listo para demostrarse."
      />

      <div className="mt-16 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
        {/* tarjeta principal */}
        <Reveal>
          <GlassCard className="flex h-full flex-col gap-6 p-8 md:p-10" tilt={false}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* monograma */}
                <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-agua-500 via-agua-600 to-tinta-600 font-display text-xl font-bold text-tinta-900 shadow-[var(--shadow-glow)]">
                  {profile.iniciales}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-tl from-transparent via-turquesa-400/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-niebla-100">{profile.nombre}</p>
                  <p className="text-xs text-niebla-500">{profile.disponibilidad}</p>
                </div>
              </div>
              <Sparkles size={20} className="text-agua-300/60" />
            </div>

            <p className="text-sm leading-relaxed text-niebla-300 md:text-[0.95rem]">{profile.bio}</p>

            <div className="grid gap-2.5 text-sm">
              <InfoRow icon={<GraduationCap size={15} />} label={profile.universidad} />
              <InfoRow icon={<Layers size={15} />} label={profile.curso} />
              <InfoRow icon={<CurrencyIconFallback />} label="Programación orientada a capas · Cliente-servidor · POO" />
              {profile.email && (
                <InfoRow icon={<Mail size={15} />} label={profile.email} href={`mailto:${profile.email}`} />
              )}
              {profile.telefono && <InfoRow icon={<Phone size={15} />} label={profile.telefono} />}
              <InfoRow icon={<MapPin size={15} />} label={profile.ubicacion} />
            </div>

            <div className="mt-auto flex gap-3 pt-2">
              {profile.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-agua-300/20 px-4 py-2 text-xs text-niebla-300 transition-all duration-300 hover:border-agua-300/50 hover:bg-agua-500/10 hover:text-niebla-100"
                >
                  {s.label} · {s.handle}
                </a>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        {/* enfoque */}
        <div className="grid gap-6">
          {[
            {
              icon: <Layers size={20} />,
              t: 'Arquitectura en 3 capas',
              d: 'Presentación → Negocio → Datos. Servlets que nunca tocan SQL, DAOs que nunca inventan reglas.',
            },
            {
              icon: <ServerCog size={20} />,
              t: 'Servicios concurrentes',
              d: 'Servidores HTTP con el JDK puro, hilos y pools, pruebas de carga con clientes propios.',
            },
            {
              icon: <Boxes size={20} />,
              t: 'Infraestructura reproducible',
              d: 'Todo lo que subo aquí corre en contenedores con arranque automático: la demo nunca se apaga.',
            },
          ].map((c, i) => (
            <Reveal key={c.t} delay={0.12 + i * 0.12}>
              <GlassCard className="group flex items-start gap-5 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-agua-500/10 text-agua-300 transition-colors duration-500 group-hover:bg-agua-400/20 group-hover:text-turquesa-300">
                  {c.icon}
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-niebla-100">{c.t}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-niebla-500 md:text-[0.82rem]">{c.d}</p>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const item = (
    <span className="flex items-center gap-3 text-[0.8rem] text-niebla-300 md:text-sm">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-agua-500/8 text-agua-300">{icon}</span>
      {label}
    </span>
  );
  return href ? (
    <a href={href} className="transition-colors hover:text-agua-200">
      {item}
    </a>
  ) : (
    item
  );
}

function CurrencyIconFallback() {
  return <GraduationCap size={15} />;
}
