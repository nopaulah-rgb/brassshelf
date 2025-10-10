import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingToWallMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0,
  baySpacings = [], // Bayslar arası default boşluk 0mm (birleşik)
  sectionWidths = [], // Custom section widths
  showCrossbars,
  userHeight, // eslint-disable-line @typescript-eslint/no-unused-vars
  userWidth,
  shelfGeometry,
  shelfMaterial,
  zOffset,
  shelfWidth,
  shelfBoundingBox,
  model1Geometry,
  model11Geometry,
  materialGold,
  frontBars,
  pipeDiameter,
  roomDepth = 1200,
  roomHeight = 1500,
  wallConnectionPoint = ['all'],
  selectedShelvesForBars = [],
  backVertical = true, // Default: Yes (arkaya dikey bağlantı aktif)
}: MountTypeProps) => {
  // Check if wall connection should be added for current shelf level
  const shouldAddWallConnection = (currentShelfIndex: number, totalShelves: number) => {
    // Handle array of connection points
    if (wallConnectionPoint.includes('all')) {
      return true; // Connect to all shelf levels
    }
    
    // Check for top shelf
    if (wallConnectionPoint.includes('top') && currentShelfIndex === totalShelves - 1) {
      return true;
    }
    
    // Check for dynamic shelf IDs (shelf-1, shelf-2, etc.)
    const shelfId = `shelf-${currentShelfIndex + 1}`;
    if (wallConnectionPoint.includes(shelfId)) {
      return true;
    }
    
    // Legacy support for old hardcoded IDs
    if (wallConnectionPoint.includes('first') && currentShelfIndex === 0) {
      return true;
    }
    if (wallConnectionPoint.includes('second') && currentShelfIndex === 1 && totalShelves > 1) {
      return true;
    }
    if (wallConnectionPoint.includes('third') && currentShelfIndex === 2 && totalShelves > 2) {
      return true;
    }
    
    return false; // No connection if none of the conditions match
  };

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

  // showCrossbars artık kullanılmıyor - frontBars ile değiştirildi
  void showCrossbars;
  
  // Ceiling mount için sabit tavan seviyesi
  const baseCeilingY = roomHeight || 1500;
  
  // ÜST MOUNT: userHeight düzeltme hesaplaması  
  // Formül: En Üst Raf Pozisyonu = Reference Point ± Clearance
  // Ceiling To Wall Mount için: topShelf = ceiling - 2" (tavanın 2" altında)
  const topClearance = 50.8; // 2" üst boşluk (mm)
  
  // En üst rafın pozisyonu: ceiling - 2" (topClearance)
  const topShelfY = baseCeilingY - topClearance;
  const adjustedBaseY = topShelfY; // İlk raf pozisyonu
  
  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12; // Çapı artırdık (12.5->16, 8->12)

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

  // Calculate shelf positions considering custom section widths
  const getShelfPositionsWithCustomWidths = (barCount: number) => {
    const positions = [];
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      const hasCustomWidths = sectionWidths && sectionWidths.length > 0;
      
      if (hasCustomWidths) {
        // Use custom section widths
        const sectionWidthsArray = [];
        for (let i = 0; i < barCount; i++) {
          const customWidth = sectionWidths.find(sw => sw.sectionIndex === i);
          sectionWidthsArray.push(customWidth ? customWidth.width : effectiveWidth);
        }
        
        // Calculate total width including spacings
        const hasIndividualSpacings = baySpacings && baySpacings.length === barCount - 1;
        let totalSpacing = 0;
        
        if (hasIndividualSpacings) {
          totalSpacing = baySpacings.reduce((sum, spacing) => sum + spacing, 0);
        } else {
          totalSpacing = (barCount - 1) * baySpacing;
        }
        
        const totalWidth = sectionWidthsArray.reduce((sum, width) => sum + width, 0) + totalSpacing;
        const startX = -totalWidth / 2 + sectionWidthsArray[0] / 2;
        
        positions.push(startX); // First section position
        
        let currentX = startX;
        for (let i = 1; i < barCount; i++) {
          const spacing = hasIndividualSpacings ? baySpacings[i - 1] : baySpacing;
          currentX += sectionWidthsArray[i - 1] / 2 + spacing + sectionWidthsArray[i] / 2;
          positions.push(currentX);
        }
      } else {
        // Fall back to original logic
        return getShelfPositions(barCount);
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

  // Calculate shared corner positions for multiple bays (section-aware)
  const getAllCornerPositions = (): { x: number; z: number; sectionIndex: number; sectionBox: { min: { x: number; z: number }; max: { x: number; z: number } } }[] => {
    const allCorners: { x: number; z: number; sectionIndex: number; sectionBox: { min: { x: number; z: number }; max: { x: number; z: number } } }[] = [];
    
    if (baySpacing === 0) {
      // Eski mantık: Birleşik bayslar
      // Sol en dış köşeler
      const firstSectionBox = getSectionBoundingBox(0);
      allCorners.push(
        { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.min.z + 5, sectionIndex: 0, sectionBox: firstSectionBox },
        { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.max.z - 5, sectionIndex: 0, sectionBox: firstSectionBox }
      );
      
      // Orta bağlantı noktaları (her bay arası için)
      for (let j = 0; j < barCount - 1; j++) {
        const currentSectionBox = getSectionBoundingBox(j);
        const nextSectionBox = getSectionBoundingBox(j + 1);
        
        // baySpacing === 0 durumunda raflar birleşik, bağlantı noktası tam birleşim yerinde
        let joinX;
        if (baySpacing === 0) {
          // Birleşik durumda: j. section'ın sağ kenarı = (j+1). section'ın sol kenarı
          joinX = shelfPositions[j] + currentSectionBox.max.x;
        } else {
          // Aralıklı durumda: iki section arasındaki orta nokta
          const currentSectionRightEdge = shelfPositions[j] + currentSectionBox.max.x;
          const nextSectionLeftEdge = shelfPositions[j + 1] + nextSectionBox.min.x;
          joinX = (currentSectionRightEdge + nextSectionLeftEdge) / 2;
        }
        
        // Bağlantı noktası için ortalama bounding box kullan
        const avgSectionBox = {
          min: { 
            x: Math.min(currentSectionBox.min.x, nextSectionBox.min.x), 
            z: Math.min(currentSectionBox.min.z, nextSectionBox.min.z) 
          },
          max: { 
            x: Math.max(currentSectionBox.max.x, nextSectionBox.max.x), 
            z: Math.max(currentSectionBox.max.z, nextSectionBox.max.z) 
          }
        };
        
        allCorners.push(
          { x: joinX, z: avgSectionBox.min.z + 5, sectionIndex: j, sectionBox: avgSectionBox },
          { x: joinX, z: avgSectionBox.max.z - 5, sectionIndex: j, sectionBox: avgSectionBox }
        );
      }
      
      // Sağ en dış köşeler
      const lastSectionBox = getSectionBoundingBox(barCount - 1);
      allCorners.push(
        { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.min.z + 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox },
        { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.max.z - 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox }
      );
    } else {
      // Yeni mantık: Ayrık bayslar
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        const sectionBox = getSectionBoundingBox(bayIndex);
        
        // Her bay'in 4 köşesi
        allCorners.push(
          { x: sectionBox.min.x + 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol ön
          { x: sectionBox.min.x + 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol arka
          { x: sectionBox.max.x - 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sağ ön
          { x: sectionBox.max.x - 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }  // Sağ arka
        );
      }
    }
    
    return allCorners;
  };

  const adjustedCornerPositions = getAllCornerPositions();

  // Vertical rip Z-position calculator (CeilingMount parity)
  const computeVerticalZPos = (pos: { z: number; sectionBox: { min: { z: number }; max: { z: number } } }) => {
    const isFront = Math.abs(pos.z - (pos.sectionBox.min.z + 5)) < 0.008;
    const isBack = Math.abs(pos.z - (pos.sectionBox.max.z - 5)) < 0.008;
    let z = pos.z + zOffset + 5; // base offset
    if (isFront) {
      if (frontBars) z -= 5; // front horizontal açıkken 5 geri
    } else if (isBack) {
      if (frontBars) z -= 20; // arka için 20 geri
    }
    return z;
  };

  // Tavan bağlantıları - backVertical seçeneğine göre
  adjustedCornerPositions.forEach((pos) => {
    const isFrontPosition = Math.abs(pos.z - (pos.sectionBox.min.z + 5)) < 0.008; // Ön pozisyon
    
    // Back Vertical: NO ve ön pozisyonlarda tavan modelini kaldır (dikey rip olmadığı için gerek yok)
    if (!backVertical && isFrontPosition) {
      // Ön pozisyonlarda Type16E kullanılacak ama dikey rip olmayacağı için tavan bağlantısı ekleme
      return;
    }
    
    // Normal tavan bağlantıları
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
    
    // Ceiling connector pozisyonu - CeilingMount'daki gibi
    const topShelfHeight = adjustedBaseY; // İlk shelf pozisyonu (en üst shelf)
    const connectorCeilingY = topShelfHeight + shelfSpacing; // CeilingMount'daki gibi
    // Ceiling connector Z - vertical rip ile tam aynı hizaya getir
    const ceilingConnectorZPos = computeVerticalZPos(pos);
    ceilingConnector.position.set(pos.x, connectorCeilingY, ceilingConnectorZPos);
    scene.add(ceilingConnector);

    // Tek parça top rip: ceiling connector'dan en üst rafa kadar (CeilingFloorWallMount uyumu)
    const ceilingConnectorY = connectorCeilingY;
    const topShelfY = topShelfHeight;
    const actualTopRipHeight = ceilingConnectorY - topShelfY;
    const verticalTopRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, actualTopRipHeight, 32);
    const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, ripMaterial);
    const topRipZPos = computeVerticalZPos(pos);
    verticalTopRip.position.set(
      pos.x,
      topShelfY + actualTopRipHeight / 2,
      topRipZPos
    );
    scene.add(verticalTopRip);
  });

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    // Individual spacing için cumulative height hesaplama
    let currentHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      let cumulativeHeight = 0;
      for (let j = 0; j < i; j++) {
        cumulativeHeight += shelfSpacings[j];
      }
      currentHeight = adjustedBaseY - cumulativeHeight;
    } else {
      // Fallback: eşit spacing
      currentHeight = adjustedBaseY - (i * shelfSpacing);
    }

    // Her bir bay için rafları yerleştir - modellerin üstünde
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
      
      const shelfMesh = new THREE.Mesh(currentShelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight + model13Height * 1, zOffset); // Model yüksekliği kadar yukarı taşı
      scene.add(shelfMesh);
    });

    // Tüm sistem için köşe pozisyonlarını hesapla (section-aware)
    const allCornerPositions = [];
    
    if (baySpacing === 0) {
      // Eski mantık: Birleşik bayslar
      // Sol en dış köşeler
      const firstSectionBox = getSectionBoundingBox(0);
      allCornerPositions.push(
        { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.min.z + 5, sectionIndex: 0, sectionBox: firstSectionBox },
        { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.max.z - 5, sectionIndex: 0, sectionBox: firstSectionBox }
      );
      
      // Orta bağlantı noktaları (her bay arası için)
      for (let j = 0; j < barCount - 1; j++) {
        const currentSectionBox = getSectionBoundingBox(j);
        const nextSectionBox = getSectionBoundingBox(j + 1);
        
        // baySpacing === 0 durumunda raflar birleşik, bağlantı noktası tam birleşim yerinde
        let joinX;
        if (baySpacing === 0) {
          // Birleşik durumda: j. section'ın sağ kenarı = (j+1). section'ın sol kenarı
          joinX = shelfPositions[j] + currentSectionBox.max.x;
        } else {
          // Aralıklı durumda: iki section arasındaki orta nokta
          const currentSectionRightEdge = shelfPositions[j] + currentSectionBox.max.x;
          const nextSectionLeftEdge = shelfPositions[j + 1] + nextSectionBox.min.x;
          joinX = (currentSectionRightEdge + nextSectionLeftEdge) / 2;
        }
        
        // Bağlantı noktası için ortalama bounding box kullan
        const avgSectionBox = {
          min: { 
            x: Math.min(currentSectionBox.min.x, nextSectionBox.min.x), 
            z: Math.min(currentSectionBox.min.z, nextSectionBox.min.z) 
          },
          max: { 
            x: Math.max(currentSectionBox.max.x, nextSectionBox.max.x), 
            z: Math.max(currentSectionBox.max.z, nextSectionBox.max.z) 
          }
        };
        
        allCornerPositions.push(
          { x: joinX, z: avgSectionBox.min.z + 5, sectionIndex: j, sectionBox: avgSectionBox },
          { x: joinX, z: avgSectionBox.max.z - 5, sectionIndex: j, sectionBox: avgSectionBox }
        );
      }
      
      // Sağ en dış köşeler
      const lastSectionBox = getSectionBoundingBox(barCount - 1);
      allCornerPositions.push(
        { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.min.z + 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox },
        { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.max.z - 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox }
      );
    } else {
      // Yeni mantık: Ayrık bayslar
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        const sectionBox = getSectionBoundingBox(bayIndex);
        
        // Her bay'in 4 köşesi
        allCornerPositions.push(
          { x: sectionBox.min.x + 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol ön
          { x: sectionBox.min.x + 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol arka
          { x: sectionBox.max.x - 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sağ ön
          { x: sectionBox.max.x - 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }  // Sağ arka
        );
      }
    }

    allCornerPositions.forEach((pos) => {
      // Add wall connections for all front positions - backVertical seçeneğine göre
      if (pos.z === pos.sectionBox.min.z + 5 && shouldAddWallConnection(i, shelfQuantity)) {
        let wallGeometry, wallMaterial;
        
        if (backVertical) {
          // Back Vertical: YES -> Type16F kullan (hiçbir şey değişmez)
          wallGeometry = type16FGeometry || model11Geometry;
          wallMaterial = type16FMaterial || materialGold;
        } else {
          // Back Vertical: NO -> Type16E kullan (duvara bağlanan model değişir)
          wallGeometry = type16EGeometry || model11Geometry;
          wallMaterial = type16EMaterial || materialGold;
        }
        
        const wallConnector = new THREE.Mesh(wallGeometry, wallMaterial);
        wallConnector.scale.set(1.5, 1.5, 1.5);
        
        if (backVertical) {
          // Type16F rotasyonları
          if (type16FGeometry) {
            wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6; // 90 + 45 + 30 = 165 derece Z ekseninde
            wallConnector.rotation.y = Math.PI; // 180 derece Y ekseninde
          } else {
            // Eski model rotasyonları
            wallConnector.rotation.z = Math.PI / 2;
            wallConnector.rotation.y = Math.PI / 2;
          }
        } else {
          // Type16E rotasyonları (aynı rotasyon)
          if (type16EGeometry) {
            wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6;
            wallConnector.rotation.y = Math.PI;
          } else {
            // Fallback rotasyon
            wallConnector.rotation.z = Math.PI / 2;
            wallConnector.rotation.y = Math.PI / 2;
          }
        }
        
        wallConnector.position.set(pos.x, currentHeight, -roomDepth + 140); // Wall connection position
        scene.add(wallConnector);
      }
      
      // Duvar bağlantısı olmayan seviyeler için - horizontal bar durumuna göre model seçimi
      // Ön pozisyonlar için (duvar bağlantısı olmayan)
      if (pos.z === pos.sectionBox.min.z + 5 && !shouldAddWallConnection(i, shelfQuantity)) {

        let geometryToUse, materialToUse;
        
        // Model seçim mantığı - CeilingMount'tan uyarlanan:
        // Front bar YES ve bu raf seçili -> hem ön hem arka pozisyonlarda Model13 kullan
        const isFrente = pos.z === pos.sectionBox.min.z + 5; // Ön pozisyon
        const isBacke = pos.z === pos.sectionBox.max.z - 5;   // Arka pozisyon
        
        const shouldUseModel13 = 
          (isFrente && frontBars && selectedShelvesForBars.includes(i)) ||   // Ön pozisyon ve front bar açık ve bu raf seçili
          (isBacke && frontBars && selectedShelvesForBars.includes(i));      // Arka pozisyon ve front bar açık ve bu raf seçili
        
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
          
          // Model tipine göre rotasyonlar - CeilingMount'daki gibi
          const hasHorizontalBarForThisShelf = frontBars && selectedShelvesForBars.includes(i);
          
          if (hasHorizontalBarForThisShelf && shouldUseModel13) {
            // Bu raf için horizontal bar var durumunda - Model13 rotasyonu
            if (model13Geometry) {
              // Model13 için rotasyonlar - Z ekseni etrafında 90 derece döndür
              connectorMesh.rotation.z = Math.PI / 2; // Z ekseni etrafında 90 derece döndür
              if (isFrente) {
                connectorMesh.rotation.y = 0; // Ön taraf - merkeze bakmalı
              } else if (isBacke) {
                connectorMesh.rotation.y = Math.PI; // Arka taraf - merkeze bakmalı (180 derece döndür)
              }
            } else {
              // Eski model1 rotasyonları - Z ekseni etrafında döndür
              connectorMesh.rotation.z = Math.PI / 2; // Z ekseni etrafında 90 derece döndür
              if (isFrente) {
                connectorMesh.rotation.y = Math.PI + Math.PI / 2;
              } else {
                connectorMesh.rotation.y = Math.PI / 2;
              }
            }
          } else {
            // Bu raf için horizontal bar yok - normal rotasyon
            if (type16AGeometry && !shouldUseModel13) {
              if (isBacke) {
                connectorMesh.rotation.y = Math.PI; // Arkadaki Type16A'yı 180 derece çevir
              } else {
                connectorMesh.rotation.y = 0; // Öndeki Type16A standart rotasyon
              }
            } else if (model13Geometry && shouldUseModel13) {
              // Model13 için eski rotasyon (horizontal bar olmayan durumda)
              if (isFrente) {
                connectorMesh.rotation.y = Math.PI + Math.PI / 2; // Öndeki Model13 eski rotasyonu
              } else {
                connectorMesh.rotation.y = Math.PI / 2; // Arkadaki Model13 eski rotasyonu
              }
            } else {
              connectorMesh.rotation.y = Math.PI + Math.PI / 2; // Eski model1 rotasyonu
            }
          }
          
          // Pozisyon hesaplaması - CeilingMount'daki gibi
          let zPos = pos.z + zOffset + 5;
          
          if (isFrente && frontBars && selectedShelvesForBars.includes(i)) {
            // Ön pozisyon ve front bar açık ve bu raf seçili - Model13
            zPos += model13Depth + 20; // CeilingMount'daki gibi
            zPos -= -35; // Front bar açık olduğunda 5 birim geriye çek
          } else if (isBacke && frontBars && selectedShelvesForBars.includes(i)) {
            // Arka pozisyon ve front bar açık ve bu raf seçili - Model13
            zPos -= model13Depth + 28; // CeilingMount'daki gibi
            zPos -= 5; // Front bar açık olduğunda 5 birim geriye çek
          } else {
            // Type16A pozisyonu (bu raf için horizontal bar yok)
            if (type16AGeometry) {
              if (isFrente) {
                // Front bar YES ve raf seçili değilse öndeki Type16A'yı öne al
                if (frontBars && !selectedShelvesForBars.includes(i)) {
                  zPos += model13Depth - 5; // CeilingMount'daki gibi
                } else {
                  zPos += model13Depth - 20; // Type16A öndeki normal pozisyon
                }
              }
              if (isBacke) {
                // Front bar YES olduğunda arkadaki modelleri geriye it
                if (frontBars) {
                  zPos += model13Depth - 140; // CeilingMount'daki gibi
                } else {
                  zPos += model13Depth - 108; // Type16A arkadaki normal pozisyon
                }
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
      }

      // Duvara yatay rip ekle - tüm ön pozisyonlarda (sadece seçili raflarda)
      if (pos.z === pos.sectionBox.min.z + 5 && selectedShelvesForBars.includes(i)) {
        const horizontalRipLength = Math.abs(pos.z + zOffset + roomDepth - 140); // 105'ten 140'a güncellendi
        const horizontalRipRadius = frontBars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, horizontalRipLength, 32);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
        horizontalRip.rotation.x = Math.PI / 2; // Yatay pozisyon için X ekseninde 90 derece döndür
        horizontalRip.position.set(
          pos.x,
          currentHeight,
          (pos.z + zOffset - roomDepth + 140) / 2 // 105'ten 140'a güncellendi
        );
        scene.add(horizontalRip);
      }

      // Arka pozisyonlar için Model seçimi - front bar durumuna göre
      const isBack = pos.z === pos.sectionBox.max.z - 5;   // Arka pozisyon
      
      // Front bar açık olduğunda arka pozisyonlarda da model ekle
      if (isBack) {
        let geometryToUse, materialToUse;
        
        // Model seçim mantığı:
        // Front bar YES ve bu raf seçili -> arkadaki modeller Model13 kullan
        const shouldUseModel13 = (isBack && frontBars && selectedShelvesForBars.includes(i));
        
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
          const backConnectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
          backConnectorMesh.scale.set(1.5, 1.5, 1.5);
          
          // Model tipine göre rotasyonlar - CeilingMount'daki gibi
          const hasHorizontalBarForThisShelf = frontBars && selectedShelvesForBars.includes(i);
          
          if (hasHorizontalBarForThisShelf && shouldUseModel13) {
            // Bu raf için horizontal bar var durumunda - Model13 rotasyonu
            if (model13Geometry) {
              // Model13 için rotasyonlar - Z ekseni etrafında 90 derece döndür
              backConnectorMesh.rotation.z = Math.PI / 2; // Z ekseni etrafında 90 derece döndür
              backConnectorMesh.rotation.y = Math.PI; // Arka taraf - merkeze bakmalı (180 derece döndür)
            } else {
              // Eski model1 rotasyonları - Z ekseni etrafında döndür
              backConnectorMesh.rotation.z = Math.PI / 2; // Z ekseni etrafında 90 derece döndür
              backConnectorMesh.rotation.y = Math.PI / 2;
            }
          } else {
            // Bu raf için horizontal bar yok - normal rotasyon
            if (type16AGeometry && !shouldUseModel13) {
              backConnectorMesh.rotation.y = Math.PI; // Arkadaki Type16A'yı 180 derece çevir
            } else if (model13Geometry && shouldUseModel13) {
              // Model13 için eski rotasyon (horizontal bar olmayan durumda)
              backConnectorMesh.rotation.y = Math.PI / 2; // Arkadaki Model13 eski rotasyonu
            } else {
              backConnectorMesh.rotation.y = Math.PI / 2; // Fallback rotasyon
            }
          }
          
          // Pozisyon ayarlamaları - CeilingMount'daki gibi
          let backZPos = pos.z + zOffset + 5;
          
          if (frontBars && selectedShelvesForBars.includes(i)) {
            // Front bar açık ve bu raf seçili - Model13 pozisyonu
            backZPos -= model13Depth + 28; // CeilingMount'daki gibi
            backZPos -= 5; // Front bar açık olduğunda 5 birim geriye çek
          } else {
            // Front bar kapalı veya bu raf seçili değil - Type16A pozisyonu
            if (type16AGeometry) {
              // Front bar YES olduğunda arkadaki modelleri geriye it
              if (frontBars) {
                backZPos += model13Depth - 140; // CeilingMount'daki gibi
              } else {
                backZPos += model13Depth - 108; // Type16A arkadaki normal pozisyon
              }
            } else {
              backZPos += model13Depth - 85; // Fallback pozisyon
            }
          }

          backConnectorMesh.position.set(pos.x, currentHeight, backZPos);
          scene.add(backConnectorMesh);
        }
      }
        
      // Dikey ripler (raflar arası - sadece ceiling to wall için) - backVertical seçeneğine göre
      if (i < shelfQuantity - 1) {
        const isFront = Math.abs(pos.z - (pos.sectionBox.min.z + 5)) < 0.001; // Ön pozisyon (toleranslı)
        
        // Back Vertical: NO olduğunda TÜM ön pozisyonlardaki dikey ripler kaldırılır
        if (!backVertical && isFront) {
          // Back Vertical NO - ön pozisyonlarda dikey rip ekleme
          return;
        }
        
        // Normal raflar arası ripler - doğru spacing değerini kullan
        // Individual spacing durumunda bir sonraki rafın spacing değerini al
        let nextSpacing;
        if (shelfSpacings && shelfSpacings.length > i + 1) {
          nextSpacing = shelfSpacings[i + 1];
        } else {
          nextSpacing = shelfSpacing; // Fallback
        }
        
        let totalExtension = nextSpacing; // Doğru spacing değerini kullan
        
        // Type16A kullanılan raflar için uzama ekle
        if (!selectedShelvesForBars.includes(i) && type16AGeometry) {
          const type16AExtension = 80; // Type16A için ek uzama
          totalExtension += type16AExtension;
        }
        
        
        const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, totalExtension, 32);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        // CeilingMount mantığına uyumlu ön/arka tespiti ve Z ayarı
        const isFrontPosition = Math.abs(pos.z - (pos.sectionBox.min.z + 5)) < 0.008; // Ön
        const isBackPosition = Math.abs(pos.z - (pos.sectionBox.max.z - 5)) < 0.008; // Arka
        let finalZPos = pos.z + zOffset;
        if (isFrontPosition) {
          finalZPos += 5; // base offset (CeilingMount)
          if (frontBars) {
            finalZPos -= 5; // front horizontal açıkken öndeki dikey ripleri 5 geri
          }
        } else if (isBackPosition) {
          finalZPos += 5; // base offset
          if (frontBars) {
            finalZPos -= 20; // CeilingMount'taki arkadaki geri çekilme mantığı
          }
        }
        
        verticalRip.position.set(
          pos.x,
          currentHeight - totalExtension / 2,
          finalZPos
        );
        scene.add(verticalRip);
      } else if (i === shelfQuantity - 1) {
        // En alttaki raf için 2 inç (50mm) aşağı uzanan rip ekle - backVertical seçeneğine göre
        const isFront = pos.z === shelfBoundingBox.min.z + 5; // Ön pozisyon
        
        // Back Vertical: NO olduğunda TÜM ön pozisyonlardaki alt ripler kaldırılır
        if (!backVertical && isFront) {
          // Back Vertical NO - ön pozisyonlarda alt rip ekleme
          return;
        }
        
        // Normal alt çıkıntı ripi
        // En alttaki raf için 2 inç (50mm) aşağı uzanan rip ekle - SABIT UZUNLUK
        // Raf sayısı 1 olsun 5 olsun hep aynı 50mm çıkıntı
        const bottomExtension = 50; // 2 inç = 50mm - HER ZAMAN SABİT
        
        
        const bottomRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, bottomExtension, 32);
        const bottomRip = new THREE.Mesh(bottomRipGeometry, ripMaterial);
        
        // Alt çıkıntı pozisyonu: Son raftan bottomExtension/2 kadar aşağı (ripin merkezi)
        // Bu şekilde ripin alt ucu son raftan tam bottomExtension (50mm) aşağı olur
        // Arka pozisyonlardaki alt ripleri de arkaya doğru hareket ettir
        let bottomFinalZPos = pos.z + zOffset;
        const isFrontBottomPosition = Math.abs(pos.z - (pos.sectionBox.min.z + 5)) < 0.008;
        const isBackBottomPosition = Math.abs(pos.z - (pos.sectionBox.max.z - 5)) < 0.008;
        if (isFrontBottomPosition) {
          bottomFinalZPos += 5; // base offset
          if (frontBars) bottomFinalZPos -= 5; // front açıkken 5 geri
        } else if (isBackBottomPosition) {
          bottomFinalZPos += 5; // base offset
          if (frontBars) bottomFinalZPos -= 20; // arka için aynı mantık
        }
        
        bottomRip.position.set(
          pos.x,
          currentHeight - bottomExtension / 2, // Ripin merkezi: son raf - 25mm
          bottomFinalZPos
        );
        scene.add(bottomRip);
      }
    });

    // Kısa kenarlara yatay rip ekle (her durumda - horizontal bar durumundan bağımsız)
    shelfPositions.forEach((shelfX, sectionIndex) => {
      const sectionBox = getSectionBoundingBox(sectionIndex);
      const leftFront = { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.min.z + 5 };
      const leftBack = { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.max.z - 5 };
      const rightFront = { x: sectionBox.max.x - 5 + shelfX, z: sectionBox.min.z + 5 };

      // Sol ve sağ kısa kenarlar için ripler - modellerin gerçek pozisyonlarını kullan
      let zFront = leftFront.z + zOffset + 5;
      let zBack = leftBack.z + zOffset + 5;
      
      // Ön modellerin pozisyonunu hesapla - duvar bağlantısının gerçek pozisyonuna göre
      zFront = -roomDepth + 140; // Duvar bağlantısının pozisyonuyla tam eşleş
      
      // Arka modellerin pozisyonunu hesapla
      if (frontBars && selectedShelvesForBars.includes(i)) {
        zBack -= model13Depth; // Arkadaki modeli öne yaklaştır
      } else {
        if (type16AGeometry) {
          zBack += model13Depth - 108; // Type16A arkadaki pozisyon
        } else {
          zBack += model13Depth - 85; // Normal arkadaki pozisyon
        }
      }
      
      // Kısa kenar ribi, modellerin içine girecek kadar uzat
      let length = Math.abs(zBack - zFront);
      
      // Type16A modeli kullanıldığında kısa kenar riplerini uzat
      if (!selectedShelvesForBars.includes(i) && type16AGeometry) {
        length += 60; // Type16A için kısa kenar riplerini 60 birim uzat
      }

      // Bay'in pozisyonunu kontrol et
      const bayIndex = shelfPositions.indexOf(shelfX);
      
      if (baySpacing === 0) {
        // Bay spacing 0 ise eski mantık: sol kenar sadece ilk bay, sağ kenar her bay
        // Sol kısa kenar - sadece en soldaki bay için ekle
        if (bayIndex === 0) {
          const leftEdgeRipRadius = frontBars ? 14 : 10; // Horizontal bar açıksa daha kalın
          const leftRipGeometry = new THREE.CylinderGeometry(leftEdgeRipRadius, leftEdgeRipRadius, length, 32);
          const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
          leftRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
          leftRip.position.set(
            leftFront.x,
            currentHeight + model13Height / 2 - 13,
            zFront + (zBack - zFront) / 2
          );
          scene.add(leftRip);
        }

        // Sağ kısa kenar - her bay için ekle (bu şekilde bay'ler arası ortak kenarlar tek olur)
        const rightEdgeRipRadius = frontBars ? 14 : 10; // Horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 10,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      } else {
        // Bay spacing > 0 ise her bay için hem sol hem sağ kısa kenar
        // Sol kısa kenar
        const leftEdgeRipRadius = frontBars ? 14 : 10; // Horizontal bar açıksa daha kalın
        const leftRipGeometry = new THREE.CylinderGeometry(leftEdgeRipRadius, leftEdgeRipRadius, length, 32);
        const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
        leftRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        leftRip.position.set(
          leftFront.x,
          currentHeight + model13Height / 2 - 13,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightEdgeRipRadius = frontBars ? 14 : 10; // Horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 10,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    });

    // Front bar için arka crossbar'ları ekle
    if (frontBars) {
      // Her bay için arka crossbar'ları ekle
      shelfPositions.forEach((shelfX, sectionIndex) => {
        // Sadece seçili raflarda horizontal bar ekle
        if (selectedShelvesForBars.includes(i)) {
          const sectionBox = getSectionBoundingBox(sectionIndex);
          const backPositions = [
            { x: sectionBox.min.x + 5 + shelfX, z: sectionBox.max.z - 5 },
            { x: sectionBox.max.x - 5 + shelfX, z: sectionBox.max.z - 5 }
          ];
          
          if (backPositions.length === 2) {
            const start = backPositions[0];
            const end = backPositions[1];
            let zStart = start.z + zOffset + 5;
            let zEnd = end.z + zOffset + 5;
            zStart -= model1Depth + 10;
            zEnd -= model1Depth + 10;

            const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
            const backHorizontalRipRadius = 14; // Horizontal bar açıksa daha kalın
            const horizontalRipGeometry = new THREE.CylinderGeometry(backHorizontalRipRadius, backHorizontalRipRadius, length, 32);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model13Height / 2 - 20 + 5, // Horizontal bar 5 birim yukarı
              (zStart + zEnd) / 2 + 10
            );
            scene.add(horizontalRip);
          }
        }
      });
    }
  }
}; 