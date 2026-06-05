import { useFrame, useThree } from '@react-three/fiber';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { RealisticCar } from './RealisticCar';
import { checkCollision } from '../mapData';
import { updatePlayerState, syncCarPosition, useMultiplayerStore, fireWeapon } from '../multiplayer';
import { updateSpatialAudioVolumes } from '../voice';
import { WEAPONS, WEAPON_PICKUPS } from '../weapons';

const BULLET_LIFE = 0.3;

export const Player = ({ isActive, myId, initialPosition = [0, 0, 0] }: { isActive: boolean, myId: string | null, initialPosition?: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRotRef = useRef<THREE.Group>(null);

  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const bulletRef = useRef<THREE.Mesh>(null);

  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  const drivingVehicle = useGameStore((state) => state.drivingVehicle);
  const setNearbyVehicle = useGameStore((state) => state.setNearbyVehicle);
  const updateCar = useGameStore((state) => state.updateCar);
  const setHealth = useGameStore((state) => state.setHealth);
  const health = useGameStore((state) => state.health);
  const weapon = useGameStore((state) => state.weapon);
  const setWeapon = useGameStore((state) => state.setWeapon);
  const lastShot = useGameStore((state) => state.lastShot);
  const setLastShot = useGameStore((state) => state.setLastShot);
  const setMoney = useGameStore((state) => state.setMoney);

  const myPlayerData = useMultiplayerStore((s) => myId ? s.players[myId] : null);
  const allPlayers = useMultiplayerStore((s) => s.players);
  const playerColor = myPlayerData?.color || '#2563eb';

  const previousDrivingVehicle = useRef(drivingVehicle);
  const lastSyncTime = useRef(0);
  const bulletActive = useRef(false);
  const bulletTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (previousDrivingVehicle.current && !drivingVehicle && groupRef.current) {
      const x = groupRef.current.position.x;
      const z = groupRef.current.position.z;
      updateCar(previousDrivingVehicle.current.id, { x, z });
      syncCarPosition(previousDrivingVehicle.current.id, x, z);
    }
    previousDrivingVehicle.current = drivingVehicle;
  }, [drivingVehicle, updateCar]);

  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(k => ({ ...k, [e.key.toLowerCase()]: true }));

      // Weapon selection
      if (e.key === '1') {
        const w = weapon.equipped === 'pistol' ? null : 'pistol';
        setWeapon({ equipped: w, ammo: { ...weapon.ammo, pistol: weapon.ammo.pistol ?? WEAPONS.pistol.ammo } });
      } else if (e.key === '2') {
        const w = weapon.equipped === 'shotgun' ? null : 'shotgun';
        setWeapon({ equipped: w, ammo: { ...weapon.ammo, shotgun: weapon.ammo.shotgun ?? WEAPONS.shotgun.ammo } });
      } else if (e.key === '3') {
        const w = weapon.equipped === 'rifle' ? null : 'rifle';
        setWeapon({ equipped: w, ammo: { ...weapon.ammo, rifle: weapon.ammo.rifle ?? WEAPONS.rifle.ammo } });
      }

      // Fire weapon
      if (e.key === ' ' && weapon.equipped && !drivingVehicle && groupRef.current && bodyRotRef.current) {
        handleFire();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse fire
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && weapon.equipped && !drivingVehicle && groupRef.current && bodyRotRef.current) {
        handleFire();
      }
    };
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    }
  }, [weapon, drivingVehicle]);

  const handleFire = () => {
    const now = Date.now();
    const wDef = weapon.equipped ? WEAPONS[weapon.equipped] : null;
    if (!wDef) return;
    if (now - lastShot < wDef.fireRate) return;
    const ammoCount = weapon.ammo[weapon.equipped!] ?? 0;
    if (ammoCount <= 0) {
      setWeapon({ equipped: null, ammo: weapon.ammo });
      return;
    }

    setLastShot(now);
    const newAmmo = { ...weapon.ammo, [weapon.equipped!]: ammoCount - 1 };
    setWeapon({ ...weapon, ammo: newAmmo });

    if (myId && groupRef.current && bodyRotRef.current) {
      fireWeapon(myId, groupRef.current.position.x, groupRef.current.position.z, bodyRotRef.current.rotation.y, weapon.equipped!);
    }

    // Show bullet
    if (bulletRef.current) {
      bulletActive.current = true;
      bulletRef.current.visible = true;
      bulletRef.current.position.set(0, 1.5, 0);
      if (bulletTimeout.current) clearTimeout(bulletTimeout.current);
      bulletTimeout.current = window.setTimeout(() => {
        if (bulletRef.current) {
          bulletRef.current.visible = false;
          bulletActive.current = false;
        }
      }, BULLET_LIFE * 1000);
    }
  };

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !bodyRotRef.current) return;

    if (!isActive) {
      const time = clock.getElapsedTime();
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom = 12;
        camera.updateProjectionMatrix();
      }
      camera.position.x = Math.sin(time * 0.05) * 150;
      camera.position.z = Math.cos(time * 0.05) * 150;
      camera.position.y = 100;
      camera.lookAt(0, 0, 0);
      return;
    }

    // Weapon pickup check
    if (!drivingVehicle && groupRef.current) {
      for (const pickup of WEAPON_PICKUPS) {
        const dist = Math.hypot(groupRef.current.position.x - pickup.x, groupRef.current.position.z - pickup.z);
        if (dist < 3) {
          const def = WEAPONS[pickup.weapon];
          setWeapon({
            equipped: pickup.weapon,
            ammo: { ...weapon.ammo, [pickup.weapon]: (weapon.ammo[pickup.weapon] ?? 0) + def.ammo }
          });
        }
      }
    }

    // Sync weapon to Firebase
    const currentWeapon = useGameStore.getState().weapon;
    const canFire = currentWeapon.equipped && (currentWeapon.ammo[currentWeapon.equipped] ?? 0) > 0;

    const joystick = useGameStore.getState().joystick;
    const isSprintingStore = useGameStore.getState().isSprinting;

    let dx = joystick.x;
    let dz = joystick.y;

    if (keys.w || keys.arrowup) dz -= 1;
    if (keys.s || keys.arrowdown) dz += 1;
    if (keys.a || keys.arrowleft) dx -= 1;
    if (keys.d || keys.arrowright) dx += 1;

    const hasInput = Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01;
    const isSprinting = isSprintingStore || (keys.shift && hasInput);

    let targetBaseSpeed = isSprinting ? 22.0 : 8.0;
    if (drivingVehicle) {
      targetBaseSpeed = 30.0;
    }

    const currentSpeedVal = useGameStore.getState().speed;
    let newSpeed = 0;

    if (hasInput) {
      const length = Math.sqrt(dx * dx + dz * dz);
      const mag = Math.min(length, 1.0);
      const targetSpeed = targetBaseSpeed * mag;

      const accel = drivingVehicle ? 1.5 : 15.0;
      newSpeed = THREE.MathUtils.lerp(currentSpeedVal, targetSpeed, accel * delta);

      let nx = dx / length;
      let nz = dz / length;
      const targetAngle = Math.atan2(nx, nz);
      let angleDiff = targetAngle - bodyRotRef.current.rotation.y;

      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const rotSpeed = drivingVehicle ? Math.max(1.0, (currentSpeedVal / 5)) : 14;
      bodyRotRef.current.rotation.y += angleDiff * rotSpeed * delta;
    } else {
      const decel = drivingVehicle ? 2.0 : 25.0;
      newSpeed = THREE.MathUtils.lerp(currentSpeedVal, 0, decel * delta);
    }

    useGameStore.getState().setSpeed(newSpeed);

    if (newSpeed > 0.1) {
      const currentRot = bodyRotRef.current.rotation.y;
      const nextX = groupRef.current.position.x + Math.sin(currentRot) * newSpeed * delta;
      const nextZ = groupRef.current.position.z + Math.cos(currentRot) * newSpeed * delta;

      const radius = drivingVehicle ? 3.0 : 1.0;
      if (!checkCollision(nextX, nextZ, radius)) {
        groupRef.current.position.x = nextX;
        groupRef.current.position.z = nextZ;
      } else {
        useGameStore.getState().setSpeed(0);
        newSpeed = 0;
        if (currentSpeedVal > 10) {
          const dmg = drivingVehicle ? currentSpeedVal * 1.5 : currentSpeedVal * 2.5;
          setHealth(health - dmg);
        }
      }
    }

    groupRef.current.position.x = Math.max(-3950, Math.min(3950, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-3950, Math.min(3950, groupRef.current.position.z));

    // Sync To DB
    const now = performance.now();
    if (myId && now - lastSyncTime.current > 100) {
      const px = groupRef.current.position.x;
      const pz = groupRef.current.position.z;
      updatePlayerState(myId, {
        x: px,
        z: pz,
        ry: bodyRotRef.current.rotation.y,
        drivingVehicleId: drivingVehicle?.id || null,
        speed: newSpeed,
        weapon: canFire ? currentWeapon.equipped : null,
        money: useGameStore.getState().money,
      });
      if (drivingVehicle) {
        syncCarPosition(drivingVehicle.id, px, pz);
      }
      updateSpatialAudioVolumes(px, pz);
      lastSyncTime.current = now;
    }

    // Vehicle interaction check
    if (!drivingVehicle) {
      let nearestCar = null;
      let minDist = 8;

      const cars = useGameStore.getState().cars;
      for (const car of cars) {
        const dist = Math.hypot(groupRef.current.position.x - car.x, groupRef.current.position.z - car.z);
        if (dist < minDist) {
          minDist = dist;
          nearestCar = car;
        }
      }

      if (nearestCar) {
        setNearbyVehicle({ id: nearestCar.id, type: nearestCar.type, color: nearestCar.color });
      } else {
        setNearbyVehicle(null);
      }
    } else {
      setNearbyVehicle(null);
    }

    // Limb animations
    if (!drivingVehicle) {
      const t = clock.getElapsedTime() * (isSprinting ? 12 : 8);
      const swing = newSpeed > 0.1 ? Math.sin(t) * 0.9 : 0;

      if (leftArmRef.current && rightArmRef.current && leftLegRef.current && rightLegRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -swing, 0.2);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, swing, 0.2);
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, swing, 0.2);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -swing, 0.2);
      }

      // Weapon aiming arm
      if (weapon.equipped && rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.2, 0.1);
      }
    }

    // Fixed isometric camera — closer, angled
    if (camera instanceof THREE.OrthographicCamera) {
      camera.position.set(100, 120, 100);
      camera.lookAt(0, 0, 0);
      camera.zoom = 1.8;
      camera.updateProjectionMatrix();
    }

    // Health regen
    if (health < 100) {
      useGameStore.getState().setHealth(health + 2 * delta);
    }

    // Bullet movement
    if (bulletActive.current && bulletRef.current) {
      bulletRef.current.position.z += 20 * delta;
    }
  });

  return (
    <group ref={groupRef} position={initialPosition}>
      <group ref={bodyRotRef}>
        {!drivingVehicle ? (
          <group>
            <group position={[0, 1.2, 0]}>
              <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.4, 0.4, 1.2, 16]} />
                <meshStandardMaterial color={playerColor} />
              </mesh>
              <mesh position={[0, 1.6, 0]} castShadow>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#ffcaca" />
              </mesh>

              <group ref={leftArmRef} position={[-0.6, 1.0, 0]}>
                <mesh position={[0, -0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
                  <meshStandardMaterial color={playerColor} />
                </mesh>
              </group>
              <group ref={rightArmRef} position={[0.6, 1.0, 0]}>
                <mesh position={[0, -0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
                  <meshStandardMaterial color={playerColor} />
                </mesh>
                {/* Weapon model */}
                {weapon.equipped && (
                  <mesh position={[0, -0.3, -0.5]} rotation={[0, 0, -Math.PI / 2]}>
                    <boxGeometry args={[0.5, 0.1, 0.1]} />
                    <meshStandardMaterial color={WEAPONS[weapon.equipped]?.color || '#888'} />
                  </mesh>
                )}
              </group>
            </group>

            <group ref={leftLegRef} position={[-0.2, 1.2, 0]}>
              <mesh position={[0, -0.6, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
                <meshStandardMaterial color="#1e3a8a" />
              </mesh>
            </group>
            <group ref={rightLegRef} position={[0.2, 1.2, 0]}>
              <mesh position={[0, -0.6, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
                <meshStandardMaterial color="#1e3a8a" />
              </mesh>
            </group>

            {/* Bullet mesh */}
            <mesh ref={bulletRef} visible={false} position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
            </mesh>
          </group>
        ) : drivingVehicle?.type === 'car' ? (
          <RealisticCar color={drivingVehicle.color} />
        ) : null}
      </group>
    </group>
  );
};
