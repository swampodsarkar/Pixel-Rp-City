import * as THREE from 'three';

export const CELL_SIZE = 30;

export enum MapObj {
    NONE = 0,
    ROAD = 1,
    BUILDING_CITY = 2,
    BUILDING_VILLAGE = 3,
    TREE = 4,
}

function hash(x: number, y: number) {
    return Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
}

export const mapConfig = (() => {
    const cityBuildings: THREE.Matrix4[] = [];
    const villageBuildings: THREE.Matrix4[] = [];
    const treeLeaves: THREE.Matrix4[] = [];
    const treeTrunks: THREE.Matrix4[] = [];
    
    const gridSize = 100; // -100 to 100 => 200 units of 30m = 6000x6000 area
    const colGrid = new Map<string, { type: MapObj, x: number, z: number, rx: number, rz: number }>();

    for(let gx = -gridSize; gx <= gridSize; gx++) {
        for(let gz = -gridSize; gz <= gridSize; gz++) {
            const cx = gx * CELL_SIZE;
            const cz = gz * CELL_SIZE;
            
            // Main intersection and wider roads
            // The road plane is 90 units wide. Cell size is 30.
            // That means gx from -1 to 1 and gz from -1 to 1 are roughly on the road.
            // Let's add a safe margin of 2 cells to keep trees completely off the road and shoulder.
            if (Math.abs(gx) <= 2 || Math.abs(gz) <= 2) {
                continue;
            }
            // Secondary roads every 10 cells
            if (Math.abs(gx % 10) <= 1 || Math.abs(gz % 10) <= 1) {
                 continue;
            }

            const h = hash(gx, gz);
            const q = new THREE.Quaternion();
            
            if (gx > 0 && gz < 0) {
                // FOREST (North-East)
                if (h > 0.1) {
                    const tx = cx + (h - 0.5) * 15;
                    const tz = cz + (hash(gz, gx) - 0.5) * 15;
                    const scaleY = 1 + h * 2;
                    
                    const sLeaf = new THREE.Vector3(1 + h, scaleY, 1 + h);
                    const leafMatrix = new THREE.Matrix4();
                    leafMatrix.compose(new THREE.Vector3(tx, scaleY * 4 + 2, tz), q, sLeaf);
                    treeLeaves.push(leafMatrix);
                    
                    const sTrunk = new THREE.Vector3(1 + h, scaleY, 1 + h);
                    const trunkMatrix = new THREE.Matrix4();
                    trunkMatrix.compose(new THREE.Vector3(tx, scaleY * 2, tz), q, sTrunk);
                    treeTrunks.push(trunkMatrix);

                    colGrid.set(`${gx},${gz}`, { type: MapObj.TREE, x: tx, z: tz, rx: 1 + h, rz: 1 + h });
                }
            } else if (gx > 0 && gz > 0) {
                // CITY (South-East)
                if (h > 0.3) {
                    const scaleY = 25 + h * 50; // Tall buildings (2x)
                    const sx = 14 + h * 10;
                    const sz = 14 + hash(gz, gx) * 10;
                    const s = new THREE.Vector3(sx, scaleY, sz);
                    const matrix = new THREE.Matrix4();
                    matrix.compose(new THREE.Vector3(cx, scaleY / 2, cz), q, s);
                    cityBuildings.push(matrix);
                    
                    colGrid.set(`${gx},${gz}`, { type: MapObj.BUILDING_CITY, x: cx, z: cz, rx: sx/2, rz: sz/2 });
                }
            } else {
                // VILLAGE / COUNTRYSIDE (West)
                if (h > 0.8) {
                    // Village House
                    const scaleY = 6 + h * 5; 
                    const sx = 18;
                    const sz = 18;
                    const s = new THREE.Vector3(sx, scaleY, sz);
                    const matrix = new THREE.Matrix4();
                    matrix.compose(new THREE.Vector3(cx, scaleY / 2, cz), q, s);
                    villageBuildings.push(matrix);
                    
                    colGrid.set(`${gx},${gz}`, { type: MapObj.BUILDING_VILLAGE, x: cx, z: cz, rx: sx/2, rz: sz/2 });
                } else if (h > 0.5) {
                    // Few trees
                    const tx = cx + (h - 0.5) * 15;
                    const tz = cz + (hash(gz, gx) - 0.5) * 15;
                    const scaleY = 1 + h;
                    
                    const sLeaf = new THREE.Vector3(1 + h, scaleY, 1 + h);
                    const leafMatrix = new THREE.Matrix4();
                    leafMatrix.compose(new THREE.Vector3(tx, scaleY * 4 + 2, tz), q, sLeaf);
                    treeLeaves.push(leafMatrix);
                    
                    const sTrunk = new THREE.Vector3(1 + h, scaleY, 1 + h);
                    const trunkMatrix = new THREE.Matrix4();
                    trunkMatrix.compose(new THREE.Vector3(tx, scaleY * 2, tz), q, sTrunk);
                    treeTrunks.push(trunkMatrix);

                    colGrid.set(`${gx},${gz}`, { type: MapObj.TREE, x: tx, z: tz, rx: 1 + h, rz: 1 + h });
                }
            }
        }
    }
    
    return { colGrid, cityBuildings, villageBuildings, treeLeaves, treeTrunks };
})();

export function checkCollision(x: number, z: number, radius: number = 1.5): boolean {
    const gx = Math.floor(x / CELL_SIZE + 0.5);
    const gz = Math.floor(z / CELL_SIZE + 0.5);
    
    // Check current and adjacent 8 cells to cover edges
    for(let dx = -1; dx <= 1; dx++) {
        for(let dz = -1; dz <= 1; dz++) {
            const cell = mapConfig.colGrid.get(`${gx + dx},${gz + dz}`);
            if (cell) {
                // AABB or Circle collision
                if (cell.type === MapObj.TREE) {
                    const dist = Math.hypot(cell.x - x, cell.z - z);
                    // trees have approx radius of 2
                    if (dist < 2.0 + radius) return true;
                } else {
                    // Box collision for buildings
                    const minX = cell.x - cell.rx;
                    const maxX = cell.x + cell.rx;
                    const minZ = cell.z - cell.rz;
                    const maxZ = cell.z + cell.rz;
                    
                    if (x + radius > minX && x - radius < maxX && z + radius > minZ && z - radius < maxZ) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
