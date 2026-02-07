import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * Retro Grid Component
 */
const RetroGrid = () => {
    return (
        <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
            <gridHelper args={[60, 60, 0xff00ff, 0x00ffff]} position={[0, 0, 0]} />
            <gridHelper args={[60, 60, 0xff00ff, 0x00ffff]} position={[0, 0, -60]} />
        </group>
    );
};

/**
 * Floating Geometry Component
 */
const FloatingShapes = () => {
    const { isDark } = useTheme();
    const geometries = [
        <icosahedronGeometry args={[0.8, 0]} />,
        <octahedronGeometry args={[0.6, 0]} />,
        <torusGeometry args={[0.5, 0.2, 16, 100]} />,
        <dodecahedronGeometry args={[0.7, 0]} />
    ];

    return (
        <>
            {geometries.map((geo, i) => (
                <Float
                    key={i}
                    speed={2}
                    rotationIntensity={2}
                    floatIntensity={2}
                    position={[(i - 1.5) * 2.5, Math.random() * 2 - 1, Math.random() * 2 - 1]}
                >
                    <mesh>
                        {geo}
                        <meshStandardMaterial
                            color={isDark ? "#dfd1bc" : "#8b7355"}
                            wireframe
                            emissive={isDark ? "#dfd1bc" : "#8b7355"}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                </Float>
            ))}
        </>
    );
};

/**
 * Falling Particles System
 * Spawns particles on click that fall with gravity
 */
const FallingParticles = () => {
    const { isDark } = useTheme();
    const [particles, setParticles] = useState([]);
    const { camera, raycaster, scene } = useThree();

    // Handle clicks to spawn particles
    useEffect(() => {
        const handleClick = (e) => {
            // Calculate mouse position in normalized device coordinates
            const mouse = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );

            // Raycast to find point in space at random depth
            raycaster.setFromCamera(mouse, camera);
            const target = new THREE.Vector3();
            raycaster.ray.at(10, target); // Project 10 units out

            // Spawn grid of particles around point
            const newParticles = [];
            const count = 10;
            for (let i = 0; i < count; i++) {
                newParticles.push({
                    id: Math.random(),
                    position: [
                        target.x + (Math.random() - 0.5) * 2,
                        target.y + (Math.random() - 0.5) * 2,
                        target.z + (Math.random() - 0.5) * 2
                    ],
                    velocity: [
                        (Math.random() - 0.5) * 0.1,
                        Math.random() * 0.1 + 0.1, // Initial upward burst
                        (Math.random() - 0.5) * 0.1
                    ],
                    rotation: [Math.random(), Math.random(), Math.random()],
                    scale: Math.random() * 0.3 + 0.1,
                    color: isDark ? '#dfd1bc' : '#8b7355'
                });
            }

            setParticles(prev => [...prev, ...newParticles]);
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [camera, raycaster, isDark]);

    // Animation loop
    useFrame(() => {
        setParticles(prev => prev
            .map(p => ({
                ...p,
                position: [
                    p.position[0] + p.velocity[0],
                    p.position[1] + p.velocity[1],
                    p.position[2] + p.velocity[2]
                ],
                velocity: [
                    p.velocity[0],
                    p.velocity[1] - 0.01, // Gravity
                    p.velocity[2]
                ],
                rotation: [
                    p.rotation[0] + 0.02,
                    p.rotation[1] + 0.02,
                    p.rotation[2]
                ]
            }))
            .filter(p => p.position[1] > -10) // Remove when below threshold
        );
    });

    return (
        <group>
            {particles.map(p => (
                <mesh key={p.id} position={p.position} rotation={p.rotation} scale={[p.scale, p.scale, p.scale]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={p.color}
                        emissive={p.color}
                        emissiveIntensity={1}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
        </group>
    );
};

/**
 * Main 3D Scene Component
 */
const RetroScene = () => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <RetroGrid />
                <FloatingShapes />
                <FallingParticles />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 3}
                    autoRotate={false}
                />
            </Canvas>
        </div>
    );
};

export default RetroScene;
