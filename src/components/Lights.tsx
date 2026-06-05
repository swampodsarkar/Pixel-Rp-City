import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export const DayNightCycle = () => {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.05; // Progression of time
    const cycle = Math.sin(t);
    
    const dayIntensity = Math.max(0, cycle);
    const nightIntensity = Math.max(0, -cycle);

    if (ambientRef.current) {
       ambientRef.current.intensity = 0.8 + nightIntensity * 0.4; // Slightly brighter overall
    }

    if (sunRef.current) {
      sunRef.current.intensity = dayIntensity * 2.5; // Stronger sun
      sunRef.current.position.set(Math.cos(t) * 1000, Math.sin(t) * 1000, 300);
    }

    if (moonRef.current) {
      moonRef.current.intensity = nightIntensity * 1.5;
      moonRef.current.position.set(Math.cos(t + Math.PI) * 1000, Math.sin(t + Math.PI) * 1000, -300);
    }

    // Colors for blending the sky background and fog
    const dayColor = new THREE.Color("#baebff"); // Softer day sky
    const sunsetColor = new THREE.Color("#ffb49e"); // Softer sunset
    const nightColor = new THREE.Color("#1e293b"); 

    let bgColor = new THREE.Color();
    if (cycle > 0.2) {
      bgColor.copy(dayColor);
    } else if (cycle > 0) {
      bgColor.copy(sunsetColor).lerp(dayColor, cycle / 0.2);
    } else if (cycle > -0.2) {
      bgColor.copy(nightColor).lerp(sunsetColor, (cycle + 0.2) / 0.2);
    } else {
      bgColor.copy(nightColor);
    }

    // Apply the background color smoothly
    scene.background = bgColor;
    // Fog adjusting to ambient color - softer fog
    scene.fog = new THREE.FogExp2(bgColor, 0.0020); 
  });

  return (
    <group>
      <ambientLight ref={ambientRef} color="#ffffff" />
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={3000}
        shadow-camera-near={0.1}
        shadow-camera-left={-800} // Expansive shadow volume for the top down camera angle
        shadow-camera-right={800}
        shadow-camera-top={800}
        shadow-camera-bottom={-800}
        shadow-bias={-0.0005}
      />
      <directionalLight ref={moonRef} color="#a8b2d1" />
    </group>
  );
};
