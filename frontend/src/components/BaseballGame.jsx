import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * Robot Character Component
 * Enhanced geometry and animations
 */
const Robot = ({ position, rotation, color, role, actionState }) => {
    const groupRef = useRef();
    const rightArmRef = useRef();
    const leftArmRef = useRef();
    const bodyRef = useRef();
    const headRef = useRef();

    // Robot Parts Material
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.8
    }), [color]);

    const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: role === 'batter' ? '#00ff88' : '#ff0055'
    }), [role]);

    // Animation Refs
    const animTime = useRef(0);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        // --- IDLE ANIMATION ---
        if (actionState === 'idle' || actionState === 'waiting') {
            bodyRef.current.position.y = 0.8 + Math.sin(time * 2) * 0.02;
            headRef.current.position.y = 1.6 + Math.sin(time * 2 - 0.5) * 0.02;

            // Batter Stance: Bat held high
            if (role === 'batter') {
                rightArmRef.current.rotation.z = Math.PI / 1.5; // Arm up
                rightArmRef.current.rotation.x = 0;
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1] + Math.PI / 4, delta * 5); // Tucked stance
            }
            // Bowler Stance: Ball held
            else if (role === 'bowler') {
                rightArmRef.current.rotation.z = Math.sin(time) * 0.05;
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1], delta * 5);
            }
        }

        // --- PITCHING ANIMATION (Bowler) ---
        if (role === 'bowler' && actionState === 'pitching') {
            animTime.current += delta * 4;

            // Phase 1: Windup (Lean back)
            // Rotation is [0, -PI/2, 0]. Lean back means increasing Y rotation?
            // Actually simpler to just animate arm relative to body
            if (animTime.current < 1.5) {
                // Lean back
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.2, delta * 5);
                rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, Math.PI, delta * 5);
            }
            // Phase 2: Throw (Snap forward)
            else {
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -0.4, delta * 15);
                rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.5, delta * 20);
            }
        } else if (role === 'bowler') {
            animTime.current = 0; // Reset
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 5);
        }

        // --- BATTING ANIMATION (Batter) ---
        if (role === 'batter' && actionState === 'swinging') {
            // Powerful Swing (Left to Right)
            // Stance: Face Camera (0). Left Arm is Left (-X).
            // Swing: Rotate CCW to Face Back (PI). Left Arm moves Front -> Right.
            const targetRot = Math.PI - 0.5; // Follow through

            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, delta * 15);

            // Swing Left Arm (holding bat) Up -> Down/Forward
            leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -Math.PI / 2, delta * 20);
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.PI / 2, delta * 20);
        } else if (role === 'batter') {
            // Return to 'Side-On' Stance (Face Camera)
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 5);
            // Hold bat up ready
            leftArmRef.current.rotation.z = Math.PI / 1.5;
            leftArmRef.current.rotation.x = 0;
        }
    });

    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            {/* Head */}
            <group ref={headRef} position={[0, 1.6, 0]}>
                <mesh material={material}>
                    <boxGeometry args={[0.4, 0.5, 0.4]} />
                </mesh>
                {/* Visor/Eye */}
                <mesh position={[0, 0, 0.21]} material={glowMaterial}>
                    <boxGeometry args={[0.3, 0.1, 0.05]} />
                </mesh>
            </group>

            {/* Body */}
            <mesh ref={bodyRef} position={[0, 0.8, 0]} material={material}>
                <cylinderGeometry args={[0.3, 0.2, 0.9, 8]} />
            </mesh>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[0.35, 1.1, 0]}>
                <mesh position={[0, -0.25, 0]} material={material}>
                    <boxGeometry args={[0.15, 0.6, 0.15]} />
                </mesh>
                {role === 'bowler' && (
                    <mesh position={[0, -0.6, 0]}>
                        <sphereGeometry args={[0.15]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                )}
            </group>

            {/* Left Arm (Bat Holder for Visibility) */}
            <group ref={leftArmRef} position={[-0.35, 1.1, 0]}>
                <mesh position={[0, -0.25, 0]} material={material}>
                    <boxGeometry args={[0.15, 0.6, 0.15]} />
                </mesh>
                {role === 'batter' && (
                    <group position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        {/* Bat */}
                        <mesh position={[0, 0.6, 0]}>
                            <cylinderGeometry args={[0.04, 0.08, 1.4]} />
                            <meshStandardMaterial color="#8B4513" />
                        </mesh>
                    </group>
                )}
            </group>

            {/* Legs */}
            <group position={[0, 0.4, 0]}>
                <mesh position={[0.15, -0.4, 0]} material={material}>
                    <cylinderGeometry args={[0.1, 0.08, 0.8]} />
                </mesh>
                <mesh position={[-0.15, -0.4, 0]} material={material}>
                    <cylinderGeometry args={[0.1, 0.08, 0.8]} />
                </mesh>
            </group>
        </group>
    );
};

/**
 * Baseball Game System
 */
