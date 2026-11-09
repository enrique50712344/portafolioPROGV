// ------------------------------------------------------------
// Setup compartido: Lenis (scroll suave) + GSAP ScrollTrigger
// ------------------------------------------------------------
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let rafId = 0;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initLenis() {
  if (lenisInstance || prefersReducedMotion()) return () => {};
  lenisInstance = new Lenis({ lerp: 0.105, smoothWheel: true });
  lenisInstance.on('scroll', ScrollTrigger.update);

  const raf = (time: number) => {
    lenisInstance?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
  return () => {
    cancelAnimationFrame(rafId);
    lenisInstance?.destroy();
    lenisInstance = null;
  };
}

export function scrollToSection(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el as HTMLElement, { offset: -70, duration: 1.35 });
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: 'smooth' });
  }
}

// divide un texto en caracteres animables (kinetic typography)
export function splitChars(text: string): { ch: string; key: number }[] {
  return text.split('').map((ch, key) => ({ ch, key }));
}

export function splitWords(text: string): { w: string; key: number }[] {
  return text.split(' ').map((w, key) => ({ w, key }));
}

/** alterna la atmosfera (emerald / blue) según la sección visible */
export function useAtmosphere() {
  useEffect(() => {
    const root = document.querySelector('[data-atmo-root]');
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-atmo]'));
    const triggers = sections.map((sec) =>
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 58%',
        end: 'bottom 42%',
        onToggle: (self) => {
          if (self.isActive && root) root.setAttribute('data-atmo', sec.dataset.atmo || 'emerald');
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);
}

export { gsap, ScrollTrigger };
