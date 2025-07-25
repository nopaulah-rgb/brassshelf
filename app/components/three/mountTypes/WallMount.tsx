import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleWallMount = async ({
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
  model12Geometry,
  materialGold,
  frontBars,
  pipeDiameter,
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

  const baseY = userHeight || 1195;
  const shelfSpacing = 250;

  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12; // Çapı artırdık (12.5->16, 8->12)

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

    // Tüm köşe pozisyonları için modelleri ekle
    allCornerPositions.forEach((pos) => {
      const isFront = pos.z === shelfBoundingBox.min.z + 5;  // Ön pozisyon
      
      // Ön pozisyonlar için duvar bağlantıları
      if (isFront) {
        const wallGeometry = type16FGeometry || model12Geometry;
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
        
        wallConnector.position.set(pos.x, currentHeight, -roomDepth + 140); // Duvar bağlantısını 90 birim öne getir (-50'den -140'a)
        scene.add(wallConnector);
      }

      // Arka bağlantılar için Model seçimi
      const isBack = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon
      
      if (isBack) {
        let geometryToUse, materialToUse;
        
        if (frontBars) {
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

      // Dikey ripler
      if (i < shelfQuantity - 1) {
        // Raflar arası normal ripler
        const isFront = pos.z === shelfBoundingBox.min.z + 5; // Ön pozisyon kontrolü
        const isBack = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon kontrolü
        
        const edgeExtension = (isFront || isBack) ? 120 : 0; // Ön ve arka ripler için toplam 120 birim uzatma (yukarı+aşağı)
        
        const verticalRipGeometry = new THREE.CylinderGeometry(
          pipeRadius, 
          pipeRadius, 
          shelfSpacing + edgeExtension, 
          32
        );
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        verticalRip.position.set(
          pos.x,
          currentHeight - shelfSpacing / 2, // Merkez pozisyonda tut (hem yukarı hem aşağı eşit uzatma)
          pos.z + zOffset
        );
        scene.add(verticalRip);
      }
    });

    // Her bay için ayrı ayrı crossbar ve kısa kenar ripleri ekle
    shelfPositions.forEach((shelfX) => {
      // Arka crossbar'ları ekle (sadece horizontal bar açık olduğunda)
      if (showCrossbars) {
        const backPositions = [
          { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 }
        ];
        
        if (backPositions.length === 2) {
          const start = backPositions[0];
          const end = backPositions[1];
          let zStart = start.z + zOffset + 5;
          let zEnd = end.z + zOffset + 5;
          zStart -= model13Depth + 10;
          zEnd -= model13Depth + 10;

          const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
          const horizontalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, 32);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
          horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 20,
            (zStart + zEnd) / 2 + 34 // Horizontal bar'ı arkadaki modelin içinden geçir
          );
          scene.add(horizontalRip);
        }
      }

      // Kısa kenarlara yatay rip ekle (her durumda)
      const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
      const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
      const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

      // Sol ve sağ kısa kenarlar için ripler - modellerin gerçek pozisyonlarını kullan
      let zFront = leftFront.z + zOffset + 5;
      let zBack = leftBack.z + zOffset + 5;
      
      // Ön modellerin pozisyonunu hesapla - duvar bağlantısının gerçek pozisyonuna göre
      zFront = -roomDepth + 140; // Duvar bağlantısının pozisyonuyla tam eşleş
      
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
        const leftRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, 32);
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
      const rightRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, 32);
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
};