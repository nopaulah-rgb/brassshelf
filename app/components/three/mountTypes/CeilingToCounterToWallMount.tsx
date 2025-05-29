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
    // Tavan bağlantıları
    const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
    ceilingConnector.scale.set(1.5, 1.5, 1.5);
    ceilingConnector.rotation.x = Math.PI;
    ceilingConnector.position.set(
      barCount === 2 ? pos.x - shelfWidth : pos.x,
      ceilingHeight,
      pos.z + zOffset
    );
    scene.add(ceilingConnector);

    // İkinci raf için tavan bağlantıları
    if (barCount === 2) {
      const secondCeilingConnector = new THREE.Mesh(
        model11Geometry,
        materialGold
      );
      secondCeilingConnector.scale.set(1.5, 1.5, 1.5);
      secondCeilingConnector.rotation.x = Math.PI;
      secondCeilingConnector.position.set(pos.x, ceilingHeight, pos.z + zOffset);
      scene.add(secondCeilingConnector);
    }

    // Dikey rip: en üst raftan tavana kadar
    const topShelfHeight = baseY - (useTopShelf ? 0 : shelfSpacing);
    const topRipHeight = ceilingHeight - topShelfHeight;
    const verticalTopRipGeometry = new THREE.BoxGeometry(10, topRipHeight, 10);
    const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, materialGold);
    verticalTopRip.position.set(
      barCount === 2 ? pos.x - shelfWidth : pos.x,
      topShelfHeight + topRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalTopRip);

    // İkinci raf için üst dikey ripler
    if (barCount === 2) {
      const secondVerticalTopRip = new THREE.Mesh(
        verticalTopRipGeometry,
        materialGold
      );
      secondVerticalTopRip.position.set(
        pos.x,
        topShelfHeight + topRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(secondVerticalTopRip);
    }

    // Dikey rip: en alt raftan tezgaha kadar
    const bottomShelfHeight = baseY - ((shelfQuantity - (useTopShelf ? 1 : 0)) * shelfSpacing);
    const bottomRipHeight = bottomShelfHeight - counterHeight;
    const verticalBottomRipGeometry = new THREE.BoxGeometry(10, bottomRipHeight, 10);
    const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, materialGold);
    verticalBottomRip.position.set(
      barCount === 2 ? pos.x - shelfWidth : pos.x,
      counterHeight + bottomRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalBottomRip);

    // İkinci raf için alt dikey ripler
    if (barCount === 2) {
      const secondVerticalBottomRip = new THREE.Mesh(
        verticalBottomRipGeometry,
        materialGold
      );
      secondVerticalBottomRip.position.set(
        pos.x,
        counterHeight + bottomRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(secondVerticalBottomRip);
    }

    // Tezgah bağlantıları
    const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
    counterConnector.scale.set(1.5, 1.5, 1.5);
    counterConnector.position.set(
      barCount === 2 ? pos.x - shelfWidth : pos.x,
      counterHeight,
      pos.z + zOffset
    );
    scene.add(counterConnector);

    // İkinci raf için tezgah bağlantıları
    if (barCount === 2) {
      const secondCounterConnector = new THREE.Mesh(
        model11Geometry,
        materialGold
      );
      secondCounterConnector.scale.set(1.5, 1.5, 1.5);
      secondCounterConnector.position.set(pos.x, counterHeight, pos.z + zOffset);
      scene.add(secondCounterConnector);
    }
  });

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

    // Raf ekleme koşulu:
    // - İlk raf değilse (i > 0) veya useTopShelf true ise ekle
    if (useTopShelf || i > 0) {
      // İlk rafı yerleştir
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(
        barCount === 2 ? -shelfWidth : 0,
        currentHeight,
        zOffset
      );
      scene.add(shelfMesh);

      // Eğer barCount 2 ise, ikinci rafı ekle
      if (barCount === 2) {
        const secondShelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
        secondShelfMesh.position.set(0, currentHeight, zOffset);
        scene.add(secondShelfMesh);
      }

      // 4 köşeye duvar bağlantıları ekle
      adjustedCornerPositions.forEach((pos) => {
        // Duvar bağlantıları
        const wallConnector = new THREE.Mesh(model11Geometry, materialGold);
        wallConnector.scale.set(1.5, 1.5, 1.5);
        wallConnector.rotation.z = Math.PI / 2;
        wallConnector.rotation.y = Math.PI / 2;
        wallConnector.position.set(
          barCount === 2 ? pos.x - shelfWidth : pos.x,
          currentHeight,
          -1000 // Duvara bağlantı için öne al
        );
        scene.add(wallConnector);

        // İkinci raf için duvar bağlantısı
        if (barCount === 2) {
          const secondWallConnector = new THREE.Mesh(model11Geometry, materialGold);
          secondWallConnector.scale.set(1.5, 1.5, 1.5);
          secondWallConnector.rotation.z = Math.PI / 2;
          secondWallConnector.rotation.y = Math.PI / 2;
          secondWallConnector.position.set(pos.x, currentHeight, -1000);
          scene.add(secondWallConnector);
        }

        // Duvara yatay rip ekle
        const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
        const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
        horizontalRip.position.set(
          barCount === 2 ? pos.x - shelfWidth : pos.x,
          currentHeight,
          (pos.z + zOffset - 1000) / 2
        );
        scene.add(horizontalRip);

        // İkinci raf için yatay rip
        if (barCount === 2) {
          const secondHorizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
          secondHorizontalRip.position.set(
            pos.x,
            currentHeight,
            (pos.z + zOffset - 1000) / 2
          );
          scene.add(secondHorizontalRip);
        }

        // Arka bağlantılar için Model 1
        if (pos.z === shelfBoundingBox.max.z - 5) {
          const backConnectorMesh = new THREE.Mesh(model1Geometry, materialGold);
          backConnectorMesh.scale.set(1.5, 1.5, 1.5);
          backConnectorMesh.rotation.y = Math.PI / 2;
          
          // Arka model 1'leri öne kaydır
          let backZPos = pos.z + zOffset + 5;
          backZPos -= model1Depth + 20;

          backConnectorMesh.position.set(
            barCount === 2 ? pos.x - shelfWidth : pos.x,
            currentHeight,
            backZPos
          );
          scene.add(backConnectorMesh);

          // İkinci raf için arka Model 1'ler
          if (barCount === 2) {
            const secondBackConnectorMesh = new THREE.Mesh(model1Geometry, materialGold);
            secondBackConnectorMesh.scale.set(1.5, 1.5, 1.5);
            secondBackConnectorMesh.rotation.y = Math.PI / 2;
            secondBackConnectorMesh.position.set(pos.x, currentHeight, backZPos);
            scene.add(secondBackConnectorMesh);
          }
        }

        // Dikey ripler
        if (i === shelfQuantity - 1) {
          // En alt raftan tezgaha kadar olan rip
          const ripHeight = currentHeight - counterHeight;
          const verticalRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            barCount === 2 ? pos.x - shelfWidth : pos.x,
            counterHeight + ripHeight / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);

          // İkinci raf için dikey rip
          if (barCount === 2) {
            const secondVerticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
            secondVerticalRip.position.set(
              pos.x,
              counterHeight + ripHeight / 2,
              pos.z + zOffset
            );
            scene.add(secondVerticalRip);
          }
        } else {
          // Raflar arası normal ripler
          const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
          verticalRip.position.set(
            barCount === 2 ? pos.x - shelfWidth : pos.x,
            currentHeight - shelfSpacing / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);

          // İkinci raf için dikey ripler
          if (barCount === 2) {
            const secondVerticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
            secondVerticalRip.position.set(
              pos.x,
              currentHeight - shelfSpacing / 2,
              pos.z + zOffset
            );
            scene.add(secondVerticalRip);
          }
        }
      });

      // Crossbar'ları ekle
      if (showCrossbars) {
        const backPositions = adjustedCornerPositions.filter(
          (pos) => pos.z === shelfBoundingBox.max.z - 5
        );
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
          const horizontalRip = new THREE.Mesh(
            horizontalRipGeometry,
            materialGold
          );
          horizontalRip.position.set(
            barCount === 2
              ? start.x - shelfWidth + (end.x - start.x) / 2
              : start.x + (end.x - start.x) / 2,
            currentHeight + model1Height / 2 - 20,
            (zStart + zEnd) / 2
          );
          scene.add(horizontalRip);

          // İkinci raf için arka yatay rip
          if (barCount === 2) {
            const secondHorizontalRip = new THREE.Mesh(
              horizontalRipGeometry,
              materialGold
            );
            secondHorizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model1Height / 2 - 20,
              (zStart + zEnd) / 2
            );
            scene.add(secondHorizontalRip);
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

        if (leftFront && leftBack) {
          let zFront = leftFront.z + zOffset + 5;
          let zBack = leftBack.z + zOffset + 5;
          zFront += model1Depth + 5;
          zBack -= model1Depth + 20;
          const length = Math.abs(zBack - zFront);
          const shortRipGeometry = new THREE.BoxGeometry(10, 10, length);
          const shortRip = new THREE.Mesh(shortRipGeometry, materialGold);
          shortRip.position.set(
            barCount === 2 ? leftFront.x - shelfWidth : leftFront.x,
            currentHeight + model1Height / 2 - 18,
            zFront + (zBack - zFront) / 2
          );
          scene.add(shortRip);

          // İkinci raf için sol kısa rip
          if (barCount === 2) {
            const secondShortRip = new THREE.Mesh(
              shortRipGeometry,
              materialGold
            );
            secondShortRip.position.set(
              leftFront.x,
              currentHeight + model1Height / 2 - 18,
              zFront + (zBack - zFront) / 2
            );
            scene.add(secondShortRip);
          }
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
            barCount === 2 ? rightFront.x - shelfWidth : rightFront.x,
            currentHeight + model1Height / 2 - 5,
            zFront + (zBack - zFront) / 2
          );
          scene.add(shortRip);

          // İkinci raf için sağ kısa rip
          if (barCount === 2) {
            const secondShortRip = new THREE.Mesh(
              shortRipGeometry,
              materialGold
            );
            secondShortRip.position.set(
              rightFront.x,
              currentHeight + model1Height / 2 - 5,
              zFront + (zBack - zFront) / 2
            );
            scene.add(secondShortRip);
          }
        }
      }
    }
  }
};