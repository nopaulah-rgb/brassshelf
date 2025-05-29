import * as THREE from "three";

export interface CabinetDoorProps {
  geometry: THREE.PlaneGeometry;
  material: THREE.Material;
  xPos: number;
}

export const createCabinetDoor = ({ geometry, material, xPos }: CabinetDoorProps) => {
  const door = new THREE.Mesh(geometry, material);
  door.position.set(xPos, 190, -199);
  door.rotateY(Math.PI);

  // Add door frame
  const edgeGeometry = new THREE.EdgesGeometry(door.geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xd3d3d3,
  });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  door.add(edges);

  // Add handle
  const handleGeometry = new THREE.BoxGeometry(10, 100, 5);
  const handle = new THREE.Mesh(handleGeometry, material);
  handle.position.set(220, 0, 2);
  door.add(handle);

  return door;
}; 