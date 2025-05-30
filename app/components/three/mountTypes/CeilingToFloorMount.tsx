import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingToFloorMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  useTopShelf = false,
  //roomGeometry,
  //whiteRoomMaterial,
  shelfGeometry,
  shelfMaterial,
  //ripGeometry,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model2Geometry,
  model12Geometry,
  materialGold,
  addHorizontalConnectingRips,
  addFrontToBackRips,
}: MountTypeProps & {
  model1Geometry: THREE.BufferGeometry;
  model2Geometry: THREE.BufferGeometry;
  model12Geometry: THREE.BufferGeometry;
  materialGold: THREE.Material;
  addHorizontalConnectingRips: (
    baseHeight: number,
    positions: { x: number; z: number }[]
  ) => void;
  addFrontToBackRips: (
    baseHeight: number,
    positions: { x: number; z: number }[]
  ) => void;
}) => {
  const topShelfHeight = userHeight || 1195;
  const shelfSpacing = 250;

  // Add shelves with their connectors
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = topShelfHeight - i * shelfSpacing;

    // Normal shelf
    const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelfMesh.position.set(
      barCount === 2 ? -shelfWidth : 0,
      currentHeight,
      zOffset
    );
    scene.add(shelfMesh);

    if (barCount === 2) {
      // Second shelf
      const secondShelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      secondShelfMesh.position.set(0, currentHeight, zOffset);
      scene.add(secondShelfMesh);
    }

    // Connection positions
    const positions = barCount === 2
      ? [
          { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
          { x: 0, z: shelfBoundingBox.min.z + 5 },
          { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
          { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
          { x: 0, z: shelfBoundingBox.max.z - 5 },
          { x: shelfWidth, z: shelfBoundingBox.max.z - 5 },
        ]
      : [
          { x: 0, z: shelfBoundingBox.min.z + 5 },
          { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
          { x: 0, z: shelfBoundingBox.max.z - 5 },
          { x: shelfWidth, z: shelfBoundingBox.max.z - 5 },
        ];

    positions.forEach((pos) => {
      // Add regular connectors
      const isMiddleConnector = pos.x === 0;
      const connectorGeometry = isMiddleConnector && showCrossbars
        ? model2Geometry
        : model1Geometry;

      const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
      connectorMesh.scale.set(1.5, 1.5, 1.5);

      // Öndeki model 1'leri 180 derece, arkadakileri 90 derece döndür
      if (pos.z === shelfBoundingBox.min.z + 5) {
        connectorMesh.rotation.y = Math.PI + Math.PI / 2;
      } else {
        connectorMesh.rotation.y = Math.PI / 2;
      }

      // Arka model 1'leri öne kaydır
      let zPos = pos.z + zOffset + 5;
      if (pos.z === shelfBoundingBox.max.z - 5) {
        zPos -= 20;
      }
      if (pos.z === shelfBoundingBox.min.z + 5) {
        zPos += 5;
      }

      connectorMesh.position.set(
        pos.x,
        currentHeight,
        zPos
      );
      scene.add(connectorMesh);

      // Add vertical rips
      if (i === 0) {
        // For the first iteration, add full-height rips
        const verticalRipGeometry = new THREE.BoxGeometry(10, 1500, 10);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
        verticalRip.position.set(pos.x, 750, pos.z + zOffset);
        scene.add(verticalRip);

        // Add ceiling connector
        const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
        ceilingConnector.scale.set(1.5, 1.5, 1.5);
        ceilingConnector.rotation.x = Math.PI;
        ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
        scene.add(ceilingConnector);

        // Add floor connector
        const floorConnector = new THREE.Mesh(model12Geometry, materialGold);
        floorConnector.scale.set(1.5, 1.5, 1.5);
        floorConnector.position.set(pos.x, 0, pos.z + zOffset);
        scene.add(floorConnector);
      }
    });

    // Add horizontal connecting rips if showCrossbars is true
    if (showCrossbars) {
      const frontPositions = positions.filter(
        (pos) => pos.z === shelfBoundingBox.min.z + 5
      );
      const backPositions = positions.filter(
        (pos) => pos.z === shelfBoundingBox.max.z - 5
      );

      addHorizontalConnectingRips(currentHeight, frontPositions);
      addHorizontalConnectingRips(currentHeight, backPositions);
      addFrontToBackRips(currentHeight, positions);
    }
  }
}; 