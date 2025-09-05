/* eslint-disable @typescript-eslint/no-unused-vars */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

// Freestanding: floor-anchored system without any ceiling connections
export const handleFreestandingMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0,
  showCrossbars,
  userHeight,
  userWidth,
  shelfGeometry,
  shelfMaterial,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model11Geometry,
  model12Geometry,
  materialGold,
  addHorizontalConnectingRips,
  addFrontToBackRips,
  frontBars,
  backBars,
  verticalBarsAtBack,
  pipeDiameter,
  roomDepth = 1200,
  roomHeight = 1500,
  dynamicFloorY = 0,
  wallConnectionPoint = ['all'],
  selectedShelvesForBars = [],
  selectedBackShelvesForBars = [],
}: MountTypeProps) => {
  void showCrossbars;

  // Determine whether to add wall connections for a given shelf index
  const shouldAddWallConnection = (currentShelfIndex: number, totalShelves: number) => {
    if (wallConnectionPoint.includes('all')) return true;
    if (wallConnectionPoint.includes('top') && currentShelfIndex === totalShelves - 1) return true;
    const shelfId = `shelf-${currentShelfIndex + 1}`;
    if (wallConnectionPoint.includes(shelfId)) return true;
    if (wallConnectionPoint.includes('first') && currentShelfIndex === 0) return true;
    if (wallConnectionPoint.includes('second') && currentShelfIndex === 1 && totalShelves > 1) return true;
    if (wallConnectionPoint.includes('third') && currentShelfIndex === 2 && totalShelves > 2) return true;
    return false;
  };

  // Load GLBs used for connectors similar to ceiling-to-floor implementation
  const loader = new GLTFLoader();

  let model13Geometry: THREE.BufferGeometry | null = null;
  let model13Material: THREE.Material | null = null;
  let model13Height = 0;
  let model13Depth = 0;

  try {
    const gltf = await loader.loadAsync('/models/model13.glb');
    let foundGeometry = false;
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && !foundGeometry) {
        model13Geometry = child.geometry.clone() as THREE.BufferGeometry;
        const originalMaterial = child.material as THREE.Material;
        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          const clonedMaterial = originalMaterial.clone();
          clonedMaterial.metalness = 0.6;
          clonedMaterial.roughness = 0.4;
          clonedMaterial.envMapIntensity = 1.0;
          if (clonedMaterial.color.r < 0.3 && clonedMaterial.color.g < 0.3 && clonedMaterial.color.b < 0.3) {
            clonedMaterial.color.setHex(0xaaaaaa);
          }
          model13Material = clonedMaterial;
        } else {
          model13Material = originalMaterial;
        }
        foundGeometry = true;
      }
    });
    if (model13Geometry) {
      (model13Geometry as THREE.BufferGeometry).computeBoundingBox();
      if ((model13Geometry as THREE.BufferGeometry).boundingBox) {
        model13Height = (model13Geometry as THREE.BufferGeometry).boundingBox!.max.y - (model13Geometry as THREE.BufferGeometry).boundingBox!.min.y;
        model13Depth = (model13Geometry as THREE.BufferGeometry).boundingBox!.max.z - (model13Geometry as THREE.BufferGeometry).boundingBox!.min.z;
      }
    }
  } catch (error) {
    console.error('Model13.glb yüklenemedi:', error);
  }

  // Type16A v2.glb for front/back connectors when horizontal bars are off
  let type16AGeometry: THREE.BufferGeometry | null = null;
  let type16AMaterial: THREE.Material | null = null;
  try {
    const type16AGLTF = await loader.loadAsync('/models/Type16A v2.glb');
    let foundType16A = false;
    type16AGLTF.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && !foundType16A) {
        type16AGeometry = child.geometry.clone() as THREE.BufferGeometry;
        const originalMaterial = child.material as THREE.Material;
        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          const clonedMaterial = originalMaterial.clone();
          clonedMaterial.metalness = 0.6;
          clonedMaterial.roughness = 0.4;
          clonedMaterial.envMapIntensity = 1.0;
          type16AMaterial = clonedMaterial;
        } else {
          type16AMaterial = originalMaterial;
        }
        foundType16A = true;
      }
    });
  } catch (error) {
    console.error('Type16A v2.glb yüklenemedi:', error);
  }

  // Type16E v1.glb to reuse as floor connector (as in ceiling-to-floor)
  let type16EGeometry: THREE.BufferGeometry | null = null;
  let type16EMaterial: THREE.Material | null = null;
  try {
    const type16EGLTF = await loader.loadAsync('/models/Type16E v1.glb');
    let foundType16E = false;
    type16EGLTF.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && !foundType16E) {
        type16EGeometry = child.geometry.clone() as THREE.BufferGeometry;
        const originalMaterial = child.material as THREE.Material;
        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          const clonedMaterial = originalMaterial.clone();
          clonedMaterial.metalness = 0.6;
          clonedMaterial.roughness = 0.4;
          clonedMaterial.envMapIntensity = 1.0;
          type16EMaterial = clonedMaterial;
        } else {
          type16EMaterial = originalMaterial;
        }
        foundType16E = true;
      }
    });
  } catch (error) {
    console.error('Type16E v1.glb yüklenemedi:', error);
  }

  // Type16F v1.glb for wall connections (optional)
  let type16FGeometry: THREE.BufferGeometry | null = null;
  let type16FMaterial: THREE.Material | null = null;
  try {
    const type16FGLTF = await loader.loadAsync('/models/Type16F v1.glb');
    let foundType16F = false;
    type16FGLTF.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && !foundType16F) {
        type16FGeometry = child.geometry.clone() as THREE.BufferGeometry;
        const originalMaterial = child.material as THREE.Material;
        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          const clonedMaterial = originalMaterial.clone();
          clonedMaterial.metalness = 0.6;
          clonedMaterial.roughness = 0.4;
          clonedMaterial.envMapIntensity = 1.0;
          type16FMaterial = clonedMaterial;
        } else {
          type16FMaterial = originalMaterial;
        }
        foundType16F = true;
      }
    });
  } catch (error) {
    console.error('Type16F v1.glb yüklenemedi:', error);
  }

  // Fallbacks
  if (!model13Geometry && model1Geometry) {
    model13Geometry = model1Geometry;
    model1Geometry.computeBoundingBox();
    if (model1Geometry.boundingBox) {
      model13Height = model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model13Depth = model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  const floorHeight = 0 + dynamicFloorY; // respect dynamic floor offset
  // Lower default height. Grow with number of shelves by stacking downward from top.
  const baseYUser = userHeight ?? 500; // default lower than previous
  const adjustedBaseY = shelfQuantity > 1 ? baseYUser + (shelfQuantity - 1) * shelfSpacing : baseYUser;

  const pipeRadius = pipeDiameter === '1' ? 16 : 12;

  const getShelfPositions = (barCount: number) => {
    const positions: number[] = [];
    const effectiveWidth = userWidth || shelfWidth;
    if (barCount === 1) {
      positions.push(0);
    } else {
      if (baySpacing === 0) {
        const startX = -(barCount - 1) * effectiveWidth / 2;
        for (let i = 0; i < barCount; i++) positions.push(startX + i * effectiveWidth);
      } else {
        const totalSpacing = (barCount - 1) * baySpacing;
        const totalWidth = (barCount * effectiveWidth) + totalSpacing;
        const startX = -totalWidth / 2 + effectiveWidth / 2;
        for (let i = 0; i < barCount; i++) positions.push(startX + i * (effectiveWidth + baySpacing));
      }
    }
    return positions;
  };

  const shelfPositions = getShelfPositions(barCount);
  const ripMaterial = model13Material || materialGold;

  for (let i = 0; i < shelfQuantity; i++) {
    // Calculate height like wall-to-floor: top shelf at adjustedBaseY, others below
    let currentHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      let cumulativeHeight = 0;
      for (let j = 0; j < i; j++) {
        const spacingToUse = j < shelfSpacings.length ? shelfSpacings[j] : shelfSpacing;
        cumulativeHeight += spacingToUse;
      }
      currentHeight = adjustedBaseY - cumulativeHeight;
    } else {
      currentHeight = adjustedBaseY - (i * shelfSpacing);
    }

    // Place shelves
    shelfPositions.forEach((shelfX) => {
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight + model13Height + 5, zOffset);
      scene.add(shelfMesh);
    });

    // Corner positions for connectors
    const allCornerPositions: { x: number; z: number }[] = [];
    if (baySpacing === 0) {
      allCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
      );
      for (let j = 0; j < barCount - 1; j++) {
        const joinX = shelfPositions[j] + shelfBoundingBox.max.x;
        allCornerPositions.push(
          { x: joinX, z: shelfBoundingBox.min.z + 5 },
          { x: joinX, z: shelfBoundingBox.max.z - 5 }
        );
      }
      allCornerPositions.push(
        { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.max.z - 5 }
      );
    } else {
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        allCornerPositions.push(
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }
        );
      }
    }

    // Place front/back connectors at each corner, optionally adding wall connectors
    allCornerPositions.forEach((pos) => {
      const isFront = pos.z === shelfBoundingBox.min.z + 5;
      const isBack = pos.z === shelfBoundingBox.max.z - 5;

      let geometryToUse: THREE.BufferGeometry | null = null;
      let materialToUse: THREE.Material | null = null;

      const isFrontBarSelectedForThisShelf = frontBars && selectedShelvesForBars.includes(i);
      const isBackBarSelectedForThisShelf = backBars && selectedBackShelvesForBars.includes(i);
      const shouldUseModel13 = (isFront && isBackBarSelectedForThisShelf) || (isBack && isFrontBarSelectedForThisShelf);

      if (shouldUseModel13) {
        geometryToUse = model13Geometry || model1Geometry;
        materialToUse = model13Material || materialGold;
      } else {
        if (type16AGeometry) {
          geometryToUse = type16AGeometry;
          materialToUse = type16AMaterial || materialGold;
        } else {
          geometryToUse = model13Geometry || model1Geometry;
          materialToUse = model13Material || materialGold;
        }
      }

      if (geometryToUse) {
        const connectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
        connectorMesh.scale.set(1.5, 1.5, 1.5);

        if (shouldUseModel13) {
          if (isFront) connectorMesh.rotation.y = 0;
          if (isBack) connectorMesh.rotation.y = Math.PI;
        } else {
          if (type16AGeometry) {
            connectorMesh.rotation.y = isBack ? Math.PI : 0;
          } else {
            connectorMesh.rotation.y = isBack ? Math.PI / 2 : Math.PI + Math.PI / 2;
          }
        }

        let zPos = pos.z + zOffset + 5;
        if (isFront && isBackBarSelectedForThisShelf) {
          zPos += model13Depth + 3;
        } else if (isBack && isFrontBarSelectedForThisShelf) {
          zPos -= model13Depth + 8;
        } else {
          if (type16AGeometry) {
            if (isFront) zPos += model13Depth - 20;
            if (isBack) zPos += model13Depth - 108;
          } else {
            if (isFront) zPos += model13Depth + 3;
            if (isBack) zPos += model13Depth - 85;
          }
        }

        connectorMesh.position.set(pos.x, currentHeight, zPos);
        scene.add(connectorMesh);
      }

      // Optional wall connections on front positions
      if (isFront && shouldAddWallConnection(i, shelfQuantity)) {
        const wallGeometry = type16FGeometry || model11Geometry;
        const wallMaterial = type16FMaterial || materialGold;
        const wallConnector = new THREE.Mesh(wallGeometry, wallMaterial);
        wallConnector.scale.set(1.5, 1.5, 1.5);
        if (type16FGeometry) {
          wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6;
          wallConnector.rotation.y = Math.PI;
        } else {
          wallConnector.rotation.z = Math.PI / 2;
          wallConnector.rotation.y = Math.PI / 2;
        }
        wallConnector.position.set(pos.x, currentHeight, -roomDepth + 140);
        scene.add(wallConnector);
      }

      // Vertical rips between shelves (no top-to-ceiling rips)
      if (i < shelfQuantity - 1 && shelfQuantity > 1) {
        const extensionDown = (i === shelfQuantity - 2) ? 0 : 100;
        const extendedHeight = shelfSpacing + extensionDown;
        const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, extendedHeight, 32);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        verticalRip.position.set(
          pos.x,
          currentHeight - (shelfSpacing + extensionDown) / 2,
          pos.z + zOffset
        );
        scene.add(verticalRip);
      } else if (i === shelfQuantity - 1) {
        // Bottom-most: add rip from last shelf to floor and a floor connector
        const bottomRipHeight = currentHeight - floorHeight;
        const verticalBottomRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, bottomRipHeight, 32);
        const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, ripMaterial);
        verticalBottomRip.position.set(
          pos.x,
          floorHeight + bottomRipHeight / 2,
          pos.z + zOffset
        );
        scene.add(verticalBottomRip);

        const floorGeometry = type16EGeometry || model11Geometry;
        const floorMaterial = type16EMaterial || materialGold;
        const floorConnector = new THREE.Mesh(floorGeometry, floorMaterial);
        floorConnector.scale.set(1.5, 1.5, 1.5);
        if (type16EGeometry) {
          floorConnector.rotation.x = Math.PI / 2;
        }
        floorConnector.position.set(pos.x, floorHeight, pos.z + zOffset);
        scene.add(floorConnector);
      }
    });

    // Horizontal connections (front/back crossbars) per bay based on selections
    shelfPositions.forEach((shelfX) => {
      if (frontBars && selectedShelvesForBars.includes(i)) {
        const backPositions = [
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 }
        ];
        if (backPositions.length === 2) {
          const start = backPositions[0];
          const end = backPositions[1];
          let zStart = start.z + zOffset + 5;
          let zEnd = end.z + zOffset + 5;
          zStart -= model13Depth - 10;
          zEnd -= model13Depth - 10;
          const length = Math.abs(end.x - start.x) + 80;
          const horizontalRipRadius = 14;
          const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, length, 32);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
          horizontalRip.rotation.z = Math.PI / 2;
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 20,
            (zStart + zEnd) / 2 + 25
          );
          scene.add(horizontalRip);
        }
      }

      if (backBars && selectedBackShelvesForBars.includes(i)) {
        const frontPositions = [
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 }
        ];
        if (frontPositions.length === 2) {
          const start = frontPositions[0];
          const end = frontPositions[1];
          let zStart = start.z + zOffset + 5;
          let zEnd = end.z + zOffset + 5;
          zStart += model13Depth + 3;
          zEnd += model13Depth + 3;
          const length = Math.abs(end.x - start.x) + 80;
          const horizontalRipRadius = 14;
          const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, length, 32);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
          horizontalRip.rotation.z = Math.PI / 2;
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 20,
            (zStart + zEnd) / 2 - 50
          );
          scene.add(horizontalRip);
        }
      }
    });

    // Short-edge horizontal rips
    shelfPositions.forEach((shelfX) => {
      const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
      const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
      const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

      let zFront = leftFront.z + zOffset + 5;
      let zBack = leftBack.z + zOffset + 5;

      const addWall = shouldAddWallConnection(i, shelfQuantity);

      if (addWall) {
        // Match wall connector position when wall connection is present
        zFront = -roomDepth + 140;
      } else if (backBars && selectedBackShelvesForBars.includes(i)) {
        zFront += model13Depth + 3;
      } else {
        if (type16AGeometry) {
          zFront += model13Depth - 20;
        } else {
          zFront += model13Depth + 3;
        }
      }

      if (frontBars && selectedShelvesForBars.includes(i)) {
        zBack -= model13Depth;
      } else {
        if (type16AGeometry) {
          zBack += model13Depth - 93;
        } else {
          zBack += model13Depth - 85;
        }
      }

      const length = Math.abs(zBack - zFront);

      const leftEdgeRipRadius = (frontBars || backBars) ? 14 : 10;
      const leftRipGeometry = new THREE.CylinderGeometry(leftEdgeRipRadius, leftEdgeRipRadius, length, 32);
      const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
      leftRip.rotation.x = Math.PI / 2;
      leftRip.position.set(
        leftFront.x,
        currentHeight + model13Height / 2 - 13,
        zFront + (zBack - zFront) / 2
      );
      scene.add(leftRip);

      const rightEdgeRipRadius = (frontBars || backBars) ? 14 : 10;
      const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
      const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
      rightRip.rotation.x = Math.PI / 2;
      rightRip.position.set(
        rightFront.x,
        currentHeight + model13Height / 2 - 10,
        zFront + (zBack - zFront) / 2
      );
      scene.add(rightRip);
    });
  }
};


