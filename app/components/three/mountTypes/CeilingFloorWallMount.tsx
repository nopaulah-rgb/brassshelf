import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingFloorWallMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0,
  baySpacings = [],
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
  // showCrossbars artık kullanılmıyor - frontBars ve backBars ile değiştirildi
  void showCrossbars;
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
  
  // Type16E v1.glb dosyasını tavan ve zemin bağlantıları için yükle
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

  const floorHeight = 0; // Floor height in mm  
  // Ceiling level
  const baseCeilingY = roomHeight || 1500;
  
  // En üst rafı CeilingMount ile aynı mantıkta konumlandır: tavan yüksekliğinden ilk spacing kadar aşağı
  const firstTopSpacing = (shelfSpacings && shelfSpacings.length > 0) ? shelfSpacings[0] : shelfSpacing;
  const topShelfY = baseCeilingY - firstTopSpacing;
  const adjustedBaseY = topShelfY; // İlk raf pozisyonu (en üst raf)
  
  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12; // Çapı artırdık (12.5->16, 8->12)

  // Calculate shelf positions for multiple bars with spacing between them
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      // Check if we have custom section widths
      const hasCustomWidths = sectionWidths && sectionWidths.length > 0;
      // Check if we have individual bay spacings
      const hasIndividualSpacings = baySpacings && baySpacings.length === barCount - 1;
      
      if (hasCustomWidths) {
        // Use custom section widths
        const customWidths: number[] = [];
        for (let i = 0; i < barCount; i++) {
          const customWidth = sectionWidths.find(sw => sw.sectionIndex === i);
          const width = customWidth ? customWidth.width : effectiveWidth;
          customWidths.push(width);
        }
        
        // Use individual section widths with spacing
        const totalSpacing = hasIndividualSpacings 
          ? baySpacings.reduce((sum, spacing) => sum + spacing, 0)
          : (barCount - 1) * baySpacing;
        const totalWidth = customWidths.reduce((sum, width) => sum + width, 0) + totalSpacing;
        
        let currentX = -totalWidth / 2 + customWidths[0] / 2;
        positions.push(currentX); // First bay position
        
        for (let i = 1; i < barCount; i++) {
          const spacing = hasIndividualSpacings ? baySpacings[i - 1] : baySpacing;
          currentX += customWidths[i - 1] / 2 + spacing + customWidths[i] / 2;
          positions.push(currentX);
        }
      } else if (hasIndividualSpacings) {
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



  // Horizontal front bar etkin olduğunda (frontBars === true), arka düzlemdeki dikey riplerin Z düzlemini hesapla
  const VERTICAL_SYSTEM_Z_SHIFT = 34; // sistemi 5 birim öne taşı
  const getBackConnectorZPlane = (posZ: number) => {
    const baseZ = posZ + zOffset + 5;
    if (model13Depth && model13Depth > 0) {
      return baseZ - (model13Depth + 28);
    }
    // Fallback model1 derinliği
    return baseZ - (model1Depth + 10);
  };

  // Dikey rip için Z konumunu hesaplayan yardımcı
  // shelfIndex belirtilmişse yalnızca o raf seçiliyse harekete geç; belirtilmemişse herhangi bir seçili raf varsa uygula (tüm yükseklik boyunca)
  const getVerticalRipZ = (
    pos: { z: number; sectionBox: { min: { z: number }; max: { z: number } } },
    shelfIndex?: number
  ) => {
    let z = pos.z + zOffset + 5;
    const isBack = pos.z === pos.sectionBox.max.z - 5;
    const isFront = pos.z === pos.sectionBox.min.z + 5;
    const hasAnySelected = selectedShelvesForBars && selectedShelvesForBars.length > 0;
    const isSelectedShelf = shelfIndex === undefined ? hasAnySelected : selectedShelvesForBars.includes(shelfIndex);
    // Front horizontal YES: arka düzlemdeki dikey ripleri, arka connector düzlemine taşı
    if (frontBars && isSelectedShelf && isBack) {
      z = getBackConnectorZPlane(pos.z);
    }
    // Duvar (front) tarafındaki dikey ripleri duvara doğru 5 birim çek
    if (isFront) {
      z -= 5;
    }
    // Sistemi öne doğru kaydırmayı yalnızca frontBars açıkken uygula (front NO: 0 offset)
    return z + (frontBars ? VERTICAL_SYSTEM_Z_SHIFT : 0);
  };

  // Floor loop removed; top and bottom connectors/rips handled per-shelf

  // Ceiling bağlantıları için ayrı köşe pozisyonları (section-aware)
  const allTopCornerPositions = [];
  
  if (baySpacing === 0) {
    // Birleşik bayslar için köşe pozisyonları
    // Sol en dış köşeler
    const firstSectionBox = getSectionBoundingBox(0);
    allTopCornerPositions.push(
      { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.min.z + 5, sectionIndex: 0, sectionBox: firstSectionBox },
      { x: firstSectionBox.min.x + 5 + shelfPositions[0], z: firstSectionBox.max.z - 5, sectionIndex: 0, sectionBox: firstSectionBox }
    );
    
    // Orta bağlantı noktaları (her bay arası için)
    for (let j = 0; j < barCount - 1; j++) {
      const currentSectionBox = getSectionBoundingBox(j);
      const nextSectionBox = getSectionBoundingBox(j + 1);
      
      const joinX = shelfPositions[j] + currentSectionBox.max.x;
      const avgSectionBox = {
        min: { x: Math.min(currentSectionBox.min.x, nextSectionBox.min.x), z: Math.min(currentSectionBox.min.z, nextSectionBox.min.z) },
        max: { x: Math.max(currentSectionBox.max.x, nextSectionBox.max.x), z: Math.max(currentSectionBox.max.z, nextSectionBox.max.z) }
      };
      
      allTopCornerPositions.push(
        { x: joinX, z: avgSectionBox.min.z + 5, sectionIndex: j, sectionBox: avgSectionBox },
        { x: joinX, z: avgSectionBox.max.z - 5, sectionIndex: j, sectionBox: avgSectionBox }
      );
    }
    
    // Sağ en dış köşeler
    const lastSectionBox = getSectionBoundingBox(barCount - 1);
    allTopCornerPositions.push(
      { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.min.z + 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox },
      { x: lastSectionBox.max.x - 5 + shelfPositions[barCount - 1], z: lastSectionBox.max.z - 5, sectionIndex: barCount - 1, sectionBox: lastSectionBox }
    );
  } else {
    // Bay spacing > 0 ise her bay için kendi köşe noktaları
    for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
      const bayX = shelfPositions[bayIndex];
      const sectionBox = getSectionBoundingBox(bayIndex);
      
      // Her bay'in 4 köşesi
      allTopCornerPositions.push(
        { x: sectionBox.min.x + 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol ön
        { x: sectionBox.min.x + 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sol arka
        { x: sectionBox.max.x - 5 + bayX, z: sectionBox.min.z + 5, sectionIndex: bayIndex, sectionBox: sectionBox }, // Sağ ön
        { x: sectionBox.max.x - 5 + bayX, z: sectionBox.max.z - 5, sectionIndex: bayIndex, sectionBox: sectionBox }  // Sağ arka
      );
    }
  }

  // Ceiling bağlantıları için döngü - sadece backVertical YES olduğunda
  if (backVertical) {
    allTopCornerPositions.forEach((pos) => {
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
      
      // Ceiling connector pozisyonu - CeilingMount'daki gibi hesapla
      const topShelfHeight = adjustedBaseY; // İlk shelf pozisyonu (en üst shelf)
      const connectorCeilingY = topShelfHeight + shelfSpacing; // CeilingMount'daki gibi
      
      // Section-aware flags (not needed further after unifying Z logic)
      
      // Z pozisyonu vertical rip ile aynı olacak şekilde daha aşağıda ayarlanacak

      // Dikey rip: ceiling connector'dan en üst rafa kadar - tek parça halinde
      const ceilingConnectorY = connectorCeilingY; // Ceiling connector pozisyonu
      const topShelfY = topShelfHeight; // En üst raf pozisyonu
      const actualTopRipHeight = ceilingConnectorY - topShelfY; // Ceiling'den rafa kadar mesafe
      const verticalTopRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, actualTopRipHeight, 32);
      const verticalTopRip = new THREE.Mesh(verticalTopRipGeometry, ripMaterial);
      
      // Vertical rip Z pozisyonu: tüm sistemde tek kaynaktan hesapla
      const verticalRipZPos = getVerticalRipZ(pos, 0);
      
      // Rip'i ceiling connector ile en üst raf arasının ortasına yerleştir
      verticalTopRip.position.set(
        pos.x,
        topShelfY + actualTopRipHeight / 2,
        verticalRipZPos
      );
      scene.add(verticalTopRip);

      // Ceiling connector, dikey rip ile aynı Z düzlemine yerleştir
      ceilingConnector.position.set(pos.x, connectorCeilingY, verticalRipZPos);
      scene.add(ceilingConnector);
    });
  }

  // Floor bağlantıları için ayrı loop kaldırıldı; alt segment ve connector'lar per-shelf blokta yönetiliyor

  // Her raf için döngü
  const totalShelves = shelfQuantity + 1; // WallMount ile uyumlu olması için
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

    allCornerPositions.forEach((pos) => {
      // Add wall connections for all front positions - backVertical seçeneğine göre
      if (pos.z === pos.sectionBox.min.z + 5 && shouldAddWallConnection(i, totalShelves)) {
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
      
      // Duvar bağlantısı olmayan seviyelerde modeller değişmemeli (front YES olsa bile)
      if (pos.z === pos.sectionBox.min.z + 5 && !shouldAddWallConnection(i, totalShelves)) {
        let geometryToUse, materialToUse;
        // Her zaman Type16A/fallback kullan
        if (type16AGeometry) {
          geometryToUse = type16AGeometry;
          materialToUse = type16AMaterial || materialGold;
        } else {
          geometryToUse = model13Geometry || model1Geometry;
          materialToUse = model13Material || materialGold;
        }

        if (geometryToUse) {
          const connectorMesh = new THREE.Mesh(geometryToUse, materialToUse);
          connectorMesh.scale.set(1.5, 1.5, 1.5);
          // Type16A/fallback rotasyon
          connectorMesh.rotation.y = Math.PI;

          // Pozisyon (sabit)
          const zPos = pos.z + zOffset + 5 + (model13Depth - 110);
          connectorMesh.position.set(pos.x, currentHeight, zPos);
          scene.add(connectorMesh);
        }
      }

      // Dikey ripler (aralık riplere dair eski blok kaldırıldı; aşağıdaki backVertical bloğunda yönetiliyor)

      // Duvara yatay rip ekle - tüm ön pozisyonlarda (sadece seçili raflarda)
      if (pos.z === pos.sectionBox.min.z + 5 && selectedShelvesForBars.includes(i)) {
        const horizontalRipLength = Math.abs(pos.z + zOffset + roomDepth - 140); // 105'ten 140'a güncellendi
        const horizontalRipRadius = showCrossbars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, horizontalRipLength, 32);
        const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
        horizontalRip.rotation.x = Math.PI / 2; // Yatay pozisyon için X ekseninde 90 derece döndür
        horizontalRip.position.set(
          pos.x,
          currentHeight,
          (pos.z + zOffset - roomDepth + 140) / 2 + 35// 105'ten 140'a güncellendi
        );
        scene.add(horizontalRip);
      }

      // Arka bağlantılar için Model seçimi
      const isBack = pos.z === pos.sectionBox.max.z - 5;   // Arka pozisyon
      
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
          
          // Model tipine göre rotasyonlar - CeilingMount'taki gibi 90° döndürme kuralını uygula
          if (selectedShelvesForBars.includes(i)) {
            // Horizontal bar açık: Model13 kullan ve Z ekseninde 90° döndür
            if (model13Geometry) {
              backConnectorMesh.rotation.z = Math.PI / 2; // 90°
              backConnectorMesh.rotation.y = Math.PI; // merkeze bakacak şekilde
            } else {
              // fallback
              backConnectorMesh.rotation.z = Math.PI / 2;
              backConnectorMesh.rotation.y = Math.PI / 2;
            }
          } else {
            // Horizontal bar kapalı: Type16A standart rotasyon
            if (type16AGeometry) {
              backConnectorMesh.rotation.z = 0;
              backConnectorMesh.rotation.y = Math.PI;
            } else {
              backConnectorMesh.rotation.z = 0;
              backConnectorMesh.rotation.y = Math.PI / 2;
            }
          }
          
          // Pozisyon ayarlamaları
          let backZPos = pos.z + zOffset + 5;
          
          if (selectedShelvesForBars.includes(i)) {
            // Horizontal bar açık - CeilingMount ile aynı back Model13 pozisyonu
            backZPos -= model13Depth + 28;
          } else {
            // Horizontal bar kapalı - Type16A pozisyonu
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

      // Dikey ripler - sadece backVertical YES olduğunda
      if (backVertical) {
        if (i === shelfQuantity - 1) {
          // En alt raftan tabana kadar olan rip
          const ripHeight = currentHeight - floorHeight;
          const verticalRipGeometry = new THREE.CylinderGeometry(10, 10, ripHeight, 32);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
          const zForRip = getVerticalRipZ(pos, i);
          verticalRip.position.set(
            pos.x,
            floorHeight + ripHeight / 2,
            zForRip
          );
          scene.add(verticalRip);

          // Floor connector: dikey rip ile aynı Z düzlemine yerleştir
          const floorGeometry = type16EGeometry || model11Geometry;
          const floorMaterial = type16EMaterial || materialGold;
          const floorConnector = new THREE.Mesh(floorGeometry, floorMaterial);
          floorConnector.scale.set(1.5, 1.5, 1.5);
          if (type16EGeometry) {
            floorConnector.rotation.x = Math.PI / 2;
          }
          floorConnector.position.set(pos.x, floorHeight, zForRip);
          scene.add(floorConnector);
        } else {
          // Raflar arası normal ripler - Type16A için uzama ekle
          let totalExtension = shelfSpacing;
          
          // Type16A kullanılan raflar için uzama ekle
          if (!selectedShelvesForBars.includes(i) && type16AGeometry) {
            const type16AExtension = 80; // Type16A için ek uzama
            totalExtension += type16AExtension;
          }
          
          const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, totalExtension, 32);
          const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
          const zForRip = getVerticalRipZ(pos, i);
          verticalRip.position.set(
            pos.x,
            currentHeight - totalExtension / 2,
            zForRip
          );
          scene.add(verticalRip);
        }
      }
    });

    // Kısa kenarlara yatay rip ekle (her durumda - horizontal bar durumundan bağımsız)
    shelfPositions.forEach((shelfX, sectionIndex) => {
      const sectionBox = getSectionBoundingBox(sectionIndex);
      // Section-aware X konumları: shelfX + sectionBox
      const leftFront = { x: shelfX + sectionBox.min.x + 5, z: sectionBox.min.z + 5 };
      const leftBack = { x: shelfX + sectionBox.min.x + 5, z: sectionBox.max.z - 5 };
      const rightFront = { x: shelfX + sectionBox.max.x - 5, z: sectionBox.min.z + 5 };

      // Sol ve sağ kısa kenarlar için ripler - modellerin gerçek pozisyonlarını kullan
      let zFront = leftFront.z + zOffset + 5;
      let zBack = leftBack.z + zOffset + 5;
      
      // Ön modellerin pozisyonunu hesapla - duvar bağlantısının gerçek pozisyonuna göre
      // Duvar bağlantısı olan seviyelerde kısa ripler dışa taşmamalı; duvardan içeri küçük bir pay bırak
      const hasWallFront = shouldAddWallConnection(i, totalShelves);
      if (hasWallFront) {
        const WALL_INSET = 25; // duvardan içeri pay (mm)
        zFront = -roomDepth + 140 + WALL_INSET;
      } else {
        zFront = -roomDepth + 180; // Duvar bağlantısının pozisyonuyla tam eşleş
      }
      
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
      // Çok kısa kaldıysa rip oluşturma (taşmayı engellemek için)
      if (length < 4) {
        return; // bu bay için kısa rip ekleme
      }
      
      // Type16A modeli kullanıldığında kısa kenar riplerini uzat
      if (!selectedShelvesForBars.includes(i) && type16AGeometry) {
        length += 60; // Type16A için kısa kenar riplerini 60 birim uzat
      }

      // Bay indexini güvenilir şekilde belirle (floating point hatalarından kaçınmak için sectionIndex kullan)
      const bayIndex = sectionIndex;
      
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
          { x: shelfX + sectionBox.min.x + 5, z: sectionBox.max.z - 5 },
          { x: shelfX + sectionBox.max.x - 5, z: sectionBox.max.z - 5 }
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
              start.x + (end.x - start.x) / 2 ,
              currentHeight + model13Height / 2 - 16,
              (zStart + zEnd) / 2 + 10
            );
            scene.add(horizontalRip);
          }
        }
      });
    }


  }
}; 