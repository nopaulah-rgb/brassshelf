import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";
import { createCabinetDoor } from "../CabinetDoor";

export const handleCeilingToCounterMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0,
  baySpacings = [], // Bayslar arası default boşluk 0mm (birleşik)
  showCrossbars,
  userHeight, // Not used in ceiling mounts - only ceiling - 2" formula
  userWidth,
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
  frontBars,
  backBars,
  pipeDiameter,
  roomHeight = 1500,
  dynamicFloorY = 0,
  selectedShelvesForBars = [],
  selectedBackShelvesForBars = [],
}: MountTypeProps) => {
  // showCrossbars artık kullanılmıyor - frontBars ve backBars ile değiştirildi
  void showCrossbars;
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
        
        // Material'ı clone et ve özelliklerini düzenle
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
        
        // Material'ı clone et ve özelliklerini düzenle
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

  // Ceiling mount için sabit tavan seviyesi
  const baseCeilingY = roomHeight || 1500;
  void userHeight; // Not used in ceiling mounts - only ceiling - 2" formula
  // ÜST MOUNT: userHeight düzeltme hesaplaması  
  // Formül: En Üst Raf Pozisyonu = Reference Point ± Clearance
  // Ceiling To Counter Mount için: topShelf = ceiling - 2" (tavanın 2" altında)
  const topClearance = 50.8; // 2" üst boşluk (mm)
  
  // En üst rafın pozisyonu: ceiling - 2" (topClearance)
  const topShelfY = baseCeilingY - topClearance;
  const baseY = topShelfY; // İlk shelf pozisyonu
  // dynamicFloorY artık kullanılmıyor - ceiling to counter'da sistem sabit
  void dynamicFloorY;
  // shelfSpacing now comes from props
  
  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12; // Çapı artırdık (12.5->16, 8->12)

  // Counter artık zemin seviyesinde sabit konumlandırılıyor
  // Sistem yüksekliğine göre dinamik pozisyonlama kaldırıldı

  // Add counter and doors positioned at ground level (floor-like behavior)
  const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
  // Counter'ı zemin seviyesinde konumlandır
  // Counter zemin gibi davranmalı - geniş ve zeminde
  counter.scale.set(1, 1, 1); // Genişlik 2x (zemin gibi geniş), yükseklik 1x, derinlik 3x (zemin gibi derin)
  counter.position.set(0, 0, -800); // Zemin seviyesinde (y=0) konumlandır
  scene.add(counter);

  // Kapıları da counter ile aynı seviyede konumlandır
  const doorPositions = [-750, -250, 250, 750];
  doorPositions.forEach((xPos) => {
    const door = createCabinetDoor({ 
      geometry: roomGeometry.cabinetDoor, 
      material: whiteRoomMaterial, 
      xPos 
    });
    // Kapıları counter ile aynı y seviyesinde konumlandır (zemin seviyesinde)
    door.position.y = 0;
    scene.add(door);
  });

  // Calculate shelf positions for multiple bars with spacing between them
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      // Check if we have individual bay spacings
      const hasIndividualSpacings = baySpacings && baySpacings.length === barCount - 1;
      
      if (hasIndividualSpacings) {
        // Use individual bay spacings
        const totalSpacing = baySpacings.reduce((sum, spacing) => sum + spacing, 0);
        const totalWidth = (barCount * effectiveWidth) + totalSpacing;
        const startX = -totalWidth / 2 + effectiveWidth / 2;
        
        positions.push(startX); // First bay position
        
        let currentX = startX;
        for (let i = 1; i < barCount; i++) {
          currentX += effectiveWidth + baySpacings[i - 1];
          positions.push(currentX);
        }
      } else if (baySpacing === 0) {
        // Eski mantık: Bayslar birleşik
        const startX = -(barCount - 1) * effectiveWidth / 2;
        for (let i = 0; i < barCount; i++) {
          positions.push(startX + i * effectiveWidth);
        }
      } else {
        // Yeni mantık: Bayslar arası boşluk (uniform spacing)
        const totalSpacing = (barCount - 1) * baySpacing;
        const totalWidth = (barCount * effectiveWidth) + totalSpacing;
        const startX = -totalWidth / 2 + effectiveWidth / 2;
        
        for (let i = 0; i < barCount; i++) {
          positions.push(startX + i * (effectiveWidth + baySpacing));
        }
      }
    }
    return positions;
  };

  const shelfPositions = getShelfPositions(barCount);

  // Ripler için kullanılacak materyali belirle - modeller ile aynı olsun
  const ripMaterial = model13Material || materialGold;

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    // Bu shelf için bar selection durumlarını önceden hesapla
    const isFrontBarSelectedForThisShelf = frontBars && selectedShelvesForBars.includes(i);
    const isBackBarSelectedForThisShelf = backBars && selectedBackShelvesForBars.includes(i);
    
    // Individual spacing için cumulative height hesaplama
    let currentHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      let cumulativeHeight = 0;
      for (let j = 0; j <= i; j++) {
        cumulativeHeight += shelfSpacings[j];
      }
      currentHeight = baseCeilingY - cumulativeHeight; // i. rafın pozisyonu
    } else {
      // Fallback: eşit spacing
      currentHeight = baseY - i * shelfSpacing;
    }

    // Her bir bay için rafları yerleştir
    shelfPositions.forEach((shelfX) => {
      // Raf ekleme - modellerin üstünde olacak şekilde
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight + model13Height + 5, zOffset);
      scene.add(shelfMesh);
    });

    // Tüm sistem için köşe pozisyonlarını hesapla
    const allCornerPositions = [];
    
    if (baySpacing === 0) {
      // Eski mantık: Birleşik bayslar
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
    } else {
      // Yeni mantık: Ayrık bayslar
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        
        // Her bay'in 4 köşesi
        allCornerPositions.push(
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
        );
      }
    }

    // Modelleri yerleştir
    allCornerPositions.forEach((pos) => {
      // Horizontal bar durumuna ve pozisyona göre model seç
      const isFrente = pos.z === shelfBoundingBox.min.z + 5; // Ön pozisyon
      const isBacke = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon
      
      let geometryToUse, materialToUse;
      
      // Model seçim mantığı:
      // Front bar YES ve bu shelf seçili -> arkadaki modeller Model13 (çünkü arkaya bağlanır)
      // Back bar YES ve bu shelf seçili -> öndeki modeller Model13 (çünkü öne bağlanır)
      const shouldUseModel13 = 
        (isFrente && isBackBarSelectedForThisShelf) ||   // Ön pozisyon ve back bar bu shelf için açık
        (isBacke && isFrontBarSelectedForThisShelf);     // Arka pozisyon ve front bar bu shelf için açık
      
      if (shouldUseModel13) {
        // Model13 kullan
        geometryToUse = model13Geometry || model1Geometry;
        materialToUse = model13Material || materialGold;
      } else {
        // Type16A kullan
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

        // Model tipine göre rotasyonlar
        if (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) {
          // Bu shelf için horizontal bar açık durumunda
          if (model13Geometry) {
            // Model13 için rotasyonlar
            if (isFrente) {
              connectorMesh.rotation.y = 0; // Ön taraf - merkeze bakmalı
            } else if (isBacke) {
              connectorMesh.rotation.y = Math.PI; // Arka taraf - merkeze bakmalı (180 derece döndür)
            }
          } else {
            // Eski model1 rotasyonları
            if (isFrente) {
              connectorMesh.rotation.y = Math.PI + Math.PI / 2;
            } else {
              connectorMesh.rotation.y = Math.PI / 2;
            }
          }
        } else {
          // Bu shelf için horizontal bar kapalı - ön ve arka Type16A
          if (type16AGeometry) {
            if (isBacke) {
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

        // Pozisyon ayarlamaları
        let zPos = pos.z + zOffset + 5;
        
        if (isFrente && isBackBarSelectedForThisShelf) {
          // Ön pozisyon ve bu shelf için back bar açık - Model13
          zPos += model13Depth + 3; // Normal öndeki model pozisyonu
        } else if (isBacke && isFrontBarSelectedForThisShelf) {
          // Arka pozisyon ve bu shelf için front bar açık - Model13
          zPos -= model13Depth + 8; // Arkadaki model13.glb pozisyonu
        } else {
          // Type16A pozisyonu
          if (type16AGeometry) {
            if (isFrente) {
              zPos += model13Depth - 20; // Type16A öndeki pozisyon
            }
            if (isBacke) {
              zPos += model13Depth - 108; // Type16A arkadaki pozisyon
            }
          } else {
            // Fallback pozisyonlar
            if (isFrente) {
              zPos += model13Depth + 3;
            }
            if (isBacke) {
              zPos += model13Depth - 85; // Fallback arkadaki
            }
          }
        }

        connectorMesh.position.set(pos.x, currentHeight, zPos);
        scene.add(connectorMesh);
      }

      // Dikey ripler (son raf değilse)
      if (i < shelfQuantity - 1 && shelfQuantity > 1) {
        // Next shelf spacing'i al
        const nextSpacingToUse = shelfSpacings && shelfSpacings.length > i + 1 ? shelfSpacings[i + 1] : shelfSpacing;
        
        // En son rafın bir öncesinde ise uzatma daha az olsun
        const extensionDown = (i === shelfQuantity - 2) ? 0 : 100; // Son rafın bir öncesinde uzatma yok
        const extendedHeight = nextSpacingToUse + extensionDown;
        const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, extendedHeight, 32);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        verticalRip.position.set(
          pos.x,
          currentHeight - (nextSpacingToUse + extensionDown) / 2, // Sadece aşağı uzat
          pos.z + zOffset
        );
        scene.add(verticalRip);
      }
    });

    // Her bay için ayrı ayrı crossbar ve kısa kenar ripleri ekle
    shelfPositions.forEach((shelfX) => {
      // Front bar için arka crossbar'ları ekle (mevcut mantık korunuyor)
      if (frontBars) {
        // Sadece seçili raflarda horizontal bar ekle
        if (selectedShelvesForBars.includes(i)) {
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
            zStart -= model13Depth - 10; // 20 birim öne yaklaştırıldı
            zEnd -= model13Depth - 10; // 20 birim öne yaklaştırıldı

            const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
            const horizontalRipGeometry = new THREE.CylinderGeometry(14, 14, length, 32); // Çap 18'den 14'e küçültüldü
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay duruma getir
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2 ,
              currentHeight + model13Height / 2 - 12, // 5 birim yukarıya kaldırıldı (-20'den -15'e)
              (zStart + zEnd) / 2 +28 // 20 birim öne taşındı (15'ten -5'e)
            );
            scene.add(horizontalRip);
          }
        }
      }

      // Back bar için ön crossbar'ları ekle (YENİ)
      if (backBars) {
        // Sadece seçili raflarda horizontal bar ekle
        if (selectedBackShelvesForBars.includes(i)) {
          const frontPositions = [
            { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 },
            { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 }
          ];

          if (frontPositions.length === 2) {
            // Ön modellerin z konumlarını bul  
            const start = frontPositions[0];
            const end = frontPositions[1];
            let zStart = start.z + zOffset + 5;
            let zEnd = end.z + zOffset + 5;
            
            // Öndeki modellerin pozisyonuna göre ayarla (back bar açık olduğunda öndeki modeller Model13)
            zStart += model13Depth + 3; // Model13 pozisyonu
            zEnd += model13Depth + 3;

            const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
            const horizontalRipGeometry = new THREE.CylinderGeometry(14, 14, length, 32);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay duruma getir
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model13Height / 2 - 15 ,
              (zStart + zEnd) / 2 - 45 // Öndeki crossbar pozisyonu - 20 birim daha öne taşındı (57+20=77)
            );
            scene.add(horizontalRip);
          }
        }
      }

      // Kısa kenarlara yatay rip ekle (her durumda)
      const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
      const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
      const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

      // Sol ve sağ kısa kenarlar için ripler - modellerin gerçek pozisyonlarını kullan
      let zFront = leftFront.z + zOffset + 5;
      let zBack = leftBack.z + zOffset + 5;
      
      // Ön modellerin pozisyonunu hesapla
      if (backBars && selectedBackShelvesForBars.includes(i)) {
        // Bu shelf için back bar açık - öndeki model Model13
        zFront += model13Depth + 3; // Model13 öndeki pozisyon
      } else {
        // Bu shelf için back bar kapalı - Type16A
        if (type16AGeometry) {
          zFront += model13Depth - 20; // Type16A öndeki pozisyon
        } else {
          zFront += model13Depth + 3;
        }
      }
      
      // Arka modellerin pozisyonunu hesapla
      if (frontBars && selectedShelvesForBars.includes(i)) {
        // Bu shelf için front bar açık - arkadaki model Model13
        zBack -= model13Depth; // Model13 arkadaki pozisyon
      } else {
        // Bu shelf için front bar kapalı - Type16A
        if (type16AGeometry) {
          zBack += model13Depth - 108; // Type16A arkadaki pozisyon
        } else {
          zBack += model13Depth - 85; // Normal arkadaki pozisyon
        }
      }
      
      const length = Math.abs(zBack - zFront);

      // Bay'in pozisyonunu kontrol et
      const bayIndex = shelfPositions.indexOf(shelfX);
      
      if (baySpacing === 0) {
        // Bay spacing 0 ise eski mantık: sol kenar sadece ilk bay, sağ kenar her bay
        // Sol kısa kenar - sadece en soldaki bay veya tek bay durumunda ekle
        if (bayIndex === 0) {
          const leftEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 18 : 14; // Bu shelf için horizontal bar açıksa daha kalın
          const leftRipGeometry = new THREE.CylinderGeometry(leftEdgeRipRadius, leftEdgeRipRadius, length, 32);
          const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
          leftRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
          leftRip.position.set(
            leftFront.x,
            currentHeight + model13Height / 2 - 13,
            zFront + (zBack - zFront) / 2
          );
          scene.add(leftRip);
        }

        // Sağ kısa kenar - her bay için ekle (bu şekilde bay'ler arası ortak kenarlar tek olur)
        const rightEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 18 : 14; // Bu shelf için horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 10,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      } else {
        // Bay spacing > 0 ise her bay için hem sol hem sağ kısa kenar
        // Sol kısa kenar
        const leftEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 18 : 14; // Bu shelf için horizontal bar açıksa daha kalın
        const leftRipGeometry = new THREE.CylinderGeometry(leftEdgeRipRadius, leftEdgeRipRadius, length, 32);
        const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
        leftRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
        leftRip.position.set(
          leftFront.x,
          currentHeight + model13Height / 2 - 13,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 18 : 14; // Bu shelf için horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 10,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    });
  }

  // En üstteki raftan tavana ve en alttaki raftan tezgaha kadar olan dikey ripler ve bağlantılar
  // Tüm sistem için köşe pozisyonlarını hesapla
  const allCornerPositions = [];
  
  if (baySpacing === 0) {
    // Eski mantık: Birleşik bayslar
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
  } else {
    // Yeni mantık: Ayrık bayslar
    for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
      const bayX = shelfPositions[bayIndex];
      
      // Her bay'in 4 köşesi
      allCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
        { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
        { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
        { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
      );
    }
  }

  allCornerPositions.forEach((pos) => {
    // Dikey rip: en üst raftan tavana kadar - dinamik uzunluk
    let topShelfHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      // Individual spacing kullanarak en üst rafın pozisyonunu hesapla
      topShelfHeight = baseCeilingY - shelfSpacings[0]; // İlk spacing kadar aşağı
    } else {
      // Fallback: eşit spacing
      topShelfHeight = baseY; // İlk shelf pozisyonu (en üst shelf)
    }
    const actualTopRipHeight = baseCeilingY - topShelfHeight; // Tavan ile üst shelf arası mesafe
    const verticalTopRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, actualTopRipHeight, 32);
    const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, ripMaterial);
    
    verticalTopRip.position.set(
      pos.x,
      topShelfHeight + actualTopRipHeight / 2, // Rip'in merkezi
      pos.z + zOffset
    );
    scene.add(verticalTopRip);

    // Dikey rip: en alt raftan counter'ın üst yüzeyine kadar
    let bottomShelfHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      // Individual spacing kullanarak en alt rafın pozisyonunu hesapla
      let totalCumulativeHeight = 0;
      for (let j = 0; j < shelfQuantity; j++) {
        totalCumulativeHeight += shelfSpacings[j];
      }
      bottomShelfHeight = baseCeilingY - totalCumulativeHeight;
    } else {
      // Fallback: eşit spacing
      bottomShelfHeight = baseY - ((shelfQuantity - 1) * shelfSpacing);
    }
    const counterTopY = 200; // Counter'ın üst yüzeyi (zemin seviyesinde + yarı yükseklik)
    const bottomRipHeight = bottomShelfHeight - counterTopY;
    const verticalBottomRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, bottomRipHeight, 32);
    const verticalBottomRip = new THREE.Mesh(verticalBottomRipGeometry, ripMaterial);
    verticalBottomRip.position.set(
      pos.x,
      counterTopY + bottomRipHeight / 2,
      pos.z + zOffset
    );
    scene.add(verticalBottomRip);

    // Tavan bağlantıları - Type16E v1.glb kullan
    const ceilingGeometry = type16EGeometry || model11Geometry;
    const ceilingMaterial = type16EMaterial || materialGold;
    const ceilingConnector = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceilingConnector.scale.set(1.5, 1.5, 1.5);
    
    // Type16E modeli için farklı rotasyon, eski model için eskisi
    if (type16EGeometry) {
      ceilingConnector.rotation.x = Math.PI * 1.5; // Type16E için 270 derece rotasyon
    } else {
      ceilingConnector.rotation.x = Math.PI; // Eski model rotasyonu
    }
    
    // Ceiling connector pozisyonu - her zaman sabit tavan seviyesinde
    const connectorCeilingY = baseCeilingY; // Sabit tavan seviyesi
    ceilingConnector.position.set(pos.x, connectorCeilingY, pos.z + zOffset);
    scene.add(ceilingConnector);

    // Tezgah bağlantıları - Type16E v1.glb kullan (tavan ile aynı)
    const counterGeometry = type16EGeometry || model11Geometry;
    const counterMaterial = type16EMaterial || materialGold;
    const counterConnector = new THREE.Mesh(counterGeometry, counterMaterial);
    counterConnector.scale.set(1.5, 1.5, 1.5);
    
    // Type16E modeli için farklı rotasyon, eski model için normal
    if (type16EGeometry) {
      counterConnector.rotation.x = Math.PI / 2; // Type16E için counter'da 90 derece öne rotasyon
    }
    
    counterConnector.position.set(pos.x, counterTopY, pos.z + zOffset);
    scene.add(counterConnector);
  });
};