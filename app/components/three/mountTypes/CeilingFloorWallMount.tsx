import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingFloorWallMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  shelfGeometry,
  shelfMaterial,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model11Geometry,
  materialGold,
}: MountTypeProps) => {
  // Model 1 yüksekliğini hesapla
  let model1Height = 0;
  let model1Depth = 0;
  if (model1Geometry) {
    model1Geometry.computeBoundingBox();
    if (model1Geometry.boundingBox) {
      model1Height =
        model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model1Depth =
        model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  const floorHeight = 0; // Floor height in mm
  const ceilingHeight = 1500; // Ceiling height in mm
  const baseY = userHeight || 1195;
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

  // Calculate corner positions for each shelf
  const getAllCornerPositions = (): { x: number; z: number }[] => {
    const allCorners: { x: number; z: number }[] = [];
    shelfPositions.forEach((shelfX) => {
      const corners = [
        { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      ];
      allCorners.push(...corners);
    });
    return allCorners;
  };

  const adjustedCornerPositions = getAllCornerPositions();

  // Tavan ve taban bağlantıları
  adjustedCornerPositions.forEach((pos) => {
    // Tavan bağlantıları
    const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
    ceilingConnector.scale.set(1.5, 1.5, 1.5);
    ceilingConnector.rotation.x = Math.PI;
    ceilingConnector.position.set(pos.x, ceilingHeight, pos.z + zOffset);
    scene.add(ceilingConnector);

    // Dikey rip: en üst raftan tavana kadar
    const topShelfHeight = baseY - shelfSpacing;
    const topRipHeight = ceilingHeight - topShelfHeight;
    const verticalTopRipGeometry = new THREE.BoxGeometry(10, topRipHeight, 10);
    const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, materialGold);
    verticalTopRip.position.set(
      pos.x,
      topShelfHeight + topRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalTopRip);

    // Dikey rip: en alt raftan tabana kadar
    const bottomShelfHeight = baseY - ((shelfQuantity - 1) * shelfSpacing);
    const bottomRipHeight = bottomShelfHeight - floorHeight;
    const verticalBottomRipGeometry = new THREE.BoxGeometry(10, bottomRipHeight, 10);
    const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, materialGold);
    verticalBottomRip.position.set(
      pos.x,
      floorHeight + bottomRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalBottomRip);

    // Taban bağlantıları
    const floorConnector = new THREE.Mesh(model11Geometry, materialGold);
    floorConnector.scale.set(1.5, 1.5, 1.5);
    floorConnector.position.set(pos.x, floorHeight, pos.z + zOffset);
    scene.add(floorConnector);
  });

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

    // Her bir bay için rafları yerleştir
    shelfPositions.forEach((shelfX) => {
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight, zOffset);
      scene.add(shelfMesh);
    });

    // Her bay için köşe pozisyonlarını hesapla ve bağlantıları ekle
    shelfPositions.forEach((shelfX) => {
      const currentCornerPositions = [
        { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      ];

      currentCornerPositions.forEach((pos) => {
        // Duvar bağlantıları
        const wallConnector = new THREE.Mesh(model11Geometry, materialGold);
        wallConnector.scale.set(1.5, 1.5, 1.5);
        wallConnector.rotation.z = Math.PI / 2;
        wallConnector.rotation.y = Math.PI / 2;
        wallConnector.position.set(pos.x, currentHeight, -1000);
        scene.add(wallConnector);

        // Duvara yatay rip ekle
        const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
        const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
        horizontalRip.position.set(
          pos.x,
          currentHeight,
          (pos.z + zOffset - 1000) / 2
        );
        scene.add(horizontalRip);

        // Arka bağlantılar için Model 1
        if (pos.z === shelfBoundingBox.max.z - 5 + zOffset) {
          const backConnectorMesh = new THREE.Mesh(model1Geometry, materialGold);
          backConnectorMesh.scale.set(1.5, 1.5, 1.5);
          backConnectorMesh.rotation.y = Math.PI / 2;
          
          // Arka model 1'leri öne kaydır
          let backZPos = pos.z + 5;
          backZPos -= model1Depth + 20;

          backConnectorMesh.position.set(pos.x, currentHeight, backZPos);
          scene.add(backConnectorMesh);
        }

        // Dikey ripler
        if (i === shelfQuantity - 1) {
          // En alt raftan tabana kadar olan rip
          const ripHeight = currentHeight - floorHeight;
          const verticalRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            pos.x,
            floorHeight + ripHeight / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);
        } else {
          // Raflar arası normal ripler
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
    });

    // Crossbar'ları ekle
    if (showCrossbars) {
      // Her bay için arka crossbar'ları ekle
      shelfPositions.forEach((shelfX) => {
        const backPositions = [
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 }
        ];
        
        if (backPositions.length === 2) {
          const start = backPositions[0];
          const end = backPositions[1];
          let zStart = start.z + zOffset + 5;
          let zEnd = end.z + zOffset + 5;
          zStart -= model1Depth + 10;
          zEnd -= model1Depth + 10;

          const length = Math.abs(end.x - start.x);
          const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model1Height / 2 - 20,
            (zStart + zEnd) / 2
          );
          scene.add(horizontalRip);
        }

        // Kısa kenarlara yatay rip ekle
        const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
        const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
        const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

        // Sol kısa kenar
        let zFront = leftFront.z + zOffset + 5;
        let zBack = leftBack.z + zOffset + 5;
        zFront += model1Depth + 5;
        zBack -= model1Depth + 20;
        const leftLength = Math.abs(zBack - zFront);
        const leftRipGeometry = new THREE.BoxGeometry(10, 10, leftLength);
        const leftRip = new THREE.Mesh(leftRipGeometry, materialGold);
        leftRip.position.set(
          leftFront.x,
          currentHeight + model1Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightRipGeometry = new THREE.BoxGeometry(10, 10, leftLength);
        const rightRip = new THREE.Mesh(rightRipGeometry, materialGold);
        rightRip.position.set(
          rightFront.x,
          currentHeight + model1Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      });
    }
  }
}; 