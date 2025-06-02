import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";
import { createCabinetDoor } from "../CabinetDoor";

export const handleWallToCounterMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  roomGeometry,
  whiteRoomMaterial,
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
      model1Height = model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model1Depth = model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  const counterHeight = 400; // Counter height in mm
  const baseY = userHeight || 1195;
  const shelfSpacing = 250;

  // Add counter and doors
  const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
  counter.position.set(0, 200, -600);
  scene.add(counter);

  const doorPositions = [-750, -250, 250, 750];
  doorPositions.forEach((xPos) => {
    const door = createCabinetDoor({ 
      geometry: roomGeometry.cabinetDoor, 
      material: whiteRoomMaterial, 
      xPos 
    });
    scene.add(door);
  });

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

  // Function to determine if wall connection should be added at this level
  const shouldAddWallConnection = (currentIndex: number, totalShelves: number, heightInMm: number) => {
    // Convert mm to inches for comparison
    const heightInInches = heightInMm / 25.4;
    
    if (heightInInches <= 44) {
      // Only top shelf connection (0-44 inches)
      return currentIndex === 0;
    } else if (heightInInches >= 45 && heightInInches <= 69) {
      // Top and bottom shelf connections (45-69 inches)
      return currentIndex === 0 || currentIndex === totalShelves - 1;
    } else {
      // Top, middle-ish, and bottom shelf connections (70+ inches)
      if (currentIndex === 0 || currentIndex === totalShelves - 1) {
        return true;
      }
      // Find middle shelf position (rounded down)
      const middleIndex = Math.floor((totalShelves - 1) / 2);
      return currentIndex === middleIndex;
    }
  };

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

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

        // Add wall connections for front positions
        if (pos.z === shelfBoundingBox.min.z + 5 && shouldAddWallConnection(i, shelfQuantity, baseY)) {
          // Add wall connector (Model 11)
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
        const backPositions = [
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 }
        ];

        if (backPositions.length === 2) {
          // Arka model 1'lerin yeni z konumlarını bul
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

  // En alttaki raftan tezgaha kadar olan dikey ripler ve bağlantılar
  shelfPositions.forEach((shelfX) => {
    const cornerPositions = [
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
    ];

    cornerPositions.forEach((pos) => {
      // Dikey rip: en alt raftan tezgaha kadar
      const bottomShelfHeight = baseY - ((shelfQuantity - 1) * shelfSpacing);
      const bottomRipHeight = bottomShelfHeight - counterHeight;
      const verticalBottomRipGeometry = new THREE.BoxGeometry(10, bottomRipHeight, 10);
      const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, materialGold);
      verticalBottomRip.position.set(
        pos.x,
        counterHeight + bottomRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalBottomRip);

      // Tezgah bağlantıları
      const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
      counterConnector.scale.set(1.5, 1.5, 1.5);
      counterConnector.position.set(pos.x, counterHeight, pos.z + zOffset);
      scene.add(counterConnector);
    });
  });
}; 