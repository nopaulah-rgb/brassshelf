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
  model2Geometry,
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

  // Add shelves with their connectors
  for (let i = 0; i < totalShelves; i++) {
    const currentHeight = topShelfHeight - i * shelfSpacing;
    const hasShelfAtThisLevel = useTopShelf || i > 0;

    // Add ceiling connectors and vertical rips only at the first iteration
    if (i === 0) {
      const frontPositions = [
        { x: barCount === 2 ? -shelfWidth : 0, z: shelfBoundingBox.min.z + 5 },
        { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
      ];
      const backPositions = [
        { x: barCount === 2 ? -shelfWidth : 0, z: shelfBoundingBox.max.z - 5 },
        { x: shelfWidth, z: shelfBoundingBox.max.z - 5 },
      ];
      const allPositions = [...frontPositions, ...backPositions];
      
      allPositions.forEach(pos => {
        const zPos = pos.z === shelfBoundingBox.max.z - 5 
          ? pos.z + zOffset + 5 - model1Depth - 10 
          : pos.z + zOffset;

        // Add vertical rip to ceiling - Updated to extend to bottom shelf
        const verticalRipGeometry = new THREE.BoxGeometry(10, mountTop - bottomShelfHeight, 10);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
        verticalRip.position.set(
          pos.x,
          (mountTop + bottomShelfHeight) / 2,
          zPos
        );
        scene.add(verticalRip);

        // Add ceiling connector (Model 11)
        const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
        ceilingConnector.scale.set(1.5, 1.5, 1.5);
        ceilingConnector.rotation.x = Math.PI; // Rotate to point downward
        ceilingConnector.position.set(
          pos.x,
          mountTop,
          zPos
        );
        scene.add(ceilingConnector);
      });

      // Add center ceiling connectors
      if (barCount === 2) {
        // Front ceiling connection for center
        const frontCeilingConnector = new THREE.Mesh(model11Geometry, materialGold);
        frontCeilingConnector.scale.set(1.5, 1.5, 1.5);
        frontCeilingConnector.rotation.x = Math.PI;
        frontCeilingConnector.position.set(
          0,
          mountTop,
          shelfBoundingBox.min.z + zOffset
        );
        scene.add(frontCeilingConnector);

        // Back ceiling connection for center
        const backCeilingConnector = new THREE.Mesh(model11Geometry, materialGold);
        backCeilingConnector.scale.set(1.5, 1.5, 1.5);
        backCeilingConnector.rotation.x = Math.PI;
        backCeilingConnector.position.set(
          0,
          mountTop,
          shelfBoundingBox.max.z + zOffset
        );
        scene.add(backCeilingConnector);

        // Front vertical rip - Updated to extend to bottom shelf
        const frontVerticalRipGeometry = new THREE.BoxGeometry(10, mountTop - bottomShelfHeight, 10);
        const frontVerticalRip = new THREE.Mesh(frontVerticalRipGeometry, materialGold);
        frontVerticalRip.position.set(
          0,
          (mountTop + bottomShelfHeight) / 2,
          shelfBoundingBox.min.z + zOffset
        );
        scene.add(frontVerticalRip);

        // Back vertical rip - Updated to extend to bottom shelf
        const backVerticalRipGeometry = new THREE.BoxGeometry(10, mountTop - bottomShelfHeight, 10);
        const backVerticalRip = new THREE.Mesh(backVerticalRipGeometry, materialGold);
        backVerticalRip.position.set(
          0,
          (mountTop + bottomShelfHeight) / 2,
          shelfBoundingBox.max.z + zOffset
        );
        scene.add(backVerticalRip);
      }
    }

    // Add shelf if:
    // - it's not the first iteration (i > 0) for "Do not use top as shelf"
    // - or if useTopShelf is true (add all shelves including top)
    if (hasShelfAtThisLevel) {
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

        // Back center vertical connection at shelf edge
        const backCenterConnector = new THREE.Mesh(model2Geometry, materialGold);
        backCenterConnector.scale.set(1.5, 1.5, 1.5);
        backCenterConnector.rotation.x = Math.PI / 2;
        backCenterConnector.rotation.y = Math.PI / 2;
        backCenterConnector.rotation.z = Math.PI / 2;
        backCenterConnector.position.set(
          0,
          currentHeight + model1Height / 2 - 20,
          shelfBoundingBox.max.z + zOffset + 20
        );
        scene.add(backCenterConnector);

        // Front wall connection for center (using model11) - NOW ADDED TO ALL SHELVES
        const frontCenterWallConnector = new THREE.Mesh(model11Geometry, materialGold);
        frontCenterWallConnector.scale.set(1.5, 1.5, 1.5);
        frontCenterWallConnector.rotation.z = Math.PI / 2;
        frontCenterWallConnector.rotation.y = Math.PI / 2;
        frontCenterWallConnector.position.set(
          0,
          currentHeight + model1Height / 2 - 20,
          -1000
        );
        scene.add(frontCenterWallConnector);

        // Horizontal rip from wall to back shelf edge - NOW ADDED TO ALL SHELVES
        const centerHorizontalRipLength = Math.abs(-1000 - (shelfBoundingBox.max.z + zOffset));
        const centerHorizontalRipGeometry = new THREE.BoxGeometry(10, 10, centerHorizontalRipLength);
        const centerHorizontalRip = new THREE.Mesh(centerHorizontalRipGeometry, materialGold);
        centerHorizontalRip.position.set(
          0,
          currentHeight + model1Height / 2 - 20,
          -1000 + centerHorizontalRipLength / 2
        );
        scene.add(centerHorizontalRip);
      }

      // Add back connectors (model1)
      const backPositions = [
        { x: barCount === 2 ? -shelfWidth : 0, z: shelfBoundingBox.max.z - 5 },
        { x: shelfWidth, z: shelfBoundingBox.max.z - 5 },
      ];

      backPositions.forEach((pos) => {
        const connectorMesh = new THREE.Mesh(model1Geometry, materialGold);
        connectorMesh.scale.set(1.5, 1.5, 1.5);
        connectorMesh.rotation.y = Math.PI / 2;
        
        // Position model1 like in CeilingMount
        const zPos = pos.z + zOffset + 5 - model1Depth - 10;
        
        connectorMesh.position.set(
          pos.x,
          currentHeight + model1Height / 2 - 20,
          zPos
        );
        scene.add(connectorMesh);
      });

      // Add front wall connections - NOW CONNECTED TO ALL SHELVES (removed shouldAddWallConnection condition)
      const frontPositions = [
        { x: barCount === 2 ? -shelfWidth : 0, z: shelfBoundingBox.min.z + 5 },
        { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
      ];

      frontPositions.forEach((pos) => {
        // Add wall connector to ALL shelves (Model 11)
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

        // Add horizontal rip to wall for ALL shelves
        const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
        const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
        horizontalRip.position.set(
          pos.x,
          currentHeight + model1Height / 2 - 20,
          (pos.z + zOffset - 1000) / 2
        );
        scene.add(horizontalRip);
      });

      // Add crossbars if enabled
      if (showCrossbars) {
        // Add back horizontal rip
        const backRipLength = Math.abs(backPositions[1].x - backPositions[0].x);
        const backRipGeometry = new THREE.BoxGeometry(backRipLength, 10, 10);
        const backRip = new THREE.Mesh(backRipGeometry, materialGold);
        backRip.position.set(
          backPositions[0].x + backRipLength / 2,
          currentHeight + model1Height / 2 - 20,
          backPositions[0].z + zOffset + 5 - model1Depth - 10
        );
        scene.add(backRip);

        // Calculate side rip length and positions
        const zFront = frontPositions[0].z + zOffset + 5;
        const zBack = backPositions[0].z + zOffset + 5 - model1Depth - 10;
        const sideLength = Math.abs(zBack - zFront);
        const sideRipGeometry = new THREE.BoxGeometry(10, 10, sideLength);

        // Left side rip
        const leftRip = new THREE.Mesh(sideRipGeometry, materialGold);
        leftRip.position.set(
          backPositions[0].x,
          currentHeight + model1Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Right side rip
        const rightRip = new THREE.Mesh(sideRipGeometry, materialGold);
        rightRip.position.set(
          backPositions[1].x,
          currentHeight + model1Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    }
  }
}; 