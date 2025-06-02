import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingToWallMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  useTopShelf = false,
  shelfGeometry,
  shelfMaterial,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model11Geometry,
  materialGold,
}: MountTypeProps) => {
  const topShelfHeight = userHeight || 1195;
  const shelfSpacing = 250;
  const mountTop = 1500; // ceiling height

  // Calculate bottom shelf height
  const bottomShelfHeight = topShelfHeight - ((shelfQuantity + (useTopShelf ? 0 : 1) - 1) * shelfSpacing);

  // Calculate model1 dimensions for proper positioning
  let model1Height = 0;
  let model1Depth = 0;
  if (model1Geometry) {
    model1Geometry.computeBoundingBox();
    if (model1Geometry.boundingBox) {
      model1Height = model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model1Depth = model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  // Calculate total number of shelves
  const totalShelves = useTopShelf ? shelfQuantity : shelfQuantity + 1;

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

  // Add shelves with their connectors
  for (let i = 0; i < totalShelves; i++) {
    const currentHeight = topShelfHeight - i * shelfSpacing;
    const hasShelfAtThisLevel = useTopShelf || i > 0;

    // Add ceiling connectors and vertical rips only at the first iteration
    if (i === 0) {
      shelfPositions.forEach(shelfX => {
        const cornerPositions = [
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
        ];

        cornerPositions.forEach(pos => {
          // Add vertical rip to ceiling
          const verticalRipGeometry = new THREE.BoxGeometry(10, mountTop - bottomShelfHeight, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            pos.x,
            (mountTop + bottomShelfHeight) / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);

          // Add ceiling connector (Model 11)
          const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
          ceilingConnector.scale.set(1.5, 1.5, 1.5);
          ceilingConnector.rotation.x = Math.PI; // Rotate to point downward
          ceilingConnector.position.set(
            pos.x,
            mountTop,
            pos.z + zOffset
          );
          scene.add(ceilingConnector);
        });
      });
    }

    // Add shelf if:
    // - it's not the first iteration (i > 0) for "Do not use top as shelf"
    // - or if useTopShelf is true (add all shelves including top)
    if (hasShelfAtThisLevel) {
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
            const wallConnector = new THREE.Mesh(model11Geometry, materialGold);
            wallConnector.scale.set(1.5, 1.5, 1.5);
            wallConnector.rotation.z = Math.PI / 2;
            wallConnector.rotation.y = Math.PI / 2;
            wallConnector.position.set(
              pos.x,
              currentHeight + model1Height / 2 - 20,
              -1000
            );
            scene.add(wallConnector);

            // Add horizontal rip to wall
            const horizontalRipLength = Math.abs(-1000 - (pos.z + zOffset));
            const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
            horizontalRip.position.set(
              pos.x,
              currentHeight + model1Height / 2 - 20,
              -1000 + horizontalRipLength / 2
            );
            scene.add(horizontalRip);
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
  }
}; 