import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, FolderKanban, Code2 } from 'lucide-react';
import Scene3D from '../components/Scene3D';
import { MagneticButton } from '../components/ui';
import { gsap, prefersReducedMotion, scrollToSection } from '../lib/motion';
import { profile } from '../data/profile';
import { javaFiles } from '../data/javaVault.generated';
import { liveProjects } from '../data/projects';

const liveProjectsCount = liveProjects.length;

function KineticName({ started }: { started: boolean }) {
  const name = profile.nombre;
  const words = useMemo(() => name.toUpperCase().split(' '), []);

  useEffect(() => {
    if (!started) return;
    const chars = document.querySelectorAll<HTMLElement>('.hero-char');
    if (prefersReducedMotion()) {
      gsap.set(chars, { yPercent: 0, opacity: 1 });
      return;
    }
    gsap
      .timeline()
      .fromTo(
        chars,
        { yPercent: 118, rotate: 7, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 1.0, stagger: 0.03, ease: 'power4.out' },
      )
      .fromTo(
        '.hero-fade',
        { y: 28, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, stagger: 0.12, ease: 'power3.out' },
        '-=0.55',
      );
  }, [started]);

  return (
    <h1 className="font-display text-[13.5vw] leading-[0.95] font-bold tracking-tight text-niebla-100 md:text-[7.6rem]">
      {words.map((word, wi) => (
        <span key={wi} className="k-line mr-[0.22em]">
          {word.split('').map((ch, ci) => (
            <span key={ci} className={`k-char hero-char ${wi === 1 ? 'text-gradient' : ''}`} style={{ opacity: 0 }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

function RoleCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((p) => (p + 1) % profile.rolesRotativos.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex items-baseline overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: '110%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-110%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="serif-accent text-2xl text-gradient md:text-3xl whitespace-nowrap"
        >
          {profile.rolesRotativos[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero({ started }: { started: boolean }) {
  return (
    <section id="inicio" data-atmo="emerald" className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* escena 3D */}
      <div className="absolute inset-0 z-0 opacity-80 md:opacity-100">
        <Scene3D />
      </div>

      {/* vel de legibilidad */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-tinta-900/70 via-transparent to-tinta-900/40" />

      <div className="relative z-[2] mx-auto w-[min(92vw,1150px)] px-4 pt-28 pb-24">
        <div className="hero-fade" style={{ opacity: 0 }}>
          <span className="chip">{profile.rolOverline}</span>
        </div>

        <div className="mt-6">
          <KineticName started={started} />
        </div>

        <div className="hero-fade mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 text-niebla-300" style={{ opacity: 0 }}>
          <span className="text-base md:text-lg">Soy {profile.nombre.split(' ')[0]} —</span>
          <RoleCarousel />
        </div>

        <p className="hero-fade mt-7 max-w-xl text-sm leading-relaxed text-niebla-500 md:text-base" style={{ opacity: 0 }}>
          {profile.bio}
        </p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-4" style={{ opacity: 0 }}>
          <MagneticButton onClick={() => scrollToSection('#apps')}>
            <FolderKanban size={17} /> Explorar apps en vivo
          </MagneticButton>
          <MagneticButton variant="ghost" onClick={() => scrollToSection('#codigo')}>
            <Code2 size={17} /> Ver mi código Java
          </MagneticButton>
        </div>

        {/* mini estadísticas */}
        <div className="hero-fade mt-14 flex flex-wrap gap-x-12 gap-y-5" style={{ opacity: 0 }}>
          {[
            [`${javaFiles.length}+`, 'programas Java publicados'],
            [`${liveProjectsCount}`, 'apps corriendo en Docker'],
            ['100%', 'código propio en producción local'],
          ].map(([n, l]) => (
            <div key={l} className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-bold text-gradient md:text-3xl">{n}</span>
              <span className="text-xs text-niebla-500 md:text-sm">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* scroll cue */}
      <button
        onClick={() => scrollToSection('#sobremi')}
        className="hero-fade absolute bottom-7 left-1/2 z-[2] -translate-x-1/2 flex flex-col items-center gap-2 text-niebla-500 transition-colors hover:text-agua-300"
        style={{ opacity: 0 }}
        aria-label="Ir a la siguiente sección"
      >
        <span className="text-[0.62rem] uppercase tracking-[0.3em]">scroll</span>
        <span className="grid h-9 w-5 place-items-start justify-center rounded-full border border-agua-300/30 pt-1.5">
          <span className="cue-dot block h-1.5 w-1.5 rounded-full bg-agua-400" />
        </span>
        <ArrowDown size={12} className="opacity-60" />
      </button>
    </section>
  );
}
