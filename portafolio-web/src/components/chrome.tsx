import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { profile } from '../data/profile';
import { scrollToSection } from '../lib/motion';

/* ================= Cursor personalizado ================= */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('hide-native-cursor');

    let rx = window.innerWidth / 2;
    let ry = window.innerHeight / 2;
    let tx = rx;
    let ty = ry;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate(${tx}px, ${ty}px)`;
        dot.current.style.opacity = '1';
      }
      if (ring.current) ring.current.style.opacity = '1';
      const t = (e.target as HTMLElement)?.closest('a,button,input,textarea,[data-cursor]');
      setHovering(!!t);
    };
    const loop = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.documentElement.classList.remove('hide-native-cursor');
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[999] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-agua-300 opacity-0"
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[998] -ml-6 -mt-6 h-12 w-12 rounded-full border border-agua-300/50 opacity-0 transition-[width,height,margin] duration-300"
        style={{
          marginTop: hovering ? '-16px' : '-24px',
          marginLeft: hovering ? '-16px' : '-24px',
          height: hovering ? 32 : 48,
          width: hovering ? 32 : 48,
          backgroundColor: hovering ? 'rgb(45 212 191 / 0.08)' : 'transparent',
        }}
      />
    </>
  );
}

/* ================= Preloader ================= */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = 100;
    const start = performance.now();
    const dur = reduced ? 120 : 1500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      // easing exponencial
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setGone(true);
          onDone();
        }, reduced ? 50 : 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-tinta-900"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="glass-strong px-10 py-8 flex flex-col items-center gap-4 min-w-[280px]">
            <span className="chip">cargando experiencia</span>
            <div className="font-display text-6xl font-bold text-gradient tabular-nums">
              {pct}
              <span className="text-2xl">%</span>
            </div>
            <div className="h-px w-full max-w-[220px] bg-agua-500/20">
              <div
                className="h-px bg-gradient-to-r from-agua-500 to-turquesa-400 transition-[width] duration-150"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[0.65rem] tracking-[0.3em] uppercase text-niebla-500">
              enrique lópez · 2026-II
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= Fondo atmosférico ================= */
export function Atmosphere() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  return (
    <>
      {/* fondo */}
      <div className="fixed inset-0 -z-20 overflow-hidden" data-atmo-root>
        {/* capa esmeralda/turquesa */}
        <div
          className="layer-emerald absolute inset-0"
          style={{ background: 'radial-gradient(1200px 700px at 18% -8%, rgb(16 185 129 / 0.22), transparent 60%), radial-gradient(1000px 640px at 88% 12%, rgb(45 212 191 / 0.16), transparent 55%), radial-gradient(900px 600px at 50% 110%, rgb(4 120 87 / 0.2), transparent 60%)' }}
        />
        {/* capa azul profunda (cruce de atmosfera) */}
        <div
          className="layer-blue absolute inset-0"
          style={{ background: 'radial-gradient(1200px 760px at 15% 0%, rgb(10 37 64 / 0.55), transparent 60%), radial-gradient(1000px 700px at 92% 30%, rgb(34 211 238 / 0.12), transparent 55%), radial-gradient(900px 680px at 50% 115%, rgb(7 26 43 / 0.9), transparent 65%)' }}
        />
        {/* grano */}
        <div className="noise absolute inset-0 opacity-[0.055]" />
      </div>

      {/* orbes flotantes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="orb orb-a left-[8%] top-[16%] h-72 w-72" style={{ background: 'radial-gradient(circle at 35% 30%, rgb(16 185 129 / 0.28), transparent 70%)' }} />
        <div className="orb orb-b right-[10%] top-[52%] h-80 w-80" style={{ background: 'radial-gradient(circle at 40% 35%, rgb(34 211 238 / 0.16), transparent 70%)' }} />
        <div className="orb orb-a right-[26%] top-[78%] h-64 w-64" style={{ background: 'radial-gradient(circle at 30% 30%, rgb(4 120 87 / 0.3), transparent 70%)' }} />
      </div>

      {/* barra de progreso */}
      <motion.div
        className="fixed left-0 top-0 z-[150] h-[2px] w-full origin-left bg-gradient-to-r from-agua-500 via-turquesa-400 to-turquesa-500"
        style={{ scaleX }}
      />
    </>
  );
}

/* ================= Navbar ================= */
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Sobre mí', href: '#sobremi' },
  { label: 'Apps en vivo', href: '#apps' },
  { label: 'Java Vault', href: '#codigo' },
  { label: 'Stack', href: '#stack' },
];

export function Navbar({ visible }: { visible: boolean }) {
  const [active, setActive] = useState('#inicio');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_ITEMS.map((i) => i.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive('#' + e.target.id);
        }
      },
      { rootMargin: '-42% 0px -52% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const go = (href: string) => {
    setOpen(false);
    scrollToSection(href);
  };

  return (
    <>
      <motion.header
        className="fixed left-1/2 top-4 z-[120] w-[min(94vw,980px)] -translate-x-1/2"
        initial={{ y: -80, opacity: 0 }}
        animate={visible ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      >
        <nav className={`glass-strong flex items-center justify-between gap-3 px-4 py-2.5 md:px-5 ${scrolled ? 'shadow-[0_18px_50px_-12px_rgb(3_22_17/0.7)]' : ''}`}>
          <button onClick={() => go('#inicio')} className="flex items-center gap-3" data-cursor>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-agua-500 to-turquesa-400 font-display text-sm font-bold text-tinta-900">
              {profile.iniciales}
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-wide text-niebla-100 md:block">
              {profile.nombre.split(' ')[0]} <span className="font-serif-accent text-gradient">{profile.nombre.split(' ')[1]}</span>
            </span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => go(item.href)}
                  className={`relative rounded-full px-3.5 py-2 text-[0.8rem] font-medium tracking-wide transition-colors duration-300 ${
                    active === item.href ? 'text-tinta-900' : 'text-niebla-300 hover:text-niebla-100'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {active === item.href && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-agua-400/90 to-turquesa-400/90"
                      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-agua-300/20 text-niebla-100 md:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={18} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* menú móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[180] flex flex-col bg-tinta-900/85 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-end p-6">
              <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-xl border border-agua-300/25 text-niebla-100" aria-label="Cerrar menú">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ y: 36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => go(item.href)}
                  className="font-display text-3xl font-semibold text-niebla-100 py-2"
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