const BaseballGame = () => {
    const { isDark } = useTheme();
    const [gameState, setGameState] = useState('waiting');
    const [score, setScore] = useState(0);
    const [isSwinging, setIsSwinging] = useState(false);

    // Physics State
    const ballRef = useRef();
    const ballVelocity = useRef(new THREE.Vector3(0, 0, 0));
    const timerRef = useRef(null);

    // Layout
    const FLOOR_Y = -6;
    // Swap: Bowler Right, Batter Left
    const BOWLER_POS = [12, FLOOR_Y, -2];
    const BATTER_POS = [-12, FLOOR_Y, -2];
    const ballPosition = useRef(new THREE.Vector3(BOWLER_POS[0], BOWLER_POS[1] + 100, BOWLER_POS[2]));

    // Game Loop (Pitching Interval)
    useEffect(() => {
        const resetPitch = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            setGameState('waiting');

            // Wait for windup animation then throw (approx 2s cycle)
            timerRef.current = setTimeout(() => {
                setGameState('pitching'); // Starts animation

                // Actual throw (ball release) happens after windup
                timerRef.current = setTimeout(() => {
                    launchBall();
                }, 600);

            }, 3500);
        };

        resetPitch();
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [score]);

    const launchBall = () => {
        // Reset ball to bowler's hand (Right side)
        ballPosition.current.set(BOWLER_POS[0] - 0.5, FLOOR_Y + 1.5, BOWLER_POS[2]);

        // Calculate vector to batter (Left side)
        const targetX = BATTER_POS[0] + 0.5;
        const targetZ = BATTER_POS[2];
        const dx = targetX - ballPosition.current.x;
        const dz = targetZ - ballPosition.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const speed = 0.45;

        ballVelocity.current.set(
            (dx / dist) * speed,
            0.15, // Arc
            (dz / dist) * speed
        );

        setGameState('flying_ball');

        // Safety Reset: Force reset after 6 seconds if missed/stuck
        setTimeout(() => {
            setGameState(prev => {
                // Only reset if we are still flying (missed) or just stuck
                if (prev === 'flying_ball' || prev === 'hit') return 'waiting';
                return prev;
            });
        }, 6000);
    };

    const swingBat = () => {
        if (isSwinging) return;
        setIsSwinging(true);
        setTimeout(() => setIsSwinging(false), 500);

        // Hit Detection
        if (gameState === 'flying_ball') {
            const dx = ballPosition.current.x - BATTER_POS[0];
            const dz = ballPosition.current.z - BATTER_POS[2];
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Swing radius
            if (dist < 2.5) {
                hitBall();
            }
        }
    };

    const hitBall = () => {
        setGameState('hit');
        setScore(s => s + 1);

        // Hit direction: Wide spread
        ballVelocity.current.set(
            0.3 + Math.random() * 0.5,  // Always towards Right (Bowler)
            0.4 + Math.random() * 0.3,  // High arc
            (Math.random() - 0.5) * 4.0 // HUGE Z spread (Inside/Outside screen)
        );

        if (isDark) {
            // Space home run
            ballVelocity.current.multiplyScalar(1.2);
        }
    };

    useFrame(() => {
        if (!ballRef.current) return;

        // Ball Logic
        if (gameState === 'flying_ball' || gameState === 'hit') {
            ballPosition.current.add(ballVelocity.current);

            // Gravity
            const g = isDark ? 0.005 : 0.015;
            ballVelocity.current.y -= g;

            // Bounce Floor
            if (ballPosition.current.y < FLOOR_Y + 0.2) {
                ballPosition.current.y = FLOOR_Y + 0.2;
                ballVelocity.current.y *= -0.7; // Bouncier
                ballVelocity.current.x *= 0.98; // Less Friction
                ballVelocity.current.z *= 0.98;
            }

            // Cleanup only if mostly stopped or way out of bounds
            if (ballPosition.current.y < FLOOR_Y + 0.3 && Math.abs(ballVelocity.current.y) < 0.05) {
                if (Math.abs(ballVelocity.current.x) < 0.01) setGameState('waiting');
            }
            // Off screen boundaries (Wide)
            if (ballPosition.current.x > 50 || ballPosition.current.x < -50 || ballPosition.current.z < -40 || ballPosition.current.z > 30) {
                setGameState('waiting');
            }
        } else {
            ballPosition.current.y = -100;
        }

        // Apply to Mesh
        ballRef.current.position.copy(ballPosition.current);
        ballRef.current.rotation.x += 0.2;
    });

    useEffect(() => {
        const handleInput = (e) => {
            if (e.type === 'click' || e.code === 'Space') swingBat();
        };
        window.addEventListener('click', handleInput);
        window.addEventListener('keydown', handleInput);
        return () => {
            window.removeEventListener('click', handleInput);
            window.removeEventListener('keydown', handleInput);
        }
    }, [gameState]);

    return (
        <group>
            {/* Bowler (Right) */}
            <Robot
                position={BOWLER_POS}
                rotation={[0, -Math.PI / 2, 0]} // Face Left
                color={isDark ? "#8b5cf6" : "#6b6b80"}
                role="bowler"
                actionState={gameState === 'pitching' ? 'pitching' : 'idle'}
            />

            {/* Batter (Left) */}
            <Robot
                position={BATTER_POS}
                rotation={[0, 0, 0]} // Face Camera (Side-on)
                color={isDark ? "#dfd1bc" : "#8b7355"}
                role="batter"
                actionState={isSwinging ? 'swinging' : 'idle'}
            />

            {/* Debug Cube Center */}
            <mesh position={[0, -2, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="red" />
            </mesh>

            {/* Ball */}
            <mesh ref={ballRef} position={[0, -100, 0]}>
                <sphereGeometry args={[0.25]} />
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
            </mesh>
        </group>
    );
};

export default BaseballGame;
