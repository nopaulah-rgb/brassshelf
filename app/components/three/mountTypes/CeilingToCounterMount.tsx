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
  baySpacings = [],
  sectionWidths = [], // Bayslar arası default boşluk 0mm (birleşik)
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
  // Custom section widths için gelişmiş pozisyon hesaplama
  const getShelfPositionsWithCustomWidths = (barCount: number) => {
    const positions = [];
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      const hasCustomWidths = sectionWidths && sectionWidths.length > 0;
      
      if (hasCustomWidths) {
        // Custom widths varsa, her section için gerçek genişliği kullan
        const sectionWidthsArray = [];
        for (let i = 0; i < barCount; i++) {
          const customWidth = sectionWidths.find(sw => sw.sectionIndex === i);
          sectionWidthsArray.push(customWidth ? customWidth.width : effectiveWidth);
        }
        
        // Individual bay spacings kontrolü
        const hasIndividualSpacings = baySpacings && baySpacings.length === barCount - 1;
        let totalSpacing = 0;
        
        if (hasIndividualSpacings) {
          totalSpacing = baySpacings.reduce((sum, spacing) => sum + spacing, 0);
        } else {
          totalSpacing = (barCount - 1) * baySpacing;
        }
        
        // Toplam genişlik: tüm section genişlikleri + spacing'ler
        const totalWidth = sectionWidthsArray.reduce((sum, width) => sum + width, 0) + totalSpacing;
        const startX = -totalWidth / 2 + sectionWidthsArray[0] / 2;
        
        positions.push(startX); // İlk section pozisyonu
        
        // Diğer section pozisyonlarını hesapla
        let currentX = startX;
        for (let i = 1; i < barCount; i++) {
          const spacing = hasIndividualSpacings ? baySpacings[i - 1] : baySpacing;
          currentX += sectionWidthsArray[i - 1] / 2 + spacing + sectionWidthsArray[i] / 2;
          positions.push(currentX);
        }
      } else {
        // Custom widths yoksa, eski mantığı kullan
        return getShelfPositions(barCount);
      }
    }
    return positions;
  };

  const getShelfPositions = (barCount: number) => {
    const positions = [];
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      // Check if we have individual bay spacings
      const hasIndividualSpacings = baySpacings && baySpacings.length === barCount - 1;
      
      if (hasIndividualSpacings) {
        // Use individual bay spacings with uniform width
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

  const shelfPositions = getShelfPositionsWithCustomWidths(barCount);

  // Helper function to get bounding box for a specific section
  const getSectionBoundingBox = (sectionIndex: number) => {
    const hasCustomWidths = sectionWidths && sectionWidths.length > 0;
    if (hasCustomWidths) {
      const customWidth = sectionWidths.find(sw => sw.sectionIndex === sectionIndex);
      if (customWidth) {
        const effectiveWidth = userWidth || shelfWidth;
        const scaleX = customWidth.width / effectiveWidth;
        return {
          min: { x: shelfBoundingBox.min.x * scaleX, z: shelfBoundingBox.min.z },
          max: { x: shelfBoundingBox.max.x * scaleX, z: shelfBoundingBox.max.z }
        };
      }
    }
    return shelfBoundingBox;
  };

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
    shelfPositions.forEach((shelfX, sectionIndex) => {
      let currentShelfGeometry = shelfGeometry;
      
      
      // Check if we have custom section widths
      const hasCustomWidths = sectionWidths && sectionWidths.length > 0;
      if (hasCustomWidths) {
        const customWidth = sectionWidths.find(sw => sw.sectionIndex === sectionIndex);
        if (customWidth) {
          // Create a scaled version of the shelf geometry for this section
          currentShelfGeometry = shelfGeometry.clone();
          const effectiveWidth = userWidth || shelfWidth;
          const scaleX = customWidth.width / effectiveWidth;
          currentShelfGeometry.scale(scaleX, 1, 1);
        }
      }
      
      // Raf ekleme - modellerin üstünde olacak şekilde
      const shelfMesh = new THREE.Mesh(currentShelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight + model13Height + 5, zOffset);
      scene.add(shelfMesh);
    });

    // Tüm sistem için köşe pozisyonlarını hesapla (section-aware)
    const allCornerPositions = [];
    
    if (baySpacing === 0) {
      const firstSectionBox = getSectionBoundingBox(0);
      allCornerPositions.push(
        { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.min.z + 5, sectionIndex: 0, sectionBox: firstSectionBox },
        { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.max.z - 5, sectionIndex: 0, sectionBox: firstSectionBox }
      );
      for (let j = 0; j < barCount - 1; j++) {
        const currentSectionBox = getSectionBoundingBox(j);
        const nextSectionBox = getSectionBoundingBox(j + 1);
        let joinX;
        if (baySpacing === 0) {
          joinX = shelfPositions[j] + currentSectionBox.max.x;
        } else {
          const currentSectionRightEdge = shelfPositions[j] + currentSectionBox.max.x;
          const nextSectionLeftEdge = shelfPositions[j + 1] + nextSectionBox.min.x;
          joinX = (currentSectionRightEdge + nextSectionLeftEdge) / 2;
        }
        const avgSectionBox = {
          min: { x: Math.min(currentSectionBox.min.x, nextSectionBox.min.x), z: Math.min(currentSectionBox.min.z, nextSectionBox.min.z) },
          max: { x: Math.max(currentSectionBox.max.x, nextSectionBox.max.x), z: Math.max(currentSectionBox.max.z, nextSectionBox.max.z) }
        };
        allCornerPositions.push(
          { x: joinX, z: avgSectionBox.min.z + 5, sectionIndex: j, sectionBox: avgSectionBox },
          { x: joinX, z: avgSectionBox.max.z - 5, sectionIndex: j, sectionBox: avgSectionBox }
        );
      }
      const lastSectionBox = getSectionBoundingBox(barCount - 1);
      allCornerPositions.push(
        { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.min.z + 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox },
        { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.max.z - 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox }
      );
    } else {
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        const sectionBox = getSectionBoundingBox(bayIndex);
        allCornerPositions.push(
          { x: sectionBox.min.x + 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol ön
          { x: sectionBox.min.x + 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol arka
          { x: sectionBox.max.x - 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sağ ön
          { x: sectionBox.max.x - 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }  // Sağ arka
        );
      }
    }

    // Modelleri yerleştir
    allCornerPositions.forEach((pos) => {
      // Horizontal bar durumuna ve pozisyona göre model seç
      const isFrente = pos.z === pos.sectionBox.min.z + 5; // Ön pozisyon
      const isBacke = pos.z === pos.sectionBox.max.z - 5;   // Arka pozisyon
      
      let geometryToUse, materialToUse;
      
      // Model seçim mantığı (CeilingMount ile aynı):
      // Front bar YES ve bu raf seçili -> arkadaki modeller Model13 (çünkü arkaya bağlanır)
      // Back bar YES ve bu raf seçili -> öndeki modeller Model13 (çünkü öne bağlanır)
      const shouldUseModel13 = 
        (isFrente && backBars && selectedBackShelvesForBars.includes(pos.sectionIndex)) ||   // Ön pozisyon ve back bar açık ve bu raf seçili
        (isBacke && frontBars && selectedShelvesForBars.includes(pos.sectionIndex));         // Arka pozisyon ve front bar açık ve bu raf seçili
      
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

        // Horizontal bar durumunu kontrol et - pozisyon spesifik (CeilingMount ile aynı)
        const hasHorizontalBarForThisShelf = (isFrente && backBars && selectedBackShelvesForBars.includes(pos.sectionIndex)) || (isBacke && frontBars && selectedShelvesForBars.includes(pos.sectionIndex));

        // Model tipine göre rotasyonlar
        if (hasHorizontalBarForThisShelf) {
          // Bu pozisyon için horizontal bar açık durumunda - Z ekseni rotasyonu uygula
          connectorMesh.rotation.z = Math.PI / 2;
          
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
          // Bu pozisyon için horizontal bar yok - Z ekseni rotasyonu yok
          if (type16AGeometry) {
            if (isBacke) {
              connectorMesh.rotation.y = Math.PI; // Arkadaki Type16A'yı 180 derece çevir
            } else {
              connectorMesh.rotation.y = 0; // Öndeki Type16A standart rotasyon
            }
          } else if (model13Geometry) {
            // Model13 fallback - orijinal rotasyon
            if (isFrente) {
              connectorMesh.rotation.y = 0;
            } else if (isBacke) {
              connectorMesh.rotation.y = Math.PI;
            }
          } else {
            // Eski model1 rotasyonu
            connectorMesh.rotation.y = Math.PI + Math.PI / 2;
          }
        }

        // Pozisyon ayarlamaları (CeilingMount ile aynı mantık)
        let zPos = pos.z + zOffset + 5;
        
        if (shouldUseModel13) {
          // Model13 pozisyonları
          if (isFrente) {
            zPos += model13Depth + 3; // Model13 öndeki pozisyon
          } else if (isBacke) {
            zPos -= model13Depth + 8; // Model13 arkadaki pozisyon
          }
        } else {
          // Type16A pozisyonları
          if (type16AGeometry) {
            if (isFrente) {
              zPos += model13Depth - 20; // Type16A öndeki pozisyon
            } else if (isBacke) {
              zPos += model13Depth - 108; // Type16A arkadaki pozisyon
            }
          } else {
            // Fallback pozisyonlar
            if (isFrente) {
              zPos += model13Depth + 3;
            } else if (isBacke) {
              zPos += model13Depth - 85;
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
        
        // Dikey riplerin pozisyon ayarlamaları
        let verticalRipZAdjustment = 0;
        if (frontBars && pos.z === pos.sectionBox.max.z - 5) {
          // Front bar açık ve arkadaki pozisyon - arkadaki dikey ripleri 10 birim ileri al
          verticalRipZAdjustment = -40;
        } else if (backBars && pos.z === pos.sectionBox.min.z + 5) {
          verticalRipZAdjustment = 25; // Back bar açık ve öndeki pozisyon - 25 birim öne
        }
        
        verticalRip.position.set(
          pos.x,
          currentHeight - (nextSpacingToUse + extensionDown) / 2, // Sadece aşağı uzat
          pos.z + zOffset + verticalRipZAdjustment
        );
        scene.add(verticalRip);
      }
    });

    // Her bay için ayrı ayrı crossbar ve kısa kenar ripleri ekle
    shelfPositions.forEach((shelfX, sectionIndex) => {
      // Front bar için arka crossbar'ları ekle (mevcut mantık korunuyor)
      if (frontBars) {
        // Sadece seçili raflarda horizontal bar ekle
        if (selectedShelvesForBars.includes(i)) {
          const sectionBox = getSectionBoundingBox(sectionIndex);
          const backPositions = [
            { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.max.z - 5 },
            { x: sectionBox.max.x - 5 + shelfX, z: sectionBox.max.z - 5 }
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
            const frontBarZAdjustment = backBars ? -35 : 0;
            const frontBarForwardAdjustment = frontBars ? 20 : 0; // Front bar açık olduğunda 10 birim öne (5'ten 10'a artırıldı)
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2 ,
              currentHeight + model13Height / 2 - 12, // 5 birim yukarıya kaldırıldı (-20'den -15'e)
              (zStart + zEnd) / 2 +28 + frontBarZAdjustment + frontBarForwardAdjustment // 20 birim öne taşındı (15'ten -5'e) + backBars adjustment + frontBars forward
            );
            scene.add(horizontalRip);
          }
        }
      }

      // Back bar için ön crossbar'ları ekle (YENİ)
      if (backBars) {
        // Sadece seçili raflarda horizontal bar ekle
        if (selectedBackShelvesForBars.includes(i)) {
          const sectionBox = getSectionBoundingBox(sectionIndex);
          const frontPositions = [
            { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.min.z + 5 },
            { x: sectionBox.max.x - 5 + shelfX, z: sectionBox.min.z + 5 }
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
            const backBarZAdjustment = backBars ? -35 : 0;
            const frontBarForwardAdjustment = frontBars ? 10 : 0; // Front bar açık olduğunda 10 birim öne (5'ten 10'a artırıldı)
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model13Height / 2 - 15 ,
              (zStart + zEnd) / 2 - 45 + backBarZAdjustment + frontBarForwardAdjustment // Öndeki crossbar pozisyonu - 20 birim daha öne taşındı (57+20=77) + backBars adjustment + frontBars forward
            );
            scene.add(horizontalRip);
          }
        }
      }

      // Kısa kenarlara yatay rip ekle (her durumda) - use section-specific bounding box
      const sectionBox = getSectionBoundingBox(sectionIndex);
      const leftFront = { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.min.z + 5 };
      const leftBack = { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.max.z - 5 };
      const rightFront = { x: sectionBox.max.x - 5 + shelfX, z: sectionBox.min.z + 5 };

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
      
      const length = Math.abs(zBack - zFront) + 58; // Kısa ripleri 3 birim uzat

      // Bay'in pozisyonunu kontrol et
      const bayIndex = shelfPositions.indexOf(shelfX);
      
      if (baySpacing === 0) {
        // Bay spacing 0 ise eski mantık: sol kenar sadece ilk bay, sağ kenar her bay
        // Sol kısa kenar - sadece en soldaki bay veya tek bay durumunda ekle
        if (bayIndex === 0) {
          const leftEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 12 : 10; // Bu shelf için horizontal bar açıksa daha kalın
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
        const rightEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 12 : 10; // Bu shelf için horizontal bar açıksa daha kalın
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
        const leftEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 12 : 10; // Bu shelf için horizontal bar açıksa daha kalın
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
        const rightEdgeRipRadius = (isFrontBarSelectedForThisShelf || isBackBarSelectedForThisShelf) ? 12 : 10; // Bu shelf için horizontal bar açıksa daha kalın
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
  // Tüm sistem için köşe pozisyonlarını hesapla (section-aware)
  const allTopBottomCornerPositions = [];
  
  if (baySpacing === 0) {
    const firstSectionBox = getSectionBoundingBox(0);
    allTopBottomCornerPositions.push(
      { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.min.z + 5, sectionIndex: 0, sectionBox: firstSectionBox },
      { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.max.z - 5, sectionIndex: 0, sectionBox: firstSectionBox }
    );
    for (let j = 0; j < barCount - 1; j++) {
      const currentSectionBox = getSectionBoundingBox(j);
      const nextSectionBox = getSectionBoundingBox(j + 1);
      let joinX;
      if (baySpacing === 0) {
        joinX = shelfPositions[j] + currentSectionBox.max.x;
      } else {
        const currentSectionRightEdge = shelfPositions[j] + currentSectionBox.max.x;
        const nextSectionLeftEdge = shelfPositions[j + 1] + nextSectionBox.min.x;
        joinX = (currentSectionRightEdge + nextSectionLeftEdge) / 2;
      }
      const avgSectionBox = {
        min: { x: Math.min(currentSectionBox.min.x, nextSectionBox.min.x), z: Math.min(currentSectionBox.min.z, nextSectionBox.min.z) },
        max: { x: Math.max(currentSectionBox.max.x, nextSectionBox.max.x), z: Math.max(currentSectionBox.max.z, nextSectionBox.max.z) }
      };
      allTopBottomCornerPositions.push(
        { x: joinX, z: avgSectionBox.min.z + 5, sectionIndex: j, sectionBox: avgSectionBox },
        { x: joinX, z: avgSectionBox.max.z - 5, sectionIndex: j, sectionBox: avgSectionBox }
      );
    }
    const lastSectionBox = getSectionBoundingBox(barCount - 1);
    allTopBottomCornerPositions.push(
      { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.min.z + 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox },
      { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.max.z - 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox }
    );
  } else {
    for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
      const bayX = shelfPositions[bayIndex];
      const sectionBox = getSectionBoundingBox(bayIndex);
      allTopBottomCornerPositions.push(
        { x: sectionBox.min.x + 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol ön
        { x: sectionBox.min.x + 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol arka
        { x: sectionBox.max.x - 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sağ ön
        { x: sectionBox.max.x - 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }  // Sağ arka
      );
    }
  }

  allTopBottomCornerPositions.forEach((pos) => {
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
    
    // Dikey riplerin pozisyon ayarlamaları - ceiling connectors ile aynı mantık
    let verticalRipZAdjustment = 0;
    if (frontBars && pos.z === pos.sectionBox.max.z - 5) {
      // Front bar açık ve arkadaki pozisyon - arkadaki dikey ripleri 10 birim ileri al
      verticalRipZAdjustment = -40;
    } else if (backBars && pos.z === pos.sectionBox.min.z + 5) {
      verticalRipZAdjustment = 25; // Back bar açık ve öndeki pozisyon - dikey riplerle aynı
    }
    
    verticalTopRip.position.set(
      pos.x,
      topShelfHeight + actualTopRipHeight / 2, // Rip'in merkezi
      pos.z + zOffset + verticalRipZAdjustment
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
      pos.z + zOffset + verticalRipZAdjustment
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
    ceilingConnector.position.set(pos.x, connectorCeilingY, pos.z + zOffset + verticalRipZAdjustment);
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
    
    counterConnector.position.set(pos.x, counterTopY, pos.z + zOffset + verticalRipZAdjustment);
    scene.add(counterConnector);
  });
};