import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { CheckIcon, CopyIcon } from './components/Icons';
import { product, type ThemeId } from './config';

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>('slate');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [installMenuOpen, setInstallMenuOpen] = useState(false);
  const [activeStack, setActiveStack] = useState(product.stacks[0]?.id ?? '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedHeroInstall, setCopiedHeroInstall] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const installMenuRef = useRef<HTMLDivElement>(null);
  const stackTablistRef = useRef<HTMLDivElement>(null);

  const themeListId = useId();
  const installListId = useId();
  const stackTablistId = useId();
  const stackPanelId = useId();

  const activeTheme =
    product.themes.find((t) => t.id === themeId) ?? product.themes[0];
  const activeCard =
    product.stacks.find((s) => s.id === activeStack) ?? product.stacks[0];

  const applyTheme = useCallback((id: ThemeId) => {
    const preset = product.themes.find((t) => t.id === id);
    document.documentElement.setAttribute('data-theme', id);
    document.documentElement.style.colorScheme = preset?.scheme ?? 'dark';
  }, []);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId, applyTheme]);

  useEffect(() => {
    if (!themeMenuOpen && !installMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const t = event.target as Node;
      if (themeMenuOpen && themeMenuRef.current && !themeMenuRef.current.contains(t)) {
        setThemeMenuOpen(false);
      }
      if (
        installMenuOpen &&
        installMenuRef.current &&
        !installMenuRef.current.contains(t)
      ) {
        setInstallMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeMenuOpen(false);
        setInstallMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [themeMenuOpen, installMenuOpen]);

  const copyText = useCallback(async (text: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onDone();
    } catch {
      /* ignore */
    }
  }, []);

  const selectStack = useCallback((id: string) => {
    setActiveStack(id);
    setCopiedCode(false);
    setCopiedInstall(false);
    setCopiedHeroInstall(false);
  }, []);

  const onStackTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const order = product.stacks.map((s) => s.id);
      const idx = order.indexOf(activeStack);
      if (idx < 0) return;

      let next = idx;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        next = (idx + 1) % order.length;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        next = (idx - 1 + order.length) % order.length;
      } else if (event.key === 'Home') {
        next = 0;
      } else if (event.key === 'End') {
        next = order.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const nextId = order[next];
      selectStack(nextId);
      stackTablistRef.current
        ?.querySelector<HTMLButtonElement>(`[data-stack-tab="${nextId}"]`)
        ?.focus();
    },
    [activeStack, selectStack]
  );

  if (!activeCard || !activeTheme) {
    return null;
  }

  return (
    <main className="landing-wrapper">
      <a className="skip-link" href="#content">
        Skip to main content
      </a>

      <div className="content-column">
        <header className="site-header">
          <div className="header-inner">
            <a className="site-brand" href="#top" aria-label={`${product.name} home`}>
              <span className="brand-mark">{product.name}</span>
              <span className="brand-badge">{product.version}</span>
            </a>

            <div className="header-actions">
              <div className="theme-dropdown" ref={themeMenuRef}>
                <button
                  type="button"
                  className="btn btn--ghost theme-dropdown-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={themeMenuOpen}
                  aria-controls={themeListId}
                  onClick={() => {
                    setThemeMenuOpen((o) => !o);
                    setInstallMenuOpen(false);
                  }}
                >
                  <span className="theme-dropdown-icon" aria-hidden="true">
                    {activeTheme.icon}
                  </span>
                  <span className="theme-dropdown-label">
                    {activeTheme.name.split(' ')[0]}
                  </span>
                  <span className="theme-dropdown-caret" aria-hidden="true">
                    {themeMenuOpen ? '\u25B2' : '\u25BC'}
                  </span>
                </button>

                {themeMenuOpen ? (
                  <ul
                    id={themeListId}
                    className="theme-dropdown-menu"
                    role="listbox"
                    aria-label="Page theme"
                  >
                    {product.themes.map((theme) => {
                      const selected = theme.id === themeId;
                      return (
                        <li key={theme.id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`theme-dropdown-item${selected ? ' is-active' : ''}`}
                            onClick={() => {
                              setThemeId(theme.id);
                              setThemeMenuOpen(false);
                            }}
                          >
                            <span aria-hidden="true">{theme.icon}</span>
                            <span>{theme.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <a
                href={product.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>

        <div id="content" tabIndex={-1}>
          <section id="top" className="hero-section">
            <div className="hero-container">
              <h1 className="hero-title">
                <span className="hero-title-line">{product.tagline[0]}</span>
                <span className="hero-title-line hero-gradient-text">
                  {product.tagline[1]}
                </span>
              </h1>
              <p className="hero-subtitle">{product.description}</p>

              <div className="hero-cta-group">
                <div
                  className={`install-command-pill${installMenuOpen ? ' is-open' : ''}`}
                  ref={installMenuRef}
                >
                  <button
                    type="button"
                    className="install-stack-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={installMenuOpen}
                    aria-controls={installListId}
                    onClick={() => {
                      setInstallMenuOpen((o) => !o);
                      setThemeMenuOpen(false);
                    }}
                  >
                    <span>{activeCard.shortLabel}</span>
                    <span className="install-stack-caret" aria-hidden="true">
                      {installMenuOpen ? '\u25B2' : '\u25BC'}
                    </span>
                  </button>

                  <span className="install-command-divider" aria-hidden="true" />

                  <code className="install-command-text">$ {activeCard.install}</code>

                  <button
                    type="button"
                    className="install-copy-btn"
                    onClick={() =>
                      void copyText(activeCard.install, () => {
                        setCopiedHeroInstall(true);
                        window.setTimeout(() => setCopiedHeroInstall(false), 1600);
                      })
                    }
                    aria-label={`Copy ${activeCard.label} install command`}
                  >
                    {copiedHeroInstall ? (
                      <CheckIcon width={14} height={14} />
                    ) : (
                      <CopyIcon width={14} height={14} />
                    )}
                  </button>

                  {installMenuOpen ? (
                    <ul
                      id={installListId}
                      className="install-stack-menu"
                      role="listbox"
                      aria-label="Install for stack"
                    >
                      {product.stacks.map((card) => {
                        const selected = card.id === activeStack;
                        return (
                          <li key={card.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              className={`install-stack-item${selected ? ' is-active' : ''}`}
                              onClick={() => {
                                selectStack(card.id);
                                setInstallMenuOpen(false);
                              }}
                            >
                              <span className="install-stack-item-label">
                                {card.label}
                              </span>
                              <span className="install-stack-item-pkg">
                                {card.packageName}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>

                <div className="hero-stats">
                  {product.stats.map((stat, i) => (
                    <span key={stat.label} style={{ display: 'contents' }}>
                      {i > 0 ? (
                        <span className="hero-stat-divider" aria-hidden="true" />
                      ) : null}
                      <span className="hero-stat">
                        <span className="hero-stat-symbol">{stat.symbol}</span>
                        {stat.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="quickstart" className="quickstart-section" tabIndex={-1}>
            <div className="section-header">
              <span className="section-kicker">Getting started</span>
              <h2>Same model · every stack</h2>
              <p>
                Pick a stack on the rail — install, API surface, and a minimal
                example stay in view. Edit <code>src/config.ts</code> for your
                product.
              </p>
            </div>

            <div className="stack-explorer">
              <div
                ref={stackTablistRef}
                className="stack-tabs"
                role="tablist"
                id={stackTablistId}
                aria-label="Product stacks"
                aria-orientation="vertical"
                onKeyDown={onStackTabKeyDown}
              >
                {product.stacks.map((card) => {
                  const selected = card.id === activeStack;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      role="tab"
                      id={`stack-tab-${card.id}`}
                      data-stack-tab={card.id}
                      className={`stack-tab${selected ? ' is-active' : ''}`}
                      aria-selected={selected}
                      aria-controls={stackPanelId}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => selectStack(card.id)}
                    >
                      <span className="stack-tab-label">{card.shortLabel}</span>
                      <span className="stack-tab-pkg" aria-hidden="true">
                        {card.packageName.replace(/^@[^/]+\//, '')}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className="stack-panel"
                role="tabpanel"
                id={stackPanelId}
                aria-labelledby={`stack-tab-${activeCard.id}`}
              >
                <div className="stack-panel-meta">
                  <div className="stack-panel-titles">
                    <h3 className="stack-panel-title">{activeCard.label}</h3>
                    <a
                      className="npm-badge"
                      href={activeCard.packageUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={`${activeCard.packageName} on npm`}
                    >
                      <span className="npm-badge-label">npm</span>
                      <span className="npm-badge-value">
                        {activeCard.packageName}
                      </span>
                    </a>
                  </div>
                  <p className="stack-panel-blurb">{activeCard.blurb}</p>

                  <dl className="stack-panel-facts">
                    <div>
                      <dt>API</dt>
                      <dd>
                        <code>{activeCard.apiHint}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>Peers</dt>
                      <dd>{activeCard.peers}</dd>
                    </div>
                  </dl>

                  <ul className="stack-panel-tags" aria-label="Highlights">
                    {activeCard.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>

                  <div className="stack-panel-install">
                    <code>{activeCard.install}</code>
                    <button
                      type="button"
                      className="stack-install-copy"
                      onClick={() =>
                        void copyText(activeCard.install, () => {
                          setCopiedInstall(true);
                          window.setTimeout(() => setCopiedInstall(false), 1600);
                        })
                      }
                      aria-label={`Copy ${activeCard.label} install command`}
                    >
                      {copiedInstall ? (
                        <CheckIcon width={12} height={12} />
                      ) : (
                        <CopyIcon width={12} height={12} />
                      )}
                      <span>{copiedInstall ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="code-window">
                  <div className="code-header">
                    <div className="code-dots">
                      <span className="dot dot--red" />
                      <span className="dot dot--yellow" />
                      <span className="dot dot--green" />
                    </div>
                    <span className="code-filename">{activeCard.file}</span>
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={() =>
                        void copyText(activeCard.code, () => {
                          setCopiedCode(true);
                          window.setTimeout(() => setCopiedCode(false), 1600);
                        })
                      }
                      aria-label={`Copy ${activeCard.label} example`}
                    >
                      {copiedCode ? (
                        <CheckIcon width={14} height={14} />
                      ) : (
                        <CopyIcon width={14} height={14} />
                      )}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre aria-label={`${activeCard.label} example`}>
                    <code>{activeCard.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="site-footer">
          <div className="footer-bar">
            <p className="footer-tagline">
              {product.name} landing shell · edit config, keep the chrome
            </p>
            <nav className="footer-nav" aria-label="Footer">
              {product.footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
