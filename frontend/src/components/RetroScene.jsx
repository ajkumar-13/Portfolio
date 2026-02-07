import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import BaseballGame from './BaseballGame';

/**
 * Retro Grid Component
 */
const RetroGrid = () => {
    return (
        <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -6, 0]}>
            <gridHelper args={[60, 20, 0xff00ff, 0x00ffff]} position={[0, 0, 0]} />
            <gridHelper args={[60, 20, 0xff00ff, 0x00ffff]} position={[0, 0, -60]} />
        </group>
    );
};

/**
 * Main 3D Scene Component
 */
const RetroScene = () => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
            <Canvas camera={{ position: [0, 2, 16], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <RetroGrid />
                <BaseballGame />

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
