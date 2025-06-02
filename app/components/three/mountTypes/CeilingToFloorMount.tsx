import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingToFloorMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  //useTopShelf = false,
  //roomGeometry,
  //whiteRoomMaterial,
  shelfGeometry,
  shelfMaterial,
  //ripGeometry,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model12Geometry,
  materialGold,
}: MountTypeProps & {
  model1Geometry: THREE.BufferGeometry;
  model12Geometry: THREE.BufferGeometry;
  materialGold: THREE.Material;
}) => {
  // Model 1 yüksekliğini ve derinliğini hesapla
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

  const topShelfHeight = userHeight || 1195;
  const shelfSpacing = 250;
  const ceilingHeight = 1500;

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
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = topShelfHeight - i * shelfSpacing;

    // Her bir bay için rafları yerleştir
    shelfPositions.forEach((shelfX) => {
      // Raf ekleme
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

        // Dikey ripler (son raf değilse)
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

      // Crossbar'ları ekle
      if (showCrossbars) {
        // Arka crossbar
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

        // Sol ve sağ kısa kenarlar için ripler
        let zFront = leftFront.z + zOffset + 5;
        let zBack = leftBack.z + zOffset + 5;
        zFront += model1Depth + 5;
        zBack -= model1Depth + 20;
        const length = Math.abs(zBack - zFront);

        // Sol kısa kenar
        const leftRipGeometry = new THREE.BoxGeometry(10, 10, length);
        const leftRip = new THREE.Mesh(leftRipGeometry, materialGold);
        leftRip.position.set(
          leftFront.x,
          currentHeight + model1Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightRipGeometry = new THREE.BoxGeometry(10, 10, length);
        const rightRip = new THREE.Mesh(rightRipGeometry, materialGold);
        rightRip.position.set(
          rightFront.x,
          currentHeight + model1Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    });
  }

  // En üstteki raftan tavana ve en alttaki raftan yere kadar olan dikey ripler ve bağlantılar
  shelfPositions.forEach((shelfX) => {
    const cornerPositions = [
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
    ];

    cornerPositions.forEach((pos) => {
      // Dikey rip: en üst raftan tavana kadar
      const topShelfHeight = userHeight || 1195;
      const topRipHeight = ceilingHeight - topShelfHeight;
      const verticalTopRipGeometry = new THREE.BoxGeometry(10, topRipHeight, 10);
      const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, materialGold);
      verticalTopRip.position.set(
        pos.x,
        topShelfHeight + topRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalTopRip);

      // Dikey rip: en alt raftan yere kadar
      const bottomShelfHeight = topShelfHeight - ((shelfQuantity - 1) * shelfSpacing);
      const verticalBottomRipGeometry = new THREE.BoxGeometry(10, bottomShelfHeight, 10);
      const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, materialGold);
      verticalBottomRip.position.set(
        pos.x,
        bottomShelfHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalBottomRip);

      // Tavan bağlantıları
      const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
      ceilingConnector.scale.set(1.5, 1.5, 1.5);
      ceilingConnector.rotation.x = Math.PI;
      ceilingConnector.position.set(pos.x, ceilingHeight, pos.z + zOffset);
      scene.add(ceilingConnector);

      // Yer bağlantıları
      const floorConnector = new THREE.Mesh(model12Geometry, materialGold);
      floorConnector.scale.set(1.5, 1.5, 1.5);
      floorConnector.position.set(pos.x, 0, pos.z + zOffset);
      scene.add(floorConnector);
    });
  });
}; 