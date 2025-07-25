import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";
import { createCabinetDoor } from "../CabinetDoor";

export const handleCeilingToCounterToWallMount = async ({
  scene,
  shelfQuantity,
  barCount,
  showCrossbars,
  userHeight,
  userWidth,
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
  pipeDiameter,
}: MountTypeProps) => {
  const roomDepth = 1200; // Room depth in mm
  
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
  
  // Type16E v1.glb dosyasını tavan ve counter bağlantıları için yükle
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

  const counterHeight = 400; // Counter height in mm
  const ceilingHeight = 1500; // Ceiling height in mm
  const baseY = userHeight || 1195;
  const shelfSpacing = 250;

  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12; // Çapı artırdık (12.5->16, 8->12)

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



  // Calculate shared corner positions for multiple bays (avoiding duplicates)
  const getAllCornerPositions = (): { x: number; z: number }[] => {
    const allCorners: { x: number; z: number }[] = [];
    
    // Sol en dış köşeler
    allCorners.push(
      { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
    );
    
    // Orta bağlantı noktaları (her bay arası için)
    for (let j = 0; j < barCount - 1; j++) {
      // Rafların birleşim noktası: j. bay'in sağ kenarı ile (j+1). bay'in sol kenarı
      const joinX = shelfPositions[j] + shelfBoundingBox.max.x;
      allCorners.push(
        { x: joinX, z: shelfBoundingBox.min.z + 5 },
        { x: joinX, z: shelfBoundingBox.max.z - 5 }
      );
    }
    
    // Sağ en dış köşeler
    allCorners.push(
      { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.max.z - 5 }
    );
    
    return allCorners;
  };

  const adjustedCornerPositions = getAllCornerPositions();

  // Tavan ve counter bağlantıları
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

    // Dikey rip: en üst raftan tavana kadar
    const topShelfHeight = baseY - (useTopShelf ? 0 : shelfSpacing);
    const topRipHeight = ceilingHeight - topShelfHeight;
    const verticalTopRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, topRipHeight, 32);
    const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, ripMaterial);
    verticalTopRip.position.set(
      pos.x,
      topShelfHeight + topRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalTopRip);

    // Dikey rip: en alt raftan counter'a kadar
    const bottomShelfHeight = baseY - ((shelfQuantity - (useTopShelf ? 1 : 0)) * shelfSpacing);
    const bottomRipHeight = bottomShelfHeight - counterHeight;
    const verticalBottomRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, bottomRipHeight, 32);
    const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, ripMaterial);
    verticalBottomRip.position.set(
      pos.x,
      counterHeight + bottomRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalBottomRip);

    // Counter bağlantıları
    const counterGeometry = type16EGeometry || model11Geometry;
    const counterMaterial = type16EMaterial || materialGold;
    const counterConnector = new THREE.Mesh(counterGeometry, counterMaterial);
    counterConnector.scale.set(1.5, 1.5, 1.5);
    
    // Type16E modeli için farklı rotasyon - counter için
    if (type16EGeometry) {
      counterConnector.rotation.x = Math.PI / 2; // Type16E için counter'da 90 derece öne rotasyon
    }
    
    counterConnector.position.set(pos.x, counterHeight, pos.z + zOffset);
    scene.add(counterConnector);
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

    // Tüm sistem için köşe pozisyonlarını hesapla (ortak noktalar tek olacak)
    const allCornerPositions = [];
    
    // Sol en dış köşeler
    allCornerPositions.push(
      { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
    );
    
    // Orta bağlantı noktaları (her bay arası için)
    for (let j = 0; j < barCount - 1; j++) {
      // Rafların birleşim noktası: j. bay'in sağ kenarı ile (j+1). bay'in sol kenarı
      const joinX = shelfPositions[j] + shelfBoundingBox.max.x;
      allCornerPositions.push(
        { x: joinX, z: shelfBoundingBox.min.z + 5 },
        { x: joinX, z: shelfBoundingBox.max.z - 5 }
      );
    }
    
    // Sağ en dış köşeler
    allCornerPositions.push(
      { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.max.z - 5 }
    );

    allCornerPositions.forEach((pos) => {
      // Add wall connections for all front positions
      if (pos.z === shelfBoundingBox.min.z + 5) {
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
        
        wallConnector.position.set(pos.x, currentHeight, -roomDepth + 140); // Duvar bağlantısını 20 birim öne getir (-50'den -70'e)
        scene.add(wallConnector);
      }

      // Duvara yatay rip ekle
      const horizontalRipLength = Math.abs(pos.z + zOffset + 895); // 1000'den 895'e güncellendi
      const horizontalRipGeometry = new THREE.CylinderGeometry(10, 10, horizontalRipLength, 32);
      const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
      horizontalRip.rotation.x = Math.PI / 2; // Yatay pozisyon için X ekseninde 90 derece döndür
      horizontalRip.position.set(
        pos.x,
        currentHeight,
        (pos.z + zOffset - 895) / 2 // 1000'den 895'e güncellendi
      );
      scene.add(horizontalRip);

      // Ön ve arka bağlantılar için Model seçimi
      const isFront = pos.z === shelfBoundingBox.min.z + 5; // Ön pozisyon
      const isBack = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon
      
      let geometryToUse, materialToUse;
      
      if (showCrossbars) {
        if (isFront && type16AGeometry) {
          // Horizontal bar açık ve ön pozisyon -> Type16A kullan
          geometryToUse = type16AGeometry;
          materialToUse = type16AMaterial || materialGold;
        } else {
          // Horizontal bar açık ve arka pozisyon -> Model13 kullan
          geometryToUse = model13Geometry || model1Geometry;
          materialToUse = model13Material || materialGold;
        }
      } else {
        // Horizontal bar kapalı -> ön ve arka Type16A kullan
        if (type16AGeometry) {
          geometryToUse = type16AGeometry;
          materialToUse = type16AMaterial || materialGold;
        } else {
          geometryToUse = model13Geometry || model1Geometry;
          materialToUse = model13Material || materialGold;
        }
      }
      
      // Duvar bağlantısı olan ön pozisyonlarda shelf modeli eklemeyelim
      const hasWallConnection = isFront; // Tüm ön pozisyonlarda duvar bağlantısı var
      
      if (geometryToUse && (isFront || isBack) && !hasWallConnection) {
        const connectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
        connectorMesh.scale.set(1.5, 1.5, 1.5);

        // Model tipine göre rotasyonlar
        if (showCrossbars) {
          if (isFront && type16AGeometry) {
            // Type16A için rotasyon
            connectorMesh.rotation.y = 0; // Merkeze bakmalı
          } else if (model13Geometry) {
            // Model13 için rotasyonlar
            if (isFront) {
              connectorMesh.rotation.y = 0; // Ön taraf - merkeze bakmalı
            } else {
              connectorMesh.rotation.y = Math.PI; // Arka taraf - merkeze bakmalı  
            }
          } else {
            // Eski model1 rotasyonları
            if (isFront) {
              connectorMesh.rotation.y = Math.PI + Math.PI / 2;
            } else {
              connectorMesh.rotation.y = Math.PI / 2;
            }
          }
        } else {
          // Horizontal bar kapalı - ön ve arka Type16A
          if (type16AGeometry) {
            if (isBack) {
              connectorMesh.rotation.y = Math.PI; // Arkadaki Type16A'yı 180 derece çevir
            } else {
              connectorMesh.rotation.y = 0; // Öndeki Type16A standart rotasyon
            }
          } else if (model13Geometry) {
            connectorMesh.rotation.y = 0; // Model13 fallback
          } else {
            connectorMesh.rotation.y = Math.PI + Math.PI / 2; // Eski model1 rotasyonu
          }
        }

                 // Pozisyon ayarlamaları - ripler ile aynı mantığı kullan
         let zPos = pos.z + zOffset + 5;
         
         if (showCrossbars) {
           // Horizontal bar açık
           if (isBack) {
             zPos -= model13Depth; // Arkadaki modeli öne yaklaştır (rip mantığıyla aynı)
           }
           if (isFront) {
             if (type16AGeometry) {
               zPos += model13Depth - 20; // Type16A modelini daha öne kaydır
             } else {
               zPos += model13Depth + 3; // Normal öndeki modeli kaydır
             }
           }
         } else {
           // Horizontal bar kapalı
           if (isBack) {
             if (type16AGeometry) {
               zPos += model13Depth - 108; // Type16A arkadaki pozisyon
             } else {
               zPos += model13Depth - 85; // Fallback pozisyon
             }
           } else if (isFront) {
             if (type16AGeometry) {
               zPos += model13Depth - 20; // Type16A öndeki pozisyon (rip mantığıyla aynı)
             } else {
               zPos += model13Depth + 3; // Normal öndeki pozisyon (rip mantığıyla aynı)
             }
           }
         }

        connectorMesh.position.set(pos.x, currentHeight, zPos);
        scene.add(connectorMesh);
      }

      // Dikey ripler
      if (i === shelfQuantity - 1) {
        // En alt raftan counter'a kadar olan rip
        const ripHeight = currentHeight - counterHeight;
        const verticalRipGeometry = new THREE.CylinderGeometry(10, 10, ripHeight, 32);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        verticalRip.position.set(
          pos.x,
          counterHeight + ripHeight / 2,
          pos.z + zOffset
        );
        scene.add(verticalRip);
      } else {
        // Raflar arası normal ripler
        const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, shelfSpacing, 32);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
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

      // Kısa kenarlara yatay rip ekle (her durumda)
      shelfPositions.forEach((shelfX) => {
        const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
        const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
        const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

        // Sol ve sağ kısa kenarlar için ripler - modellerin gerçek pozisyonlarını kullan
        let zFront = leftFront.z + zOffset + 5;
        let zBack = leftBack.z + zOffset + 5;
        
        // Ön modellerin pozisyonunu hesapla
        if (showCrossbars) {
          if (type16AGeometry) {
            zFront += model13Depth - 20; // Type16A modelini daha öne kaydır
          } else {
            zFront += model13Depth + 3; // Normal öndeki modeli kaydır
          }
        } else {
          if (type16AGeometry) {
            zFront += model13Depth - 20; // Type16A öndeki pozisyon
          } else {
            zFront += model13Depth + 3;
          }
        }
        
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
        
        const length = Math.abs(zBack - zFront);

        // Bay'in pozisyonunu kontrol et
        const bayIndex = shelfPositions.indexOf(shelfX);
        
        // Sol kısa kenar - sadece en soldaki bay için ekle
        if (bayIndex === 0) {
          const leftRipGeometry = new THREE.CylinderGeometry(10, 10, length, 32);
          const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
          leftRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
          leftRip.position.set(
            leftFront.x,
            currentHeight + model13Height / 2 - 18,
            zFront + (zBack - zFront) / 2
          );
          scene.add(leftRip);
        }

        // Sağ kısa kenar - her bay için ekle (bu şekilde bay'ler arası ortak kenarlar tek olur)
        const rightRipGeometry = new THREE.CylinderGeometry(10, 10, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      });
    }
  }
};