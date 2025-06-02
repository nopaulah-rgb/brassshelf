import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";
import { createCabinetDoor } from "../CabinetDoor";

export const handleCeilingToCounterToWallMount = ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  useTopShelf = false,
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
      model1Height =
        model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model1Depth =
        model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  const counterHeight = 400; // Counter height in mm
  const ceilingHeight = 1500; // Ceiling height in mm
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

  // Köşe pozisyonlarını hesapla
  const adjustedCornerPositions = [
    { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.min.z + 5 },
    { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.min.z + 5 },
    { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.max.z - 5 },
    { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.max.z - 5 },
  ];

  // Tavan ve tezgah bağlantıları
  adjustedCornerPositions.forEach((pos) => {
    // Her bay için tavan bağlantıları ekle
    for (let bay = 0; bay < barCount; bay++) {
      const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
      ceilingConnector.scale.set(1.5, 1.5, 1.5);
      ceilingConnector.rotation.x = Math.PI;
      ceilingConnector.position.set(
        pos.x - (bay * shelfWidth),
        ceilingHeight,
        pos.z + zOffset
      );
      scene.add(ceilingConnector);

      // Dikey rip: en üst raftan tavana kadar
      const topShelfHeight = baseY - (useTopShelf ? 0 : shelfSpacing);
      const topRipHeight = ceilingHeight - topShelfHeight;
      const verticalTopRipGeometry = new THREE.BoxGeometry(10, topRipHeight, 10);
      const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, materialGold);
      verticalTopRip.position.set(
        pos.x - (bay * shelfWidth),
        topShelfHeight + topRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalTopRip);

      // Dikey rip: en alt raftan tezgaha kadar
      const bottomShelfHeight = baseY - ((shelfQuantity - (useTopShelf ? 1 : 0)) * shelfSpacing);
      const bottomRipHeight = bottomShelfHeight - counterHeight;
      const verticalBottomRipGeometry = new THREE.BoxGeometry(10, bottomRipHeight, 10);
      const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, materialGold);
      verticalBottomRip.position.set(
        pos.x - (bay * shelfWidth),
        counterHeight + bottomRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalBottomRip);

      // Tezgah bağlantıları
      const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
      counterConnector.scale.set(1.5, 1.5, 1.5);
      counterConnector.position.set(
        pos.x - (bay * shelfWidth),
        counterHeight,
        pos.z + zOffset
      );
      scene.add(counterConnector);
    }
  });

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

    // Her bay için raf ekle
    for (let bay = 0; bay < barCount; bay++) {
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(
        -(bay * shelfWidth),
        currentHeight,
        zOffset
      );
      scene.add(shelfMesh);

      // 4 köşeye duvar bağlantıları ekle
      adjustedCornerPositions.forEach((pos) => {
        // Duvar bağlantıları
        const wallConnector = new THREE.Mesh(model11Geometry, materialGold);
        wallConnector.scale.set(1.5, 1.5, 1.5);
        wallConnector.rotation.z = Math.PI / 2;
        wallConnector.rotation.y = Math.PI / 2;
        wallConnector.position.set(
          pos.x - (bay * shelfWidth),
          currentHeight,
          -1000 // Duvara bağlantı için öne al
        );
        scene.add(wallConnector);

        // Duvara yatay rip ekle
        const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
        const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
        horizontalRip.position.set(
          pos.x - (bay * shelfWidth),
          currentHeight,
          (pos.z + zOffset - 1000) / 2
        );
        scene.add(horizontalRip);

        // Arka bağlantılar için Model 1
        if (pos.z === shelfBoundingBox.max.z - 5) {
          const backConnectorMesh = new THREE.Mesh(model1Geometry, materialGold);
          backConnectorMesh.scale.set(1.5, 1.5, 1.5);
          backConnectorMesh.rotation.y = Math.PI / 2;
          
          // Arka model 1'leri öne kaydır
          let backZPos = pos.z + zOffset + 5;
          backZPos -= model1Depth + 20;

          backConnectorMesh.position.set(
            pos.x - (bay * shelfWidth),
            currentHeight,
            backZPos
          );
          scene.add(backConnectorMesh);
        }

        // Dikey ripler
        if (i === shelfQuantity - 1) {
          // En alt raftan tezgaha kadar olan rip
          const ripHeight = currentHeight - counterHeight;
          const verticalRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            pos.x - (bay * shelfWidth),
            counterHeight + ripHeight / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);
        } else {
          // Raflar arası normal ripler
          const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            pos.x - (bay * shelfWidth),
            currentHeight - shelfSpacing / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);
        }
      });
    }

    // Crossbar'ları ekle
    if (showCrossbars) {
      const backPositions = adjustedCornerPositions.filter(
        (pos) => pos.z === shelfBoundingBox.max.z - 5
      );
      if (backPositions.length === 2) {
        // Her bay için arka crossbar'ları ekle
        for (let bay = 0; bay < barCount; bay++) {
          const start = backPositions[0];
          const end = backPositions[1];
          let zStart = start.z + zOffset + 5;
          let zEnd = end.z + zOffset + 5;
          zStart -= model1Depth + 10;
          zEnd -= model1Depth + 10;

          const length = Math.abs(end.x - start.x);
          const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
          const horizontalRip = new THREE.Mesh(
            horizontalRipGeometry,
            materialGold
          );
          horizontalRip.position.set(
            start.x - (bay * shelfWidth) + (end.x - start.x) / 2,
            currentHeight + model1Height / 2 - 20,
            (zStart + zEnd) / 2
          );
          scene.add(horizontalRip);
        }
      }

      // Kısa kenarlara yatay rip ekle
      const leftFront = adjustedCornerPositions.find(
        (pos) =>
          pos.x === shelfBoundingBox.min.x + 5 &&
          pos.z === shelfBoundingBox.min.z + 5
      );
      const leftBack = adjustedCornerPositions.find(
        (pos) =>
          pos.x === shelfBoundingBox.min.x + 5 &&
          pos.z === shelfBoundingBox.max.z - 5
      );
      const rightFront = adjustedCornerPositions.find(
        (pos) =>
          pos.x === shelfBoundingBox.max.x - 5 &&
          pos.z === shelfBoundingBox.min.z + 5
      );
      const rightBack = adjustedCornerPositions.find(
        (pos) =>
          pos.x === shelfBoundingBox.max.x - 5 &&
          pos.z === shelfBoundingBox.max.z - 5
      );

      // Her bay için kısa kenar ripleri ekle
      for (let bay = 0; bay < barCount; bay++) {
        if (leftFront && leftBack) {
          let zFront = leftFront.z + zOffset + 5;
          let zBack = leftBack.z + zOffset + 5;
          zFront += model1Depth + 5;
          zBack -= model1Depth + 20;
          const length = Math.abs(zBack - zFront);
          const shortRipGeometry = new THREE.BoxGeometry(10, 10, length);
          const shortRip = new THREE.Mesh(shortRipGeometry, materialGold);
          shortRip.position.set(
            leftFront.x - (bay * shelfWidth),
            currentHeight + model1Height / 2 - 18,
            zFront + (zBack - zFront) / 2
          );
          scene.add(shortRip);
        }

        if (rightFront && rightBack) {
          let zFront = rightFront.z + zOffset + 5;
          let zBack = rightBack.z + zOffset + 5;
          zFront += model1Depth + 5;
          zBack -= model1Depth + 20;
          const length = Math.abs(zBack - zFront);
          const shortRipGeometry = new THREE.BoxGeometry(10, 10, length);
          const shortRip = new THREE.Mesh(shortRipGeometry, materialGold);
          shortRip.position.set(
            rightFront.x - (bay * shelfWidth),
            currentHeight + model1Height / 2 - 5,
            zFront + (zBack - zFront) / 2
          );
          scene.add(shortRip);
        }
      }
    }
  }
};