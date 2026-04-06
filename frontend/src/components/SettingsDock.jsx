import { useState, useEffect, useRef } from 'react';

import { useTheme } from '../app/providers/ThemeProvider';
import styles from './settingsDock.module.css';

/**
 * Settings Dock Component
 * Consolidated controls for Theme and Audio
 */
const SettingsDock = () => {
    const { isDark, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);

    // Audio State
    const audioContextRef = useRef(null);
    const waterfallNodeRef = useRef(null);
    const birdIntervalRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);

    const audioSupported = typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);

    // Initialize Audio Context
    const initAudio = () => {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return false;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        return true;
    };

    // Create Pink Noise (Waterfall)
    const createWaterfall = () => {
        const ctx = audioContextRef.current;
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume * 0.15;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();

        return { source: noise, gain: gainNode };
    };

    // Create Bird Chirp
    const playBirdChirp = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'suspended') return;

        const ctx = audioContextRef.current;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(2000 + Math.random() * 1000, t);
        osc.frequency.exponentialRampToValueAtTime(1000 + Math.random() * 500, t + 0.1);
        osc.frequency.exponentialRampToValueAtTime(2500 + Math.random() * 1000, t + 0.2);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(volume * 0.1, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
    };

    const toggleAudio = () => {
        if (isPlaying) {
            if (waterfallNodeRef.current) {
                waterfallNodeRef.current.source.stop();
                waterfallNodeRef.current = null;
            }
            if (birdIntervalRef.current) {
                clearInterval(birdIntervalRef.current);
                birdIntervalRef.current = null;
            }
            setIsPlaying(false);
        } else {
            if (!audioSupported || !initAudio()) {
                return;
            }

            waterfallNodeRef.current = createWaterfall();
            birdIntervalRef.current = setInterval(() => {
                if (Math.random() > 0.6) playBirdChirp();
            }, 2500);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (waterfallNodeRef.current) {
            waterfallNodeRef.current.gain.gain.value = volume * 0.15;
        }
    }, [volume]);

    useEffect(() => {
        return () => {
            if (waterfallNodeRef.current) waterfallNodeRef.current.source.stop();
            if (birdIntervalRef.current) clearInterval(birdIntervalRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const modeLabel = isDark ? 'MIDNIGHT' : 'DAYSHIFT';
    const ambienceLabel = !audioSupported ? 'N/A' : isPlaying ? 'ON' : 'OFF';

    return (
        <div ref={rootRef} className={styles.root}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
                title="Settings"
                aria-label="Settings"
                aria-expanded={isOpen}
                aria-controls="settings-dock-menu"
            >
                <span className={styles.triggerText}>CTL</span>
            </button>

            {isOpen && (
                <div id="settings-dock-menu" className={styles.menu}>
                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Display</p>
                        <div className={styles.row}>
                            <span className={styles.rowLabel}>Theme</span>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={styles.actionButton}
                            >
                                {modeLabel}
                            </button>
                        </div>
                        <p className={styles.hint}>Toggle the shell between night-mode and warm daylight tones.</p>
                    </div>

                    <div className={styles.section}>
                        <p className={styles.sectionLabel}>Ambience</p>
                        <div className={styles.row}>
                            <span className={styles.rowLabel}>Waterfall mix</span>
                            <button
                                type="button"
                                onClick={toggleAudio}
                                className={`${styles.actionButton} ${isPlaying ? styles.actionButtonActive : ''}`}
                                disabled={!audioSupported}
                                aria-pressed={isPlaying}
                            >
                                {ambienceLabel}
                            </button>
                        </div>
                        <p className={styles.hint}>
                            {audioSupported
                                ? 'Optional ambient synth birds plus low waterfall noise.'
                                : 'Audio controls are unavailable in this browser.'}
                        </p>

                        {isPlaying && (
                            <div className={styles.sliderBlock}>
                                <div className={styles.sliderHeader}>
                                    <span className={styles.rowLabel}>Level</span>
                                    <span className={styles.sliderValue}>{Math.round(volume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={(event) => setVolume(parseFloat(event.target.value))}
                                    className={styles.range}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsDock;
