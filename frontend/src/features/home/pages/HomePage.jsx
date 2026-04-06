import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../../app/providers/ThemeProvider';
import shellStyles from '../../../styles/components.module.css';
import HomeMetricGrid from '../components/HomeMetricGrid';
import HomePanel from '../components/HomePanel';
import HomeRouteCard from '../components/HomeRouteCard';
import {
    BUILD_LEDGER,
    FOOTER_NOTE,
    FOCUS_TRACKS,
    HERO_METRICS,
    OPERATING_PRINCIPLES,
    ROUTES,
    SIGNALS,
    STACK,
} from '../homeContent';
import styles from '../styles/home.module.css';

const HomePage = () => {
    const { isDark } = useTheme();
    const [signalIndex, setSignalIndex] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }

        const timer = setInterval(() => {
            setSignalIndex((currentIndex) => (currentIndex + 1) % SIGNALS.length);
        }, 2600);

        return () => clearInterval(timer);
    }, []);

    const modeLabel = isDark ? 'MIDNIGHT CRT' : 'DAYSHIFT CRT';

    return (
        <div className={styles.page}>
            <div className={styles.backdrop} aria-hidden="true">
                <div className={styles.sunGlow} />
                <div className={styles.sun} />
                <div className={styles.grid} />
                <div className={styles.scanlines} />
            </div>

            <section className={styles.hero}>
                <div className={styles.console}>
                    <div className={styles.consoleBar}>
                        <div className={styles.windowDots}>
                            <span className={styles.windowDot} />
                            <span className={styles.windowDot} />
                            <span className={styles.windowDot} />
                        </div>
                        <span className={styles.windowLabel}>AJAY.OS // HOME SURFACE</span>
                        <span className={styles.windowMode}>{modeLabel}</span>
                    </div>

                    <div className={styles.consoleBody}>
                        <p className={styles.bootLine}>BOOT SEQUENCE // 04.05.2026</p>
                        <p className={styles.strap}>
                            Retro interface, modern systems thinking. The front page is now being rebuilt to feel more intentional and less gimmick-heavy.
                        </p>

                        <h1 className={styles.title}>Retro-Built For Real Systems.</h1>

                        <p className={styles.lead}>
                            I build AI infrastructure, technical writing systems, and learning-heavy engineering projects with a bias toward clarity, traceability, and production discipline.
                        </p>

                        <div className={styles.statusRail}>
                            <div className={styles.statusPill}>
                                <span className={styles.statusPillLabel}>System Posture</span>
                                <span className={styles.statusPillValue}>Lean homepage, modular backend, public reasoning.</span>
                            </div>
                            <div className={styles.statusPill}>
                                <span className={styles.statusPillLabel}>Design Intent</span>
                                <span className={styles.statusPillValue}>Retro control-room atmosphere without turning the front page into a novelty demo.</span>
                            </div>
                        </div>

                        <div className={styles.signalBox}>
                            <span className={styles.signalLabel}>Active Signal</span>
                            <span className={styles.signalText}>
                                &gt; {SIGNALS[signalIndex]}
                                <span className={styles.cursor}>_</span>
                            </span>
                        </div>

                        <div className={styles.ctaRow}>
                            <Link to="/projects" className={shellStyles.btnPrimary}>
                                View Projects
                            </Link>
                            <Link
                                to="/blogs"
                                className={`${shellStyles.btnSecondary} ${styles.ghostAction}`}
                            >
                                Read Technical Notes
                            </Link>
                            <a
                                href="https://github.com/ajkumar-13"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${shellStyles.btnSecondary} ${styles.ghostAction}`}
                            >
                                Open GitHub
                            </a>
                        </div>

                        <HomeMetricGrid metrics={HERO_METRICS} />
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <HomePanel
                        label="Current Track"
                        title="Front page polish through reusable control-room primitives."
                        body="The home surface is being tightened into a set of reusable panels and cards so future iterations stay fast and consistent."
                        tone="cool"
                    >
                        <div className={styles.trackGrid}>
                            <div className={styles.trackItem}>
                                <span className={styles.trackItemLabel}>Now</span>
                                <strong className={styles.trackItemValue}>Extract panels and cards</strong>
                            </div>
                            <div className={styles.trackItem}>
                                <span className={styles.trackItemLabel}>Next</span>
                                <strong className={styles.trackItemValue}>Turn the front page into a branded system</strong>
                            </div>
                        </div>
                    </HomePanel>

                    <HomePanel label="Stack Radar" title="Systems I keep returning to.">
                        <div className={styles.stackList}>
                            {STACK.map((item) => (
                                <span key={item} className={styles.stackChip}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </HomePanel>

                    <HomePanel label="Focus Queue" title="The current learning backlog.">
                        <div className={styles.focusList}>
                            {FOCUS_TRACKS.map((track, index) => (
                                <div key={track.title} className={styles.focusItem}>
                                    <span className={styles.focusIndex}>{String(index + 1).padStart(2, '0')}</span>
                                    <div className={styles.focusText}>
                                        <strong>{track.title}</strong>
                                        <span>{track.detail}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </HomePanel>
                </div>
            </section>

            <section className={styles.operationsGrid}>
                <HomePanel
                    label="Build Ledger"
                    title="What the front page is optimizing for now."
                    body="Each pass trades spectacle for clearer hierarchy, faster iteration, and a product direction that can actually hold up."
                    tone="warm"
                >
                    <div className={styles.ledgerList}>
                        {BUILD_LEDGER.map((item) => (
                            <div key={item.title} className={styles.ledgerItem}>
                                <span className={styles.ledgerEyebrow}>{item.eyebrow}</span>
                                <strong className={styles.ledgerTitle}>{item.title}</strong>
                                <span className={styles.ledgerDetail}>{item.detail}</span>
                            </div>
                        ))}
                    </div>
                </HomePanel>

                <HomePanel
                    label="Operating Principles"
                    title="The constraints shaping this portfolio."
                    body="This repo is being treated like a real system surface: opinionated, explainable, and easy to change in pieces."
                >
                    <div className={styles.principleGrid}>
                        {OPERATING_PRINCIPLES.map((principle) => (
                            <div key={principle.title} className={styles.principleCard}>
                                <strong className={styles.principleTitle}>{principle.title}</strong>
                                <span className={styles.principleDetail}>{principle.detail}</span>
                            </div>
                        ))}
                    </div>
                </HomePanel>
            </section>

            <section className={styles.routeDeck}>
                {ROUTES.map((route) => (
                    <HomeRouteCard key={route.to} route={route} />
                ))}
            </section>

            <p className={styles.footerNote}>{FOOTER_NOTE}</p>
        </div>
    );
};

export default HomePage;
