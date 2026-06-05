import React from 'react';

export const RealisticCar = ({ color = "#ef4444" }: { color?: string }) => (
  <group position={[0, 0.4, 0]}>
    {/* Main Chassis */}
    <mesh castShadow position={[0, 0.8, 0]}>
      <boxGeometry args={[2.2, 0.6, 4.8]} />
      <meshStandardMaterial color={color} /> 
    </mesh>
    
    {/* Top Cabin */}
    <mesh castShadow position={[0, 1.4, -0.4]}>
      <boxGeometry args={[1.8, 0.7, 2.4]} />
      <meshStandardMaterial color={color} />
    </mesh>

    {/* Windows */}
    {/* Front windshield */}
    <mesh position={[0, 1.4, 0.81]} rotation={[0.4, 0, 0]}>
      <planeGeometry args={[1.6, 0.8]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    {/* Rear windshield */}
    <mesh position={[0, 1.4, -1.61]} rotation={[-0.4, 0, 0]}>
      <planeGeometry args={[1.6, 0.8]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    {/* Side windows right */}
    <mesh position={[0.91, 1.4, -0.4]} rotation={[0, Math.PI/2, 0]}>
      <planeGeometry args={[2.4, 0.6]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>
    {/* Side windows left */}
    <mesh position={[-0.91, 1.4, -0.4]} rotation={[0, -Math.PI/2, 0]}>
      <planeGeometry args={[2.4, 0.6]} />
      <meshStandardMaterial color="#111827" roughness={0.1} metalness={0.8} />
    </mesh>

    {/* Wheels */}
    {[-1.1, 1.1].map(x => [-1.6, 1.6].map(z => (
      <mesh key={`wheel-${x}-${z}`} castShadow rotation={[0, 0, Math.PI/2]} position={[x, 0.4, z]}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
        <meshStandardMaterial color="#171717" roughness={0.8} />
      </mesh>
    )))}

    {/* Headlights */}
    <mesh position={[0.7, 0.9, 2.41]}>
      <planeGeometry args={[0.4, 0.3]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
    </mesh>
    <mesh position={[-0.7, 0.9, 2.41]}>
      <planeGeometry args={[0.4, 0.3]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
    </mesh>
    
    <pointLight position={[1, 0.9, 2.8]} intensity={1.5} distance={20} color="#fef08a" />
    <pointLight position={[-1, 0.9, 2.8]} intensity={1.5} distance={20} color="#fef08a" />

    {/* Taillights */}
    <mesh position={[0.7, 0.9, -2.41]}>
      <planeGeometry args={[0.5, 0.2]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
    </mesh>
    <mesh position={[-0.7, 0.9, -2.41]}>
      <planeGeometry args={[0.5, 0.2]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
    </mesh>
  </group>
);
