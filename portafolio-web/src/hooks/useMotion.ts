import { useEffect, useRef, useState } from 'react';

/** posición del puntero normalizada [-1, 1] (para parallax) */
export function usePointer() {
  const ref = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      ref.current.sy = window.scrollY;
    };
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return ref;
}

/** true solo cuando el sitio se abre desde la PC donde corren las demos */
export function isLocalHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

/** estado de una URL del proxy (semáforo por app) */
export type ProbeState = 'checking' | 'up' | 'down';

export function useProbe(url: string, intervalMs = 25000, enabled = true) {
  const [state, setState] = useState<ProbeState>(enabled ? 'checking' : 'down');

  useEffect(() => {
    if (!enabled) {
      setState('down');
      return;
    }

    let alive = true;
    let timer = 0;

    const check = async () => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
        clearTimeout(t);
        if (alive) setState(res.ok ? 'up' : 'down');
      } catch {
        if (alive) setState('down');
      }
      if (alive) timer = window.setTimeout(check, intervalMs);
    };

    check();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [url, intervalMs, enabled]);

  return state;
}

/** efecto magnético de botones */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = 'translate(0px, 0px)';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);
  return ref;
}

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** tilt 3D para tarjetas */
export function useTilt<T extends HTMLElement>(max = 8) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-4px)`;
      el.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(py + 0.5) * 100}%`);
    };
    const onLeave = () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max]);
  return ref;
}
