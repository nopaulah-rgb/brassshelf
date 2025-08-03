import * as THREE from "three";

export interface MountTypeProps {
  scene: THREE.Scene;
  shelfQuantity: number;
  shelfSpacing?: number;
  barCount: number;
  showCrossbars: boolean;
  userHeight?: number;
  userWidth?: number;
  shelfDepth?: number;
  useTopShelf?: boolean;
  roomGeometry: {
    floor: THREE.PlaneGeometry;
    backWall: THREE.PlaneGeometry;
    ceiling: THREE.PlaneGeometry;
    counter: THREE.BoxGeometry;
    cabinetDoor: THREE.PlaneGeometry;
  };
  whiteRoomMaterial: THREE.Material;
  shelfGeometry: THREE.BufferGeometry;
  shelfMaterial: THREE.Material;
  ripGeometry: THREE.BufferGeometry;
  zOffset: number;
  shelfWidth: number;
  shelfBoundingBox: THREE.Box3;
  model1Geometry: THREE.BufferGeometry;
  model2Geometry: THREE.BufferGeometry;
  model11Geometry: THREE.BufferGeometry;
  model12Geometry: THREE.BufferGeometry;
  materialGold: THREE.Material;
  addHorizontalConnectingRips: (baseHeight: number, positions: { x: number; z: number }[]) => void;
  addFrontToBackRips: (baseHeight: number, positions: { x: number; z: number }[]) => void;
  frontBars?: boolean;
  verticalBarsAtBack?: boolean;
  pipeDiameter?: string;
  roomDepth?: number;
  roomHeight?: number;
  dynamicFloorY?: number;
  wallConnectionPoint?: string;
  selectedShelvesForBars?: number[];
}

export { handleCeilingMount } from "./mountTypes/CeilingMount";
export { handleWallToCounterMount } from "./mountTypes/WallToCounterMount";
export { handleWallToFloorMount } from "./mountTypes/WallToFloorMount";
export { handleWallMount } from "./mountTypes/WallMount";
export { handleCeilingToWallMount } from "./mountTypes/CeilingToWallMount";
export { handleCeilingToFloorMount } from "./mountTypes/CeilingToFloorMount";
export { handleCeilingToCounterMount } from "./mountTypes/CeilingToCounterMount";
export { handleCeilingToCounterToWallMount } from "./mountTypes/CeilingToCounterToWallMount";
export { handleCeilingFloorWallMount } from "./mountTypes/CeilingFloorWallMount";
