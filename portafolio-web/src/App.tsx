import { useCallback, useEffect, useState } from 'react';
import { initLenis, useAtmosphere } from './lib/motion';
import { Atmosphere, Cursor, Navbar, Preloader } from './components/chrome';
import Hero from './sections/Hero';
import About from './sections/About';
import LiveApps from './sections/LiveApps';
import JavaVault from './sections/JavaVault';
import { Architecture, Footer, StackSection, Stats } from './sections/Closing';

export default function App() {
  const [ready, setReady] = useState(false);
  useAtmosphere();

  useEffect(() => {
    const cleanup = initLenis();
    return cleanup;
  }, []);

  const onPreloaderDone = useCallback(() => {
    setReady(true);
    // refresca los ScrollTrigger creados durante el estado inicial
    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
  }, []);

  return (
    <div className="relative min-h-screen font-sans">
      <Atmosphere />
      <Cursor />
      <Preloader onDone={onPreloaderDone} />
      <Navbar visible={ready} />

      <main className="relative">
        <Hero started={ready} />
        <About />
        <LiveApps />
        <JavaVault />
        <Architecture />
        <Stats />
        <StackSection />
      </main>
      <Footer />
    </div>
  );
}
