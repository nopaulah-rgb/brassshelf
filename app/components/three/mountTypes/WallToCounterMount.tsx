import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";
import { createCabinetDoor } from "../CabinetDoor";

export const handleWallToCounterMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
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
  roomHeight = 1500,
  wallConnectionPoint = 'all',
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
  
  // Type16E v1.glb dosyasını counter bağlantıları için yükle
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
  // Wall mount için shelf sistemini duvara göre konumlandır  
  const baseWallY = roomHeight || 1500;
  const baseY = baseWallY - shelfSpacing; // Duvar seviyesinden shelfSpacing kadar aşağı
  // userHeight artık kullanılmıyor - wall position'a göre hesaplanıyor
  void userHeight;

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

  // Function to determine if wall connection should be added at this level
  const shouldAddWallConnection = (currentIndex: number) => {
    switch (wallConnectionPoint) {
      case 'all':
        return true; // Connect to all shelf levels
      case 'first':
        return currentIndex === 0; // Only first shelf
      case 'second':
        return currentIndex === 1 && shelfQuantity > 1; // Only second shelf if exists
      case 'third':
        return currentIndex === 2 && shelfQuantity > 2; // Only third shelf if exists
      case 'top':
        return currentIndex === shelfQuantity - 1; // Only top (highest) shelf
      default:
        return true; // Default: all levels
    }
  };

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
        // Duvara yakın pozisyon (ön - wall side)
        const isWallSide = pos.z === shelfBoundingBox.min.z + 5; // Duvar tarafı
        const isBackSide = pos.z === shelfBoundingBox.max.z - 5;   // Arka taraf
        
        if (isWallSide) {
          // Duvar bağlantısı seviyesi için Type16F kullan
          if (shouldAddWallConnection(i)) {
            const wallGeometry = type16FGeometry || model11Geometry;
            const wallMaterial = type16FMaterial || materialGold;
            const wallConnector = new THREE.Mesh(wallGeometry, wallMaterial);
            wallConnector.scale.set(1.5, 1.5, 1.5);
            
            wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6; // Type16F rotasyonu
            wallConnector.rotation.y = Math.PI;
            
            wallConnector.position.set(pos.x, currentHeight, -roomDepth + 140); // Wall connection position
            scene.add(wallConnector);
          } else {
            // Duvar bağlantısı olmayan seviyeler için - BASIT VE AYNI MANTIK
            const geometryToUse = type16AGeometry || model13Geometry || model1Geometry;
            const materialToUse = type16AMaterial || model13Material || materialGold;
            
            if (geometryToUse) {
              const connectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
              connectorMesh.scale.set(1.5, 1.5, 1.5);
              
              // HEP AYNI ROTASYON - sol ve sağ için fark yok
              connectorMesh.rotation.y = Math.PI;
              
              // HEP AYNI POZİSYON - sol ve sağ için fark yok
              let zPos = pos.z + zOffset + 5;
              zPos += model13Depth - 110; // Hep aynı pozisyon hesaplaması
              
              connectorMesh.position.set(pos.x, currentHeight, zPos);
              scene.add(connectorMesh);
            }
          }
        }

        // Arka bağlantılar için - BASIT VE AYNI MANTIK (sol-sağ aynı)
        if (isBackSide) {
          const geometryToUse = model13Geometry || model1Geometry;
          const materialToUse = model13Material || materialGold;
          
          if (geometryToUse) {
            const backConnectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
            backConnectorMesh.scale.set(1.5, 1.5, 1.5);
            
            // HEP AYNI ROTASYON - arka sol ve sağ için fark yok
            backConnectorMesh.rotation.y = Math.PI;
            
            // HEP AYNI POZİSYON - arka sol ve sağ için fark yok
            let backZPos = pos.z + zOffset + 5;
            backZPos -= model13Depth + 8; // Hep aynı arka pozisyon

            backConnectorMesh.position.set(pos.x, currentHeight, backZPos);
            scene.add(backConnectorMesh);
          }
        }
        
        // Ön bağlantılar - Type16F (duvar bağlantısı) kullanıldığı için ön modelleri eklemeye gerek yok
        // Model13 veya Type16A eklenmeyecek, sadece duvar bağlantısı yeterli

        // Dikey ripler
        
        if (i === shelfQuantity - 1) {
          // En alt raftan counter'a kadar olan rip
          const ripHeight = currentHeight - counterHeight;
          let extendedHeight = ripHeight;
                      if (isWallSide || isBackSide) {
            extendedHeight = ripHeight + 35; // Ön ve arka ripler 35 birim daha uzun
          }
          const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, extendedHeight, 32);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
          verticalRip.position.set(
            pos.x,
            counterHeight + extendedHeight / 2,
            pos.z + zOffset
          );
          scene.add(verticalRip);
        } else {
          // Raflar arası normal ripler
          const shouldExtendRip = useTopShelf && i === 0;
          const baseExtension = shouldExtendRip ? 100 : 0;
                      const edgeExtension = (isWallSide || isBackSide) ? 35 : 0; // Ön ve arka ripler için ekstra uzatma
          const totalExtension = baseExtension + edgeExtension;
          
          const verticalRipGeometry = new THREE.CylinderGeometry(
            pipeRadius, 
            pipeRadius, 
            shelfSpacing + totalExtension, 
            32
          );
          const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
          verticalRip.position.set(
            pos.x,
            currentHeight - shelfSpacing / 2 + (shouldExtendRip ? 50 : 0) + ((isWallSide || isBackSide) ? 17.5 : 0),
            pos.z + zOffset
          );
          scene.add(verticalRip);
        }
      });
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
          const horizontalRipRadius = showCrossbars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
          const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, length, 32);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
          horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 20,
            (zStart + zEnd) / 2 + 15
          );
          scene.add(horizontalRip);
        }

        // Kısa kenarlara yatay rip ekle
        const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
        const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
        const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

        // Sol kısa kenar
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
        
        const leftLength = Math.abs(zBack - zFront);
        const edgeRipRadius = showCrossbars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const leftRipGeometry = new THREE.CylinderGeometry(edgeRipRadius, edgeRipRadius, leftLength, 32);
        const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
        leftRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        leftRip.position.set(
          leftFront.x,
          currentHeight + model13Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightEdgeRipRadius = showCrossbars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, leftLength, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      });
    } else {
      // Horizontal bar kapalı (horizontal orientation) - kısa kenarlara ripler ekle
      shelfPositions.forEach((shelfX) => {
        const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
        const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
        const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

        // Sol kısa kenar ripi
        let zFront = leftFront.z + zOffset + 5;
        let zBack = leftBack.z + zOffset + 5;
        
        // Ön modellerin pozisyonunu hesapla - duvar bağlantısının gerçek pozisyonuyla tam eşleş
        zFront = -roomDepth + 140; // Duvar bağlantısının pozisyonuyla tam eşleş
        
        // Arka modellerin pozisyonunu hesapla
        if (type16AGeometry) {
          zBack += model13Depth - 108; // Type16A arkadaki pozisyon
        } else {
          zBack += model13Depth - 85; // Normal arkadaki pozisyon
        }
        
        const leftLength = Math.abs(zBack - zFront);
        const leftEdgeRipRadius = showCrossbars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const leftRipGeometry = new THREE.CylinderGeometry(leftEdgeRipRadius, leftEdgeRipRadius, leftLength, 32);
        const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
        leftRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        leftRip.position.set(
          leftFront.x,
          currentHeight + model13Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar ripi
        const rightShelfEdgeRipRadius = showCrossbars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightShelfEdgeRipRadius, rightShelfEdgeRipRadius, leftLength, 32);
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

  // En alttaki raftan tezgaha kadar olan dikey ripler ve bağlantılar
  shelfPositions.forEach((shelfX) => {
    const cornerPositions = [
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.max.z - 5 },
    ];

    cornerPositions.forEach((pos) => {
      // Dikey rip: en alt raftan tezgaha kadar
      const bottomShelfHeight = baseY - ((shelfQuantity - 1) * shelfSpacing);
      const bottomRipHeight = bottomShelfHeight - counterHeight;
      const verticalBottomRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, bottomRipHeight, 32);
      const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, ripMaterial);
      verticalBottomRip.position.set(
        pos.x,
        counterHeight + bottomRipHeight / 2,
        pos.z + zOffset
      );
      scene.add(verticalBottomRip);

      // Tezgah bağlantıları
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
  });
}; 