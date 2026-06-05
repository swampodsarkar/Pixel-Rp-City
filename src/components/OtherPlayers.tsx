import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useMultiplayerStore, listenToShots, ShotData } from '../multiplayer';
import { RealisticCar } from './RealisticCar';
import { useGameStore } from '../store';
import { WEAPONS } from '../weapons';

export const OtherPlayers = ({ myId }: { myId: string | null }) => {
  const players = useMultiplayerStore(s => s.players);

  return (
    <group>
      {Object.values(players).map(player => {
        if (player.id === myId) return null;
        return <RemotePlayer key={player.id} player={player} />;
      })}
    </group>
  );
};

const RemotePlayer = ({ player }: { player: any }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const cars = useGameStore(s => s.cars);
  const drivingVehicle = player.drivingVehicleId ? cars.find(c => c.id === player.drivingVehicleId) : null;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    groupRef.current.position.lerp(new THREE.Vector3(player.x, 0, player.z), 0.2);

    const targetRot = player.ry;
    let angleDiff = targetRot - groupRef.current.rotation.y;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    groupRef.current.rotation.y += angleDiff * 0.2;

    if (!drivingVehicle) {
      const isSprinting = player.speed > 10;
      const t = clock.getElapsedTime() * (isSprinting ? 12 : 8);
      const isMoving = player.speed > 0.1;
      const swing = isMoving ? Math.sin(t) * 0.9 : 0;

      if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -swing, 0.2);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, swing, 0.2);
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, swing, 0.2);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -swing, 0.2);
      }

      if (player.weapon && rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.2, 0.1);
      }
    }
  });

  return (
    <group position={[player.x, 0, player.z]} rotation={[0, player.ry, 0]}>
      <Html position={[0, drivingVehicle ? 4.5 : 3.2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '3px 10px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 'bold',
          color: player.color || '#fff',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          border: '1px solid rgba(255,255,255,0.15)',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}>
          {player.name}
        </div>
      </Html>

      <group ref={groupRef}>
        {!drivingVehicle ? (
          <group>
            <group position={[0, 1.2, 0]}>
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
                <meshStandardMaterial color={player.color || '#f59e0b'} />
              </mesh>
              <mesh position={[0, 1.6, 0]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#ffcaca" />
              </mesh>

              <group ref={leftArmRef} position={[-0.6, 1.0, 0]}>
                <mesh position={[0, -0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
                  <meshStandardMaterial color={player.color || '#d97706'} />
                </mesh>
              </group>
              <group ref={rightArmRef} position={[0.6, 1.0, 0]}>
                <mesh position={[0, -0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
                  <meshStandardMaterial color={player.color || '#d97706'} />
                </mesh>
                {player.weapon && (
                  <mesh position={[0, -0.3, -0.5]} rotation={[0, 0, -Math.PI / 2]}>
                    <boxGeometry args={[0.5, 0.1, 0.1]} />
                    <meshStandardMaterial color={WEAPONS[player.weapon]?.color || '#888'} />
                  </mesh>
                )}
              </group>
            </group>

            <group ref={leftLegRef} position={[-0.2, 1.2, 0]}>
              <mesh position={[0, -0.6, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
            <group ref={rightLegRef} position={[0.2, 1.2, 0]}>
              <mesh position={[0, -0.6, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          </group>
        ) : (
          <RealisticCar color={drivingVehicle.color} />
        )}
      </group>
    </group>
  );
};
