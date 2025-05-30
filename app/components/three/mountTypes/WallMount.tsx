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

  // Calculate corner positions
  const adjustedCornerPositions = [
    { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.min.z + 5 },
    { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.min.z + 5 },
    { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.max.z - 5 },
    { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.max.z - 5 },
  ];

  // Add shelves and connectors for each level
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

    // Add first shelf
    const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelfMesh.position.set(
      barCount === 2 ? -shelfWidth : 0,
      currentHeight,
      zOffset
    );
    scene.add(shelfMesh);

    // Add second shelf if barCount is 2
    if (barCount === 2) {
      const secondShelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      secondShelfMesh.position.set(0, currentHeight, zOffset);
      scene.add(secondShelfMesh);
    }

    // Add Model 1 connectors at corners
    adjustedCornerPositions.forEach((pos) => {
      // Model 1
      const connectorMesh = new THREE.Mesh(model1Geometry, materialGold);
      connectorMesh.scale.set(1.5, 1.5, 1.5);

      // Rotate front Model 1s 180 degrees, back ones 90 degrees
      if (pos.z === shelfBoundingBox.min.z + 5) {
        connectorMesh.rotation.y = Math.PI + Math.PI / 2;
      } else {
        connectorMesh.rotation.y = Math.PI / 2;
      }

      // Adjust back Model 1s forward
      let zPos = pos.z + zOffset + 5;
      if (pos.z === shelfBoundingBox.max.z - 5) {
        zPos -= model1Depth + 20;
      }
      if (pos.z === shelfBoundingBox.min.z + 5) {
        zPos += model1Depth + 5;
      }

      connectorMesh.position.set(
        barCount === 2 ? pos.x - shelfWidth : pos.x,
        currentHeight,
        zPos
      );
      scene.add(connectorMesh);

      // Add Model 1s for second shelf if barCount is 2
      if (barCount === 2) {
        const secondConnectorMesh = new THREE.Mesh(model1Geometry, materialGold);
        secondConnectorMesh.scale.set(1.5, 1.5, 1.5);
        if (pos.z === shelfBoundingBox.min.z + 5) {
          secondConnectorMesh.rotation.y = Math.PI + Math.PI / 2;
        } else {
          secondConnectorMesh.rotation.y = Math.PI / 2;
        }
        secondConnectorMesh.position.set(pos.x, currentHeight, zPos);
        scene.add(secondConnectorMesh);
      }

      // Add wall connectors
      const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
      wallConnector.scale.set(1.5, 1.5, 1.5);
      wallConnector.rotation.z = Math.PI / 2;
      wallConnector.rotation.y = Math.PI / 2;
      wallConnector.position.set(
        barCount === 2 ? pos.x - shelfWidth : pos.x,
        currentHeight,
        -1000
      );
      scene.add(wallConnector);

      // Add second wall connector if barCount is 2
      if (barCount === 2) {
        const secondWallConnector = new THREE.Mesh(model12Geometry, materialGold);
        secondWallConnector.scale.set(1.5, 1.5, 1.5);
        secondWallConnector.rotation.z = Math.PI / 2;
        secondWallConnector.rotation.y = Math.PI / 2;
        secondWallConnector.position.set(pos.x, currentHeight, -1000);
        scene.add(secondWallConnector);
      }

      // Add horizontal rip to wall
      const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
      const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
      const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
      horizontalRip.position.set(
        barCount === 2 ? pos.x - shelfWidth : pos.x,
        currentHeight,
        (pos.z + zOffset - 1000) / 2
      );
      scene.add(horizontalRip);

      // Add second horizontal rip if barCount is 2
      if (barCount === 2) {
        const secondHorizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
        secondHorizontalRip.position.set(
          pos.x,
          currentHeight,
          (pos.z + zOffset - 1000) / 2
        );
        scene.add(secondHorizontalRip);
      }

      // Add vertical rips (if not the last shelf)
      if (i < shelfQuantity - 1) {
        const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
        verticalRip.position.set(
          barCount === 2 ? pos.x - shelfWidth : pos.x,
          currentHeight - shelfSpacing / 2,
          pos.z + zOffset
        );
        scene.add(verticalRip);

        // Add vertical rips for second shelf
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

    // Add crossbars if enabled
    if (showCrossbars) {
      // Add back horizontal crossbar
      const backPositions = adjustedCornerPositions.filter(
        (pos) => pos.z === shelfBoundingBox.max.z - 5
      );
      if (backPositions.length === 2) {
        const start = backPositions[0];
        const end = backPositions[1];
        const length = Math.abs(end.x - start.x);
        const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
        horizontalRip.position.set(
          barCount === 2 ? start.x - shelfWidth + (end.x - start.x) / 2 : start.x + (end.x - start.x) / 2,
          currentHeight + model1Height / 2 - 20,
          start.z + zOffset
        );
        scene.add(horizontalRip);

        // Add second back horizontal crossbar if barCount is 2
        if (barCount === 2) {
          const secondHorizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
          secondHorizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model1Height / 2 - 20,
            start.z + zOffset
          );
          scene.add(secondHorizontalRip);
        }
      }
    }
  }
};