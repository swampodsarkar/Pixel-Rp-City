import React from 'react';
import * as THREE from 'three';

const LightBar = () => (
  <group position={[0, 0.3, 0]}>
    <mesh position={[-0.4, 0, 0]}>
      <boxGeometry args={[0.3, 0.15, 0.6]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
    </mesh>
    <mesh position={[0.4, 0, 0]}>
      <boxGeometry args={[0.3, 0.15, 0.6]} />
      <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
    </mesh>
  </group>
);

const Siren = () => (
  <group>
    <pointLight position={[-0.5, 0.6, 0]} intensity={3} distance={25} color="#ef4444" />
    <pointLight position={[0.5, 0.6, 0]} intensity={3} distance={25} color="#3b82f6" />
  </group>
);

const Sedan = ({ color }: { color: string }) => (
  <group>
    <mesh castShadow position={[0, 0.7, 0]}>
      <boxGeometry args={[2, 0.5, 4.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh castShadow position={[0, 1.2, -0.3]}>
      <boxGeometry args={[1.6, 0.5, 2.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 1.2, 0.8]} rotation={[0.4, 0, 0]}>
      <planeGeometry args={[1.4, 0.7]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <mesh position={[0, 1.2, -1.5]} rotation={[-0.4, 0, 0]}>
      <planeGeometry args={[1.4, 0.7]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <Wheels />
  </group>
);

const SportsCar = ({ color }: { color: string }) => (
  <group>
    <mesh castShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[2.4, 0.4, 5]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
    </mesh>
    <mesh castShadow position={[0, 0.9, -0.2]}>
      <boxGeometry args={[2, 0.4, 2]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
    </mesh>
    <mesh position={[0, 0.9, 1]} rotation={[0.3, 0, 0]}>
      <planeGeometry args={[1.8, 0.5]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <mesh position={[0, 0.9, -1.4]} rotation={[-0.3, 0, 0]}>
      <planeGeometry args={[1.8, 0.5]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <Wheels wheelRadius={0.45} />
  </group>
);

const PoliceCar = () => (
  <group>
    <mesh castShadow position={[0, 0.7, 0]}>
      <boxGeometry args={[2, 0.5, 4.5]} />
      <meshStandardMaterial color="#111111" />
    </mesh>
    <mesh castShadow position={[0, 1.2, -0.3]}>
      <boxGeometry args={[1.6, 0.5, 2.2]} />
      <meshStandardMaterial color="#111111" />
    </mesh>
    {/* White door */}
    <mesh position={[0, 0.7, 0.5]}>
      <planeGeometry args={[1.2, 0.5]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    <mesh position={[0, 1.2, 0.8]} rotation={[0.4, 0, 0]}>
      <planeGeometry args={[1.4, 0.7]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <mesh position={[0, 1.2, -1.5]} rotation={[-0.4, 0, 0]}>
      <planeGeometry args={[1.4, 0.7]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    {/* Light bar on roof */}
    <mesh position={[0, 1.65, -0.3]}>
      <LightBar />
    </mesh>
    <Siren />
    <Wheels />
  </group>
);

const Ambulance = () => (
  <group>
    <mesh castShadow position={[0, 0.9, 0]}>
      <boxGeometry args={[2.2, 0.8, 5]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    {/* Boxier roof */}
    <mesh castShadow position={[0, 1.5, -0.2]}>
      <boxGeometry args={[2, 0.5, 3]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
    {/* Red cross stripe */}
    <mesh position={[0, 0.9, 0]}>
      <planeGeometry args={[0.4, 0.25]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
    {/* Red stripe along side */}
    <mesh position={[1.11, 0.8, 0.5]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[3, 0.3]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
    <mesh position={[-1.11, 0.8, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[3, 0.3]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
    {/* Light bar */}
    <mesh position={[0, 2, -0.2]}>
      <LightBar />
    </mesh>
    <Siren />
    <Wheels />
  </group>
);

const Taxi = ({ color }: { color: string }) => (
  <group>
    <mesh castShadow position={[0, 0.7, 0]}>
      <boxGeometry args={[2, 0.5, 4.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh castShadow position={[0, 1.2, -0.3]}>
      <boxGeometry args={[1.6, 0.5, 2.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Checkered stripe */}
    <mesh position={[1.01, 0.85, 0]}>
      <planeGeometry args={[0.15, 0.3]} />
      <meshStandardMaterial color="#111111" />
    </mesh>
    <mesh position={[-1.01, 0.85, 0]}>
      <planeGeometry args={[0.15, 0.3]} />
      <meshStandardMaterial color="#111111" />
    </mesh>
    {/* Taxi sign on roof */}
    <mesh position={[0, 1.7, -0.3]}>
      <boxGeometry args={[0.8, 0.12, 0.3]} />
      <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1} />
    </mesh>
    <mesh position={[0, 1.2, 0.8]} rotation={[0.4, 0, 0]}>
      <planeGeometry args={[1.4, 0.7]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <mesh position={[0, 1.2, -1.5]} rotation={[-0.4, 0, 0]}>
      <planeGeometry args={[1.4, 0.7]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <Wheels />
  </group>
);

const Truck = ({ color }: { color: string }) => (
  <group>
    {/* Cabin */}
    <mesh castShadow position={[0, 0.8, 1.2]}>
      <boxGeometry args={[2.2, 0.8, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Cargo */}
    <mesh castShadow position={[0, 1.1, -1.2]}>
      <boxGeometry args={[2.2, 1.2, 3.5]} />
      <meshStandardMaterial color="#e5e7eb" />
    </mesh>
    <mesh position={[0, 1.3, 2]} rotation={[0.4, 0, 0]}>
      <planeGeometry args={[1.6, 0.6]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    <Wheels wheelRadius={0.6} wheelOffset={1.8} />
  </group>
);

const Wheels = ({ wheelRadius = 0.5, wheelOffset = 1.5 }: { wheelRadius?: number; wheelOffset?: number }) => (
  <>
    {[-1.05, 1.05].map(x =>
      [-wheelOffset, wheelOffset].map(z => (
        <mesh key={`w-${x}-${z}`} castShadow rotation={[0, 0, Math.PI / 2]} position={[x, wheelRadius * 0.8, z]}>
          <cylinderGeometry args={[wheelRadius, wheelRadius, 0.25, 12]} />
          <meshStandardMaterial color="#171717" roughness={0.8} />
        </mesh>
      ))
    )}
  </>
);

export const RealisticCar = ({ color = "#ef4444", type = "sedan" }: { color?: string; type?: string }) => {
  const groupRef = React.useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={[0, 0.4, 0]} scale={1.5}>
      {type === 'sports' && <SportsCar color={color} />}
      {type === 'police' && <PoliceCar />}
      {type === 'ambulance' && <Ambulance />}
      {type === 'taxi' && <Taxi color={color} />}
      {type === 'truck' && <Truck color={color} />}
      {(!type || type === 'sedan' || type === 'car') && <Sedan color={color} />}

      {/* Headlights for all */}
      <mesh position={[0.7, 0.8, 2.55]}>
        <planeGeometry args={[0.25, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.7, 0.8, 2.55]}>
        <planeGeometry args={[0.25, 0.2]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[1, 0.8, 3]} intensity={1.5} distance={20} color="#fef08a" />
      <pointLight position={[-1, 0.8, 3]} intensity={1.5} distance={20} color="#fef08a" />

      {/* Taillights */}
      <mesh position={[0.7, 0.8, -2.55]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.7, 0.8, -2.55]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
};
