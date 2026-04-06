import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../app/providers/ThemeProvider';

/**
 * Settings Dock Component
 * Consolidated controls for Theme and Audio
 */
const SettingsDock = () => {
    const { isDark, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Audio State
    const audioContextRef = useRef(null);
    const waterfallNodeRef = useRef(null);
    const birdIntervalRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);

    // Initialize Audio Context
    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
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
            initAudio();
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

    return (
        <div style={{
            position: 'relative',
            zIndex: 100
        }}>
            {/* Toggle Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isOpen ? 'var(--accent-primary)' : 'transparent',
                    color: isOpen ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
                title="Settings"
                aria-label="Settings"
            >
                <span style={{ fontSize: '1.2rem', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                    ⚙️
                </span>
            </button>

            {/* Expanded Menu - Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    padding: '1.25rem',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    minWidth: '200px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {/* Theme Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Theme</span>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-secondary)',
                                borderRadius: '20px',
                                padding: '0.4rem 0.8rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{isDark ? '🌙' : '☀️'}</span>
                            <span>{isDark ? 'Dark' : 'Light'}</span>
                        </button>
                    </div>

                    {/* Audio Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ambience</span>
                            <button
                                onClick={toggleAudio}
                                style={{
                                    background: isPlaying ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                    color: isPlaying ? '#fff' : 'var(--text-primary)',
                                    border: '1px solid var(--border-secondary)',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isPlaying ? '🔊' : '🔇'}
                            </button>
                        </div>

                        {isPlaying && (
                            <div style={{ width: '100%' }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    style={{
                                        width: '100%',
                                        accentColor: 'var(--accent-primary)',
                                        height: '4px',
                                        borderRadius: '2px'
                                    }}
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
