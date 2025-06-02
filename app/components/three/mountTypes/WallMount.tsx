import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";

export const handleWallMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  shelfGeometry,
  shelfMaterial,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model12Geometry,
  materialGold,
}: MountTypeProps) => {
  // Calculate Model 1 height and depth
  let model1Height = 0;
  let model1Depth = 0;
  if (model1Geometry) {
    model1Geometry.computeBoundingBox();
    if (model1Geometry.boundingBox) {
      model1Height = model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model1Depth = model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  const baseY = 1195;
  const shelfSpacing = 250;

  // Calculate shelf positions for multiple bars
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    if (barCount === 1) {
      positions.push(0);
    } else {
      // For multiple bars, arrange them side by side
      const startX = -(barCount - 1) * shelfWidth / 2;
      for (let i = 0; i < barCount; i++) {
        positions.push(startX + i * shelfWidth);
      }
    }
    return positions;
  };

  const shelfPositions = getShelfPositions(barCount);

  // Add shelves and connectors for each level
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

    // Add shelves for each bay position
    shelfPositions.forEach(shelfX => {
      // Add shelf
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight, zOffset);
      scene.add(shelfMesh);

      // Her bay için 4 köşeye model 1 ekle
      const cornerPositions = [
        { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      ];

      cornerPositions.forEach((pos) => {
        // Model 1
        const connectorMesh = new THREE.Mesh(model1Geometry, materialGold);
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
          zPos -= model1Depth + 20;
        }
        if (pos.z === shelfBoundingBox.min.z + 5) {
          zPos += model1Depth + 5;
        }

        connectorMesh.position.set(pos.x, currentHeight, zPos);
        scene.add(connectorMesh);

        // Add wall connector for front positions
        if (pos.z === shelfBoundingBox.min.z + 5) {
          const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
          wallConnector.scale.set(1.5, 1.5, 1.5);
          wallConnector.rotation.z = Math.PI / 2;
          wallConnector.rotation.y = Math.PI / 2;
          wallConnector.position.set(
            pos.x,
            currentHeight,
            -1000
          );
          scene.add(wallConnector);

          // Add horizontal rip to wall
          const horizontalRipLength = Math.abs(-1000 - (pos.z + zOffset));
          const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
          horizontalRip.position.set(
            pos.x,
            currentHeight,
            -1000 + horizontalRipLength / 2
          );
          scene.add(horizontalRip);
        }

        // Add vertical rips (if not the last shelf)
        if (i < shelfQuantity - 1) {
          const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            pos.x,
            currentHeight - shelfSpacing / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);
        }
      });

      // Add crossbars if enabled
      if (showCrossbars) {
        // Add horizontal connecting rips between bays
        if (shelfX < shelfPositions[shelfPositions.length - 1]) {
          const nextShelfX = shelfPositions[shelfPositions.indexOf(shelfX) + 1];
          const backRipLength = Math.abs(nextShelfX - shelfX);
          const backRipGeometry = new THREE.BoxGeometry(backRipLength, 10, 10);
          const backRip = new THREE.Mesh(backRipGeometry, materialGold);
          const backZPos = shelfBoundingBox.max.z + zOffset + 5 - model1Depth - 10;
          backRip.position.set(
            shelfX + backRipLength / 2,
            currentHeight + model1Height / 2 - 20,
            backZPos
          );
          scene.add(backRip);
        }

        // Add front-to-back rips
        const zFront = shelfBoundingBox.min.z + zOffset + 5;
        const zBack = shelfBoundingBox.max.z + zOffset + 5 - model1Depth - 10;
        const sideLength = Math.abs(zBack - zFront);
        const sideRipGeometry = new THREE.BoxGeometry(10, 10, sideLength);

        // Left side rip
        const leftRip = new THREE.Mesh(sideRipGeometry, materialGold);
        leftRip.position.set(
          shelfBoundingBox.min.x + 5 + shelfX,
          currentHeight + model1Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Right side rip
        const rightRip = new THREE.Mesh(sideRipGeometry, materialGold);
        rightRip.position.set(
          shelfBoundingBox.max.x - 5 + shelfX,
          currentHeight + model1Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    });
  }
};