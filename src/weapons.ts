export interface WeaponDef {
  name: string;
  damage: number;
  range: number;
  fireRate: number;
  color: string;
  ammo: number;
}

export const WEAPONS: Record<string, WeaponDef> = {
  pistol: {
    name: 'Pistol', damage: 15, range: 60,
    fireRate: 400, color: '#a855f7', ammo: 30
  },
  shotgun: {
    name: 'Shotgun', damage: 35, range: 35,
    fireRate: 800, color: '#ef4444', ammo: 12
  },
  rifle: {
    name: 'Rifle', damage: 10, range: 100,
    fireRate: 150, color: '#22d3ee', ammo: 60
  },
};

export const WEAPON_LIST = Object.keys(WEAPONS);

export const WEAPON_PICKUPS: { x: number; z: number; weapon: string }[] = [
  { x: 80, z: 80, weapon: 'pistol' },
  { x: -80, z: -80, weapon: 'shotgun' },
  { x: 50, z: -120, weapon: 'rifle' },
  { x: -150, z: 60, weapon: 'pistol' },
  { x: 180, z: -50, weapon: 'shotgun' },
  { x: -60, z: 180, weapon: 'rifle' },
];
