import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingToWallMount = async ({
  scene,
  shelfQuantity,
  barCount,
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
  materialGold,
  roomDepth = 1200,
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
    
    // GLB dosyasından geometry'yi çıkart
    let foundGeometry = false;
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && !foundGeometry) {
        model13Geometry = child.geometry.clone() as THREE.BufferGeometry;
        
        // Material'ı clone et ve özelliklerini düzenle
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
    }
  } catch (error) {
    console.error('Model13.glb yüklenemedi:', error);
  }

  // Type16A v2.glb dosyasını horizontal bar durumunda öndeki modeller için yükle
  let type16AGeometry: THREE.BufferGeometry | null = null;
  let type16AMaterial: THREE.Material | null = null;

  try {
    const type16AGLTF = await loader.loadAsync('/models/Type16A v2.glb');
    console.log('Type16A v2.glb yüklendi:', type16AGLTF);
    
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
        console.log('Type16A geometry ve material bulundu:', child.geometry, type16AMaterial);
      }
    });
  } catch (error) {
    console.error('Type16A v2.glb yüklenemedi:', error);
  }
  
  // Type16E v1.glb dosyasını tavan bağlantıları için yükle
  let type16EGeometry: THREE.BufferGeometry | null = null;
  let type16EMaterial: THREE.Material | null = null;

  try {
    const type16EGLTF = await loader.loadAsync('/models/Type16E v1.glb');
    console.log('Type16E v1.glb yüklendi:', type16EGLTF);
    
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
        console.log('Type16E geometry ve material bulundu:', child.geometry, type16EMaterial);
      }
    });
  } catch (error) {
    console.error('Type16E v1.glb yüklenemedi:', error);
  }
  
  // Type16F v1.glb dosyasını duvar bağlantıları için yükle
  let type16FGeometry: THREE.BufferGeometry | null = null;
  let type16FMaterial: THREE.Material | null = null;

  try {
    const type16FGLTF = await loader.loadAsync('/models/Type16F v1.glb');
    console.log('Type16F v1.glb yüklendi:', type16FGLTF);
    
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
        console.log('Type16F geometry ve material bulundu:', child.geometry, type16FMaterial);
      }
    });
  } catch (error) {
    console.error('Type16F v1.glb yüklenemedi:', error);
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

  // Model 1 yüksekliğini hesapla
  let model1Depth = 0;
  if (model1Geometry) {
    model1Geometry.computeBoundingBox();
    if (model1Geometry.boundingBox) {
      model1Depth =
        model1Geometry.boundingBox.max.z - model1Geometry.boundingBox.min.z;
    }
  }

  const ceilingHeight = 1500; // Ceiling height in mm
  const baseY = userHeight || 1195;
  const shelfSpacing = 250;
  
  // Calculate pipe radius based on pipeDiameter

  // Calculate shelf positions for multiple bars
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    // Use userWidth if provided, otherwise use default shelfWidth
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      // For multiple bars, arrange them side by side
      const startX = -(barCount - 1) * effectiveWidth / 2;
      for (let i = 0; i < barCount; i++) {
        positions.push(startX + i * effectiveWidth);
      }
    }
    return positions;
  };

  const shelfPositions = getShelfPositions(barCount);

  // Ripler için kullanılacak materyali belirle - modeller ile aynı olsun
  const ripMaterial = model13Material || materialGold;

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

  // Tavan bağlantıları
  adjustedCornerPositions.forEach((pos) => {
    // Tavan bağlantıları
    const ceilingGeometry = type16EGeometry || model11Geometry;
    const ceilingMaterial = type16EMaterial || materialGold;
    const ceilingConnector = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceilingConnector.scale.set(1.5, 1.5, 1.5);
    
    // Type16E modeli için farklı rotasyon
    if (type16EGeometry) {
      ceilingConnector.rotation.x = Math.PI * 1.5; // Type16E için 270 derece rotasyon
    } else {
      ceilingConnector.rotation.x = Math.PI; // Eski model rotasyonu
    }
    
    ceilingConnector.position.set(pos.x, ceilingHeight, pos.z + zOffset);
    scene.add(ceilingConnector);

    // Dikey rip: en üst raftan tavana kadar (kısaltılmış)
    const topShelfHeight = baseY - shelfSpacing;
    const fullTopRipHeight = ceilingHeight - topShelfHeight;
    const topRipHeight = fullTopRipHeight * 0.7; // Ripi %70'e kısalt
    const verticalTopRipGeometry = new THREE.CylinderGeometry(10, 10, topRipHeight, 32);
    const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, ripMaterial);
    verticalTopRip.position.set(
      pos.x,
      ceilingHeight - topRipHeight / 2, // Tavandan aşağı doğru pozisyonla
      pos.z + zOffset
    );
    scene.add(verticalTopRip);
  });

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    const currentHeight = baseY - i * shelfSpacing;

    // Her bir bay için rafları yerleştir - modellerin üstünde
    shelfPositions.forEach((shelfX) => {
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight + model13Height * 1, zOffset); // Model yüksekliği kadar yukarı taşı
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
        const wallGeometry = type16FGeometry || model11Geometry;
        const wallMaterial = type16FMaterial || materialGold;
        const wallConnector = new THREE.Mesh(wallGeometry, wallMaterial);
        wallConnector.scale.set(1.5, 1.5, 1.5);
        
        // Type16F modeli için rotasyonlar
        if (type16FGeometry) {
          wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6; // 90 + 45 + 30 = 165 derece Z ekseninde
          wallConnector.rotation.y = Math.PI; // 180 derece Y ekseninde
        } else {
          // Eski model rotasyonları
          wallConnector.rotation.z = Math.PI / 2;
          wallConnector.rotation.y = Math.PI / 2;
        }
        
        wallConnector.position.set(pos.x, currentHeight, -roomDepth + 50); // Duvarı bağlantı noktalarına yaklaştır (145'ten 50'ye)
        scene.add(wallConnector);

        // Duvara yatay rip ekle
        const horizontalRipLength = Math.abs(pos.z + zOffset + roomDepth - 105); // 200'den 105'e güncellendi
        const horizontalRipGeometry = new THREE.CylinderGeometry(10, 10, horizontalRipLength, 32);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
        horizontalRip.rotation.x = Math.PI / 2; // Yatay pozisyon için X ekseninde 90 derece döndür
        horizontalRip.position.set(
          pos.x,
          currentHeight,
          (pos.z + zOffset - roomDepth + 50) / 2 // Ripi duvar bağlantısının merkezine kadar getir
        );
        scene.add(horizontalRip);

        // Arka bağlantılar için Model seçimi
        const isBacke = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon
        
        if (isBacke) {
          let geometryToUse, materialToUse;
          
          if (showCrossbars) {
            // Horizontal bar açık - arkada Model13 kullan
            geometryToUse = model13Geometry || model1Geometry;
            materialToUse = model13Material || materialGold;
          } else {
            // Horizontal bar kapalı - arkada Type16A kullan
            if (type16AGeometry) {
              geometryToUse = type16AGeometry;
              materialToUse = type16AMaterial || materialGold;
            } else {
              geometryToUse = model13Geometry || model1Geometry;
              materialToUse = model13Material || materialGold;
            }
          }
          
          if (geometryToUse) {
            const backConnectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
            backConnectorMesh.scale.set(1.5, 1.5, 1.5);
            
            // Model tipine göre rotasyonlar
            if (showCrossbars) {
              if (model13Geometry) {
                backConnectorMesh.rotation.y = Math.PI; // Model13 için rotasyon
              } else {
                backConnectorMesh.rotation.y = Math.PI / 2; // Eski model1 rotasyonu
              }
            } else {
              // Horizontal bar kapalı
              if (type16AGeometry) {
                backConnectorMesh.rotation.y = Math.PI; // Type16A arkadaki rotasyon
              } else {
                backConnectorMesh.rotation.y = Math.PI / 2; // Fallback rotasyon
              }
            }
            
            // Pozisyon ayarlamaları
            let backZPos = pos.z + zOffset + 5;
            
            if (showCrossbars) {
              // Horizontal bar açık
              backZPos -= model13Depth + 8; // Model13'ü geri çek
            } else {
              // Horizontal bar kapalı
              if (type16AGeometry) {
                backZPos += model13Depth - 108; // Type16A arkadaki pozisyon
              } else {
                backZPos += model13Depth - 85; // Fallback pozisyon
              }
            }

            backConnectorMesh.position.set(pos.x, currentHeight, backZPos);
            scene.add(backConnectorMesh);
          }
        }
        
        // Ön bağlantılar - Type16F (duvar bağlantısı) kullanıldığı için ön modelleri eklemeye gerek yok
        // Model13 veya Type16A eklenmeyecek, sadece duvar bağlantısı yeterli

        // Dikey ripler (raflar arası - kısaltılmış)
        if (i < shelfQuantity - 1) {
          const ripHeight = shelfSpacing ; // Ripi %80'e kısalt
          const verticalRipGeometry = new THREE.CylinderGeometry(10, 10, ripHeight, 32);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
          verticalRip.position.set(
            pos.x,
            currentHeight - ripHeight / 2 - (shelfSpacing - ripHeight) / 2, // Üst rafa daha yakın pozisyonla
            pos.z + zOffset
          );
          scene.add(verticalRip);
        }
      });

      // Her bay için kısa kenarlara yatay rip ekle (horizontal bar durumundan bağımsız)
      const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
      const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
      const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

      // Sol kısa kenar
      let zFront = leftFront.z + zOffset + 5;
      let zBack = leftBack.z + zOffset + 5;
      
      // Ön modellerin pozisyonunu hesapla - duvar bağlantısının gerçek pozisyonuna göre
      zFront = -roomDepth + 50; // Duvar bağlantısının pozisyonuyla tam eşleş
      
      // Arka modellerin pozisyonunu hesapla
      if (showCrossbars) {
        zBack -= model13Depth; // Arkadaki modeli öne yaklaştır
      } else {
        if (type16AGeometry) {
          zBack += model13Depth - 108; // Type16A arkadaki pozisyon
        } else {
          zBack += model13Depth - 85; // Normal arkadaki pozisyon
        }
      }
      
      const leftLength = Math.abs(zBack - zFront);
      const leftRipGeometry = new THREE.CylinderGeometry(10, 10, leftLength, 32);
      const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
      leftRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
      leftRip.position.set(
        leftFront.x,
        currentHeight + model13Height / 2 - 18,
        zFront + (zBack - zFront) / 2
      );
      scene.add(leftRip);

      // Sağ kısa kenar
      const rightRipGeometry = new THREE.CylinderGeometry(10, 10, leftLength, 32);
      const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
      rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
      rightRip.position.set(
        rightFront.x,
        currentHeight + model13Height / 2 - 5,
        zFront + (zBack - zFront) / 2
      );
      scene.add(rightRip);
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

          const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
          const horizontalRipGeometry = new THREE.CylinderGeometry(10, 10, length, 32);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
          horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 20,
            (zStart + zEnd) / 2 + 15
          );
          scene.add(horizontalRip);
        }
      });
    }
  }
}; 