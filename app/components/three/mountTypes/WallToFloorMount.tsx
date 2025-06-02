import * as THREE from "three";
import { MountTypeProps } from "../MountTypes";

export const handleWallToFloorMount = ({
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
  model2Geometry,
  materialGold,
}: MountTypeProps) => {
  const topShelfHeight = userHeight || 1195;
  const shelfSpacing = 250;
  //const mountBase = 0; // floor height

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

  // Calculate shelf positions for multiple bays
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    if (barCount === 1) {
      positions.push(0);
    } else {
      // For multiple bays, arrange them side by side
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
    
    // Calculate actual shelf index (accounting for useTopShelf setting)
    const actualShelfIndex = useTopShelf ? currentIndex : currentIndex - 1;
    const actualTotalShelves = useTopShelf ? totalShelves : totalShelves - 1;
    
    // Only add wall connections for actual shelf levels
    if (actualShelfIndex < 0) return false;
    
    if (heightInInches <= 44) {
      // 0-44" height: Only top shelf connection (Tek duvar montesi)
      return actualShelfIndex === 0;
    } else if (heightInInches >= 45 && heightInInches <= 69) {
      // 45"-69" height: Top and bottom shelf connections (2 duvar bağlantısı)
      return actualShelfIndex === 0 || actualShelfIndex === actualTotalShelves - 1;
    } else {
      // 70"+ height: Top, middle, and bottom shelf connections (3 duvar bağlantısı)
      if (actualShelfIndex === 0 || actualShelfIndex === actualTotalShelves - 1) {
        return true;
      }
      // Find middle shelf position (rounded down for odd numbers, exact middle for even)
      const middleIndex = Math.floor((actualTotalShelves - 1) / 2);
      return actualShelfIndex === middleIndex;
    }
  };

  // Calculate total number of shelves
  const totalShelves = useTopShelf ? shelfQuantity : shelfQuantity + 1;

  // Add shelves with their connectors
  for (let i = 0; i < totalShelves; i++) {
    const currentHeight = topShelfHeight - i * shelfSpacing;
    const hasShelfAtThisLevel = useTopShelf || i > 0;

    if (hasShelfAtThisLevel) {
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
          if (pos.z === shelfBoundingBox.min.z + 5 && shouldAddWallConnection(i, totalShelves, topShelfHeight)) {
            // Add wall connector (Model 11)
            const wallConnector = new THREE.Mesh(model11Geometry, materialGold);
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

          // Dikey ripler (son raf değilse)
          if (i < totalShelves - 1) {
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
  }

  // Add floor connectors and vertical rips for each bay
  shelfPositions.forEach((shelfX) => {
    const cornerPositions = [
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
    ];

    cornerPositions.forEach((pos) => {
      // Dikey rip: en alt raftan yere kadar
      const bottomShelfHeight = topShelfHeight - ((totalShelves - 1) * shelfSpacing);
      const verticalBottomRipGeometry = new THREE.BoxGeometry(10, bottomShelfHeight, 10);
      const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, materialGold);
      verticalBottomRip.position.set(
        pos.x,
        bottomShelfHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalBottomRip);

      // Floor connectors
      const floorConnector = new THREE.Mesh(model11Geometry, materialGold);
      floorConnector.scale.set(1.5, 1.5, 1.5);
      floorConnector.position.set(pos.x, 0, pos.z + zOffset);
      scene.add(floorConnector);
    });

    // Add connecting piece between bays
    if (shelfX < shelfPositions[shelfPositions.length - 1]) {
      const nextShelfX = shelfPositions[shelfPositions.indexOf(shelfX) + 1];
      const backCenterConnector = new THREE.Mesh(model2Geometry, materialGold);
      backCenterConnector.scale.set(1.5, 1.5, 1.5);
      backCenterConnector.rotation.x = Math.PI / 2;
      backCenterConnector.rotation.y = Math.PI / 2;
      backCenterConnector.rotation.z = Math.PI / 2;
      backCenterConnector.position.set(
        (shelfX + nextShelfX) / 2,
        topShelfHeight + model1Height / 2 - 20,
        shelfBoundingBox.max.z + zOffset + 20
      );
      scene.add(backCenterConnector);
    }
  });
};