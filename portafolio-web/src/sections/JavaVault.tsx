import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Check, Copy, FileCode2, Search, Terminal, Cpu, ServerCrash, Braces } from 'lucide-react';
import { Orb, Reveal, SectionHeading } from '../components/ui';
import { javaFiles, vaultGeneratedAt } from '../data/javaVault.generated';
import { CATEGORY_LABELS, CATEGORY_ORDER, type JavaCategory, type JavaFile } from '../data/vault';

const theme = {
  ...themes.nightOwl,
  plain: { ...themes.nightOwl.plain, backgroundColor: 'transparent' },
};

/* --------------------------------------------------------------- visor de código */
function CodePane({ file }: { file: JavaFile }) {
  const [tab, setTab] = useState<'codigo' | 'salida' | 'ejecutar'>('codigo');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'codigo', label: 'Código', icon: <Braces size={12} /> },
    { id: 'salida', label: 'Salida de consola', icon: <Terminal size={12} /> },
    { id: 'ejecutar', label: 'Cómo ejecutarlo', icon: <Cpu size={12} /> },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-agua-300/14 bg-tinta-800/70 backdrop-blur-xl">
      {/* cabecera de ventana */}
      <div className="flex items-center gap-3 border-b border-agua-300/10 px-4 py-2.5">
        <div className="flex gap-1.5">
          {['bg-rose-400/60', 'bg-amber-300/60', 'bg-agua-400/60'].map((c, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <span className="truncate font-mono text-[0.7rem] text-niebla-300">{file.path}</span>
        <span className="rounded-md bg-agua-500/10 px-2 py-0.5 text-[0.62rem] text-agua-300/80">{file.loc} líneas</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(file.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-agua-300/18 px-2.5 py-1 text-[0.68rem] text-niebla-300 transition hover:border-agua-300/50 hover:text-niebla-100"
          aria-label="Copiar código"
        >
          {copied ? <Check size={12} className="text-agua-300" /> : <Copy size={12} />}
          {copied ? 'copiado' : 'copiar'}
        </button>
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`relative rounded-lg px-3 py-1.5 text-[0.7rem] font-medium ${tab === t.id ? 'text-tinta-900' : 'text-niebla-500 hover:text-niebla-300'}`}
          >
            <span className="relative z-10 flex items-center gap-1.5">{t.icon}{t.label}</span>
            {tab === t.id && (
              <motion.span layoutId={`vault-tab-${file.id}`} className="absolute inset-0 rounded-lg bg-gradient-to-r from-agua-400 to-turquesa-400" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
            )}
          </button>
        ))}
      </div>

      {/* panel */}
      <div className="code-panel min-h-0 flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {tab === 'codigo' && (
            <motion.pre key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <Highlight code={file.code} language="java" theme={theme}>
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre className="display-block font-mono text-[0.72rem] leading-relaxed md:text-[0.76rem]" style={{ display: 'table', minWidth: '100%' }}>
                    {tokens.map((line, li) => (
                      <div key={li} {...getLineProps({ line })} className="code-line">
                        <span className="code-line-number">{li + 1}</span>
                        <span role="cell" style={{ display: 'table-cell' }}>
                          {line.map((token, ti) => (
                            <span key={ti} {...getTokenProps({ token })} />
                          ))}
                        </span>
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </motion.pre>
          )}

          {tab === 'salida' && (
            <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              {file.output ? (
                <>
                  <span className="chip mb-3 !text-[0.62rem]">capturada al ejecutar este programa</span>
                  <pre className="whitespace-pre-wrap rounded-xl border border-agua-300/12 bg-tinta-900/70 p-4 font-mono text-[0.74rem] leading-relaxed text-agua-200/90">{file.output}</pre>
                </>
              ) : file.blocking ? (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-400/5 p-5 text-[0.8rem] leading-relaxed text-amber-100/80">
                  <span className="flex items-center gap-2 font-medium text-amber-200">
                    <ServerCrash size={15} /> Este programa es un servidor / interactivo
                  </span>
                  La salida depende de una sesión abierta (espera solicitudes o lee el teclado), así que no puede
                  capturarse aquí. Hazlo correr con los pasos en la pestaña <b>“Cómo ejecutarlo”</b> — si es una API,
                  puedes probarla en vivo desde la sección <b>Apps en vivo</b>.
                </div>
              ) : (
                <div className="rounded-xl border border-agua-300/12 bg-tinta-900/60 p-5 text-[0.8rem] text-niebla-500">
                  Es una clase de modelo o utilidad: la salida se produce cuando la invoca otro programa (ver pestaña
                  “Cómo ejecutarlo”).
                </div>
              )}
            </motion.div>
          )}

          {tab === 'ejecutar' && (
            <motion.ol key="e" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex list-none flex-col gap-3 p-0">
              {file.runNote.map((line, i) => (
                <li key={i} className="flex flex-col gap-1.5">
                  <span className="text-[0.62rem] uppercase tracking-[0.2em] text-niebla-500">paso {i + 1}</span>
                  <code className="overflow-x-auto rounded-lg border border-agua-300/12 bg-tinta-900/70 px-4 py-2.5 font-mono text-[0.76rem] text-agua-200/90">{line}</code>
                </li>
              ))}
              <li className="mt-2 rounded-lg border border-agua-300/10 bg-agua-500/5 p-3 text-[0.72rem] leading-relaxed text-niebla-500">
                Los comandos asumen JDK 11+ (probado con JDK 24) desde la carpeta del archivo.
              </li>
            </motion.ol>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- sección */
export default function JavaVault() {
  const [cat, setCat] = useState<'all' | JavaCategory>('all');
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState(javaFiles[0]?.id ?? '');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return javaFiles.filter((f) => {
      const okCat = cat === 'all' || f.category === cat;
      const okQ =
        !needle ||
        [f.name, f.title, f.desc, f.path].some((s) => s.toLowerCase().includes(needle));
      return okCat && okQ;
    });
  }, [cat, q]);

  const active = filtered.find((f) => f.id === activeId) ?? filtered[0] ?? null;

  const counts = useMemo(() => {
    const m = {} as Record<string, number>;
    for (const f of javaFiles) m[f.category] = (m[f.category] || 0) + 1;
    return m;
  }, []);

  const totalLoc = useMemo(() => javaFiles.reduce((a, f) => a + f.loc, 0), []);

  return (
    <section id="codigo" data-atmo="blue" className="relative mx-auto w-[min(94vw,1240px)] px-4 py-28 md:py-36">
      <Orb className="right-[6%] top-[10%] h-60 w-60" color="rgba(34,211,238,0.16)" />

      <SectionHeading
        overline="04 · Código fuente"
        title="Java"
        accent="Vault."
        subtitle={`${javaFiles.length} archivos · ${totalLoc} líneas publicadas · 5 categorías. Explora, copia y ejecuta; las salidas marcadas son consolas reales capturadas al compilar y correr cada programa.`}
      />

      {/* filtros */}
      <Reveal delay={0.15} className="mt-10">
        <div className="flex flex-wrap items-center gap-2.5">
          <PillButton active={cat === 'all'} onClick={() => setCat('all')}>
            Todos ({javaFiles.length})
          </PillButton>
          {CATEGORY_ORDER.map((c) => (
            <PillButton key={c} active={cat === c} onClick={() => setCat(c)}>
              {CATEGORY_LABELS[c]} ({counts[c] || 0})
            </PillButton>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-full border border-agua-300/15 px-4 py-2 text-xs text-niebla-300 focus-within:border-agua-300/50">
            <Search size={13} className="text-agua-300/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="buscar archivo…"
              className="w-40 bg-transparent outline-none placeholder:text-niebla-500/60"
            />
          </div>
        </div>
      </Reveal>

      {/* explorador */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* lista */}
        <div className="h-fit max-h-[560px] overflow-auto rounded-2xl border border-agua-300/12 bg-tinta-800/50 p-2.5 backdrop-blur-xl lg:sticky lg:top-24">
          {filtered.length === 0 && (
            <p className="p-6 text-center text-xs text-niebla-500">Sin resultados para “{q}”</p>
          )}
          {CATEGORY_ORDER.map((c) => {
            const group = filtered.filter((f) => f.category === c);
            if (!group.length) return null;
            return (
              <div key={c} className="mb-3 last:mb-0">
                <p className="px-2 pb-1.5 pt-2 text-[0.6rem] uppercase tracking-[0.24em] text-agua-300/70">{CATEGORY_LABELS[c]}</p>
                {group.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveId(f.id)}
                    className={`relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      active?.id === f.id ? 'bg-agua-500/14 text-niebla-100' : 'text-niebla-500 hover:bg-agua-500/6 hover:text-niebla-300'
                    }`}
                  >
                    <FileCode2 size={13} className={active?.id === f.id ? 'text-agua-300' : 'opacity-40'} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.72rem] font-medium">{f.name}</span>
                      <span className="block truncate text-[0.62rem] italic opacity-60" style={{ fontStyle: 'normal' }}>{f.title}</span>
                    </span>
                    {f.output ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-agua-400" title="con salida capturada" />
                    ) : f.blocking ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/70" title="servidor / interactivo" />
                    ) : (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-niebla-500/30" title="clase utilitaria" />
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* visor */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-[540px] flex-col gap-4"
              style={{ minHeight: '60vh' }}
            >
              <div className="glass-strong flex flex-wrap items-baseline gap-x-4 gap-y-1 p-5">
                <h3 className="font-display text-lg font-semibold text-niebla-100">{active.title}</h3>
                <p className="w-full text-[0.8rem] leading-relaxed text-niebla-500">{active.desc}</p>
              </div>
              <CodePane file={active} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Reveal delay={0.1} className="mt-8 flex justify-center">
        <span className="text-[0.66rem] tracking-[0.18em] text-niebla-500/70">
          generado localmente · {new Date(vaultGeneratedAt).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </Reveal>
    </section>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`relative rounded-full px-4 py-2 text-[0.72rem] font-medium transition-colors duration-300 text-glow ${active ? 'text-tinta-900' : 'text-niebla-300 hover:text-niebla-100'}`}>
      <span className="relative z-10">{children}</span>
      {active && (
        <motion.span layoutId="vault-filter" className="absolute inset-0 rounded-full bg-gradient-to-r from-agua-400 to-turquesa-400" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
      )}
      {!active && <span className="absolute inset-0 rounded-full border border-agua-300/15 hover:border-agua-300/40" />}
    </button>
  );
}
