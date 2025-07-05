import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingMount = async ({
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
  model12Geometry,
  materialGold,
}: MountTypeProps) => {
  // Model 13 GLB dosyasını yükle
  const loader = new GLTFLoader();
  let model13Geometry: THREE.BufferGeometry | null = null;
  let model13Material: THREE.Material | null = null;
  let model13Height = 0;
  let model13Depth = 0;

  try {
    const gltf = await loader.loadAsync('/models/model13.glb');
    console.log('GLB yüklendi:', gltf);
    console.log('Scene children:', gltf.scene.children);
    
    // GLB dosyasından geometry'yi çıkart
    let foundGeometry = false;
              gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && !foundGeometry) {
        model13Geometry = child.geometry.clone() as THREE.BufferGeometry;
        
        // Material'ı clone et ve özelliklerini düzenle
        const originalMaterial = child.material as THREE.Material;
        if (originalMaterial instanceof THREE.MeshStandardMaterial) {
          const clonedMaterial = originalMaterial.clone();
          clonedMaterial.metalness = 0.6; // Düşük metalness
          clonedMaterial.roughness = 0.4; // Orta roughness
          clonedMaterial.envMapIntensity = 1.0; // Environment map intensity
          // Eğer çok koyu ise rengi aydınlat
          if (clonedMaterial.color.r < 0.3 && clonedMaterial.color.g < 0.3 && clonedMaterial.color.b < 0.3) {
            clonedMaterial.color.setHex(0xaaaaaa); // Açık gri
          }
          model13Material = clonedMaterial;
        } else {
          model13Material = originalMaterial;
        }
        
        foundGeometry = true;
        console.log('Geometry ve düzenlenmiş material bulundu:', child.geometry, model13Material);
      }
    });
    
    if (model13Geometry) {
      (model13Geometry as THREE.BufferGeometry).computeBoundingBox();
      if ((model13Geometry as THREE.BufferGeometry).boundingBox) {
        model13Height =
          (model13Geometry as THREE.BufferGeometry).boundingBox!.max.y - (model13Geometry as THREE.BufferGeometry).boundingBox!.min.y;
        model13Depth =
          (model13Geometry as THREE.BufferGeometry).boundingBox!.max.z - (model13Geometry as THREE.BufferGeometry).boundingBox!.min.z;
        console.log('Model13 boyutları:', { height: model13Height, depth: model13Depth });
      }
    } else {
      console.log('GLB dosyasında geometry bulunamadı');
    }
  } catch (error) {
    console.error('Model13.glb yüklenemedi:', error);
  }
  
  // Hata durumunda model1Geometry'yi kullan
  if (!model13Geometry && model1Geometry) {
    console.log('Model13 yüklenemedi, model1Geometry kullanılıyor');
    model13Geometry = model1Geometry;
    model1Geometry.computeBoundingBox();
    if (model1Geometry.boundingBox) {
      model13Height =
        model1Geometry.boundingBox.max.y - model1Geometry.boundingBox.min.y;
      model13Depth =
        model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

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
        // Model 13 (GLB model)
        const geometryToUse = model13Geometry || model1Geometry;
        const materialToUse = model13Material || materialGold;
        if (geometryToUse) {
          const connectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
          connectorMesh.scale.set(1.5, 1.5, 1.5);

          // Model13 için farklı rotasyonlar
          if (model13Geometry) {
            // Model13'ü doğru yöne çevir - birbirine bakacak şekilde
            if (pos.z === shelfBoundingBox.min.z + 5) {
              // Ön taraf - merkeze bakmalı
              connectorMesh.rotation.y = 0; 
            } else {
              // Arka taraf - merkeze bakmalı  
              connectorMesh.rotation.y = Math.PI;
            }
          } else {
            // Eski model1 rotasyonları
            if (pos.z === shelfBoundingBox.min.z + 5) {
              connectorMesh.rotation.y = Math.PI + Math.PI / 2;
            } else {
              connectorMesh.rotation.y = Math.PI / 2;
            }
          }

          // Arka model 13'leri öne kaydır
          let zPos = pos.z + zOffset + 5;
          if (pos.z === shelfBoundingBox.max.z - 5) {
            zPos -= model13Depth + 20;
          }
          if (pos.z === shelfBoundingBox.min.z + 5) {
            zPos += model13Depth + 5;
          }

          connectorMesh.position.set(pos.x, currentHeight, zPos);
          scene.add(connectorMesh);
        }

        // Dikey ripler (son raf değilse)
        if (i < shelfQuantity - 1 && shelfQuantity > 1) {
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
          // Arka model 13'lerin yeni z konumlarını bul
          const start = backPositions[0];
          const end = backPositions[1];
          let zStart = start.z + zOffset + 5;
          let zEnd = end.z + zOffset + 5;
          zStart -= model13Depth + 10;
          zEnd -= model13Depth + 10;

          const length = Math.abs(end.x - start.x);
          const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 20,
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
        zFront += model13Depth + 5;
        zBack -= model13Depth + 20;
        const length = Math.abs(zBack - zFront);

        // Sol kısa kenar
        const leftRipGeometry = new THREE.BoxGeometry(10, 10, length);
        const leftRip = new THREE.Mesh(leftRipGeometry, materialGold);
        leftRip.position.set(
          leftFront.x,
          currentHeight + model13Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightRipGeometry = new THREE.BoxGeometry(10, 10, length);
        const rightRip = new THREE.Mesh(rightRipGeometry, materialGold);
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    });
  }

  // En üstteki raftan tavana kadar olan dikey ripler ve tavan bağlantıları
  shelfPositions.forEach((shelfX) => {
    const cornerPositions = [
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
    ];

    cornerPositions.forEach((pos) => {
      // Dikey rip: en üst raftan tavana kadar
      const topShelfHeight = baseY;
      const ripHeight = 1500 - topShelfHeight;
      const verticalRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
      const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
      verticalRip.position.set(
        pos.x,
        topShelfHeight + ripHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalRip);

      // Tavan bağlantıları
      const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
      ceilingConnector.scale.set(1.5, 1.5, 1.5);
      ceilingConnector.rotation.x = Math.PI;
      ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
      scene.add(ceilingConnector);
    });
  });
};
