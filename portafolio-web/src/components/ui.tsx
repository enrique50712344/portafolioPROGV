import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { isLocalHost, useMagnetic, useProbe, useTilt } from '../hooks/useMotion';

/* ---------- Reveal: aparición progresiva al hacer scroll ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 42,
  className = '',
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Título de sección con tipografía cinética ---------- */
export function SectionHeading({
  overline,
  title,
  accent,
  subtitle,
  align = 'center',
}: {
  overline: string;
  title: string;
  accent?: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const words = title.split(' ');
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  // Un único observer en el <h2> (que nunca está recortado) propaga la animación
  // a los hijos: evita el "deadlock" de whileInView en spans con overflow hidden.
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  };
  const wordV: Variants = {
    hidden: { y: '112%', rotate: 5 },
    show: { y: 0, rotate: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
  };
  const accentV: Variants = {
    hidden: { y: '112%' },
    show: { y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className={`flex flex-col gap-5 ${alignCls}`}>
      <Reveal>
        <span className="chip">{overline}</span>
      </Reveal>
      <motion.h2
        className="font-display text-4xl md:text-6xl font-semibold leading-[1.08] tracking-tight text-niebla-100"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {words.map((w, i) => (
          <span key={i} className="k-line mr-[0.28em]">
            <motion.span className="k-char" variants={wordV}>
              {w}
            </motion.span>
          </span>
        ))}
        {accent && (
          <span className="k-line">
            <motion.span className="k-char serif-accent text-gradient pr-[0.12em]" variants={accentV}>
              {accent}
            </motion.span>
          </span>
        )}
      </motion.h2>
      {subtitle && (
        <Reveal delay={0.25} y={20}>
          <p className={`max-w-xl text-niebla-300 text-sm md:text-base leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------- Tarjeta glass con tilt 3D ---------- */
export const GlassCard = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { tilt?: boolean }>(
  function GlassCard({ tilt = true, className = '', children, ...rest }, _fwd) {
    const tiltRef = useTilt<HTMLDivElement>(7);
    return (
      <motion.div
        ref={tilt ? tiltRef : undefined}
        className={`glass group relative overflow-hidden transition-[border-color,box-shadow] duration-500 hover:border-agua-300/35 hover:[box-shadow:var(--shadow-glow)] ${className}`}
        style={{ transitionProperty: 'border-color, box-shadow, transform', transitionDuration: '450ms', transformStyle: 'preserve-3d' }}
        {...rest}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(45 212 191 / 0.12), transparent 65%)',
          }}
        />
        {children as React.ReactNode}
      </motion.div>
    );
  },
);

/* ---------- Botón con microinteracciones + efecto magnético ---------- */
export function MagneticButton({
  children,
  onClick,
  variant = 'solid',
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
}) {
  const ref = useMagnetic<HTMLButtonElement>(0.28);
  const base =
    'group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300';
  const styles =
    variant === 'solid'
      ? 'bg-gradient-to-r from-agua-600 to-turquesa-400 text-tinta-900 shadow-[0_10px_36px_-8px_rgb(16_185_129/0.65)] hover:shadow-[0_14px_44px_-6px_rgb(45_212_191/0.7)] hover:brightness-110'
      : 'border border-agua-300/25 text-niebla-100 hover:border-agua-300/60 hover:bg-agua-500/10';
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className={`${base} ${styles} ${className}`}
      style={{ transitionProperty: 'box-shadow, filter, background-color, border-color, transform', transitionDuration: '300ms' }}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Semáforo de estado ---------- */
export function StatusDot({ url, label = 'en vivo' }: { url: string; label?: string }) {
  const local = isLocalHost();
  const state = useProbe(url, 25000, local);
  const color = !local
    ? 'bg-amber-300/70'
    : state === 'up'
      ? 'bg-agua-400'
      : state === 'down'
        ? 'bg-rose-400'
        : 'bg-agua-300/40';
  const text = !local ? 'demo local' : state === 'up' ? label : state === 'down' ? 'detenida' : 'verificando…';
  return (
    <span className="inline-flex items-center gap-2 text-[0.7rem] tracking-wide text-niebla-300">
      <span className="relative flex h-2.5 w-2.5">
        {local && state === 'up' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agua-400 opacity-60" />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
      </span>
      {text}
    </span>
  );
}

/* ---------- Esfera decorativa flutuante ---------- */
export function Orb({
  className = '',
  color = 'rgba(16,185,129,0.35)',
  size = 320,
  drift = 'orb-a',
  style = {},
}: {
  className?: string;
  color?: string;
  size?: number;
  drift?: 'orb-a' | 'orb-b';
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={`orb ${drift} ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${color}, transparent 70%)`,
        ...style,
      }}
    />
  );
}

/* ---------- Switch de tabs animado ---------- */
export function TabRow({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => {
              if (t.id !== active) onChange(t.id);
            }}
            className="relative rounded-xl px-3.5 py-2 text-xs font-medium tracking-wide transition-colors duration-300"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {t.icon}
              {t.label}
            </span>
            {isActive && (
              <motion.span
                layoutId={`tab-${tabs.map((x) => x.id).join('-')}`}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-agua-400 to-turquesa-400"
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-xl border border-agua-300/15 text-niebla-300 hover:border-agua-300/40 hover:bg-agua-500/10" />
            )}
          </button>
        );
      })}
    </div>
  );
}
