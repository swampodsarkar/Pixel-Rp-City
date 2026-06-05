import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RealisticCar } from './RealisticCar';
import { useGameStore } from '../store';
import { Environment, Html } from '@react-three/drei';
import { mapConfig } from '../mapData';
import { useMultiplayerStore, listenToShots, ShotData } from '../multiplayer';
import { WEAPONS, WEAPON_PICKUPS } from '../weapons';

const CityBuildings = ({ geo, mat }: any) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    mapConfig.cityBuildings.forEach((m, i) => meshRef.current!.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={meshRef} args={[geo, mat, mapConfig.cityBuildings.length]} castShadow receiveShadow />;
};

const VillageBuildings = ({ geo, mat }: any) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    mapConfig.villageBuildings.forEach((m, i) => meshRef.current!.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={meshRef} args={[geo, mat, mapConfig.villageBuildings.length]} castShadow receiveShadow />;
};

const VillageRoofs = ({ geo, mat }: any) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    mapConfig.villageBuildings.forEach((m, i) => {
       const pos = new THREE.Vector3();
       const quat = new THREE.Quaternion();
       const scale = new THREE.Vector3();
       m.decompose(pos, quat, scale);
       
       const roofMatrix = new THREE.Matrix4();
       const roofScale = new THREE.Vector3(scale.x + 1, scale.y * 0.4, scale.z + 1);
       const roofPos = new THREE.Vector3(pos.x, pos.y + scale.y/2 + roofScale.y/2, pos.z);
       roofMatrix.compose(roofPos, quat, roofScale);

       meshRef.current!.setMatrixAt(i, roofMatrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={meshRef} args={[geo, mat, mapConfig.villageBuildings.length]} castShadow receiveShadow />;
};

const TreesLeaves = ({ geo, mat }: any) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    mapConfig.treeLeaves.forEach((m, i) => meshRef.current!.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={meshRef} args={[geo, mat, mapConfig.treeLeaves.length]} castShadow receiveShadow />;
};

const TreeTrunks = ({ geo, mat }: any) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    mapConfig.treeTrunks.forEach((m, i) => meshRef.current!.setMatrixAt(i, m));
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={meshRef} args={[geo, mat, mapConfig.treeTrunks.length]} castShadow receiveShadow />;
};

const ParkedCars = () => {
  const cars = useGameStore(s => s.cars);
  const drivingVehicle = useGameStore(s => s.drivingVehicle);
  const players = useMultiplayerStore(s => s.players);

  return (
    <group>
      {cars.map((car) => {
        // Don't render the car in the world if player is currently driving it
        if (drivingVehicle?.id === car.id) return null;
        
        // Don't render if another player is driving it
        const isDrivenByOther = Object.values(players).some(p => p.drivingVehicleId === car.id);
        if (isDrivenByOther) return null;
        
        return (
          <group key={car.id} position={[car.x, 0, car.z]}>
            <RealisticCar color={car.color} />
          </group>
        );
      })}
    </group>
  );
};

export const World = () => {
  // Re-use geometries and materials for huge performance gains on low-end devices
  const buildingGeo = useMemo(() => new THREE.BoxGeometry(), []);
  const cityBuildingMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#52525b', roughness: 0.7, metalness: 0.2 }), []);
  const villageBuildingMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e5e7eb' }), []);
  const villageRoofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b91c1c' }), []);
  const roofGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.8, 1, 4);
    geo.rotateY(Math.PI / 4); // Rotate 45deg to match square base
    return geo;
  }, []);
  
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.8, 1.2, 2, 8), []);
  const trunkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78350f' }), []);
  const leavesGeo = useMemo(() => new THREE.ConeGeometry(4, 6, 8), []);
  const leavesMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15803d' }), []);
  
  // Create a canvas texture for city buildings (fake windows)
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#27272a'; // Base wall
        ctx.fillRect(0, 0, 64, 64);
        
        ctx.fillStyle = '#3f3f46'; // Window frame
        ctx.fillRect(8, 8, 20, 20);
        ctx.fillRect(36, 8, 20, 20);
        ctx.fillRect(8, 36, 20, 20);
        ctx.fillRect(36, 36, 20, 20);

        ctx.fillStyle = '#18181b'; // Glass
        ctx.fillRect(10, 10, 16, 16);
        ctx.fillRect(38, 10, 16, 16);
        ctx.fillRect(10, 38, 16, 16);
        ctx.fillRect(38, 38, 16, 16);
        
        // Some random illuminated windows
        if (Math.random() > 0.5) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(10, 10, 16, 16);
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4); // Tile the windows
    return tex;
  }, []);
  
  const cityWindowMat = useMemo(() => new THREE.MeshStandardMaterial({ map: windowTexture, roughness: 0.4 }), [windowTexture]);

  return (
    <group>
        <Environment preset="city" />
        {/* Massive Base Map Ground (8000x8000) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[8000, 8000]} />
          <meshStandardMaterial color="#86efac" />
        </mesh>

        {/* Endless intersecting roads across the entire map */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
          <planeGeometry args={[40, 8000]} />
          <meshStandardMaterial color="#3f3f46" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
          <planeGeometry args={[8000, 40]} />
          <meshStandardMaterial color="#3f3f46" />
        </mesh>

        {/* Instanced Geometry Renderers depending on procedural config */}
        {mapConfig.cityBuildings.length > 0 && <CityBuildings geo={buildingGeo} mat={cityWindowMat} />}
        {mapConfig.villageBuildings.length > 0 && (
          <group>
            <VillageBuildings geo={buildingGeo} mat={villageBuildingMat} />
            <VillageRoofs geo={roofGeo} mat={villageRoofMat} />
          </group>
        )}
        {mapConfig.treeTrunks.length > 0 && <TreeTrunks geo={trunkGeo} mat={trunkMat} />}
        {mapConfig.treeLeaves.length > 0 && <TreesLeaves geo={leavesGeo} mat={leavesMat} />}

        {/* INTERACTABLE VEHICLES */}
        <ParkedCars />

        {/* WEAPON PICKUPS */}
        {WEAPON_PICKUPS.map((p, i) => (
          <group key={i} position={[p.x, 0, p.z]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial color={WEAPONS[p.weapon]?.color || '#888'} emissive={WEAPONS[p.weapon]?.color || '#888'} emissiveIntensity={0.5} />
            </mesh>
            <Html position={[0, 1, 0]} center>
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                fontFamily: 'monospace',
                border: `1px solid ${WEAPONS[p.weapon]?.color || '#888'}`,
                pointerEvents: 'none',
              }}>
                {WEAPONS[p.weapon]?.name || p.weapon}
              </div>
            </Html>
          </group>
        ))}

        {/* MISSION MARKER */}
        <MissionMarker />

        {/* SHOT EFFECTS */}
        <ShotEffects />
    </group>
  );
};

const MissionMarker = () => {
  const mission = useGameStore((s) => s.mission);
  if (!mission.active) return null;

  return (
    <group position={[mission.targetX, 0, mission.targetZ]}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={1} />
      </mesh>
      <Html position={[0, 5.5, 0]} center>
        <div style={{
          background: 'rgba(79,70,229,0.8)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}>
          {mission.title}
        </div>
      </Html>
    </group>
  );
};

const ShotEffects = () => {
  const [shots, setShots] = useState<ShotData[]>([]);

  useEffect(() => {
    const unsub = listenToShots((s) => setShots(s));
    return () => unsub();
  }, []);

  return (
    <group>
      {shots.map((shot) => {
        const wDef = shot.weapon ? WEAPONS[shot.weapon] : null;
        return (
          <group key={shot.id} position={[shot.x, 1, shot.z]} rotation={[0, shot.ry, 0]}>
            <mesh position={[0, 0, 1]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial
                color={wDef?.color || '#fff'}
                emissive={wDef?.color || '#fff'}
                emissiveIntensity={2}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
