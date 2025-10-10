import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleWallMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0,
  baySpacings = [], // Bayslar arası default boşluk 0mm (birleşik)
  sectionWidths = [], // Custom section widths
  showCrossbars,
  userHeight,
  userWidth,
  useTopShelf = false,
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
  roomHeight = 1500, // eslint-disable-line @typescript-eslint/no-unused-vars
  wallConnectionPoint = ['all'],
  selectedShelvesForBars = [],
  backVertical = true,
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
  
  // Type16E v1.glb dosyasını back vertical bağlantıları için yükle
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

  // ALT MOUNT: userHeight düzeltme hesaplaması
  // Formül: En Üst Raf Pozisyonu = Reference Point ± Clearance
  // Wall Mount için: topShelf = userHeight - 2" (kullanıcı boyundan 2" aşağı)
  const bottomClearance = 50.8; // 2" alt boşluk (mm)
  const totalHeight = userHeight || 1195; // Kullanıcı yüksekliği (mm)
  
  // En üst rafın pozisyonu: userHeight - 2" (bottomClearance)
  const topShelfY = totalHeight - bottomClearance;
  const adjustedBaseY = topShelfY;

  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12;

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
  }; // Çapı artırdık (12.5->16, 8->12)

  // Calculate shelf positions for multiple bars with spacing between them
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    // Use userWidth if provided, otherwise use default shelfWidth
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

  // Her raf için döngü - shelfQuantity + 1 oluşturulmalı ve en üst raf boş görünmeli
  const totalShelves = shelfQuantity + 1;
  for (let i = 0; i < totalShelves; i++) {
    // İlk raf her zaman baseY pozisyonunda kalmalı, diğer raflar aşağıya eklenmeli
    let currentHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      // Individual spacing için cumulative height hesaplama
      let cumulativeHeight = 0;
      for (let j = 0; j < i; j++) {
        // Use shelfSpacings[j] if available, otherwise use shelfSpacing
        const spacingToUse = j < shelfSpacings.length ? shelfSpacings[j] : shelfSpacing;
        cumulativeHeight += spacingToUse;
      }
      currentHeight = adjustedBaseY - cumulativeHeight;
    } else {
      // Fallback: eşit spacing
      currentHeight = adjustedBaseY - (i * shelfSpacing);
    }

    // Her bir bay için rafları yerleştir - modellerin üstünde (+1 shelf de eklenir)
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

    // Tüm sistem için köşe pozisyonlarını hesapla (section bilgisiyle birlikte)
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

    // Tüm köşe pozisyonları için modelleri ekle
    allCornerPositions.forEach((pos) => {
      const isFront = pos.z === pos.sectionBox.min.z + 5;  // Ön pozisyon
      
      // Ön pozisyonlar için duvar bağlantıları - backVertical seçeneğine göre
      if (isFront && shouldAddWallConnection(i, totalShelves)) {
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
          // Type16E rotasyonları
          if (type16EGeometry) {
            wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6; // Type16E için aynı rotasyon
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
      if (isFront && !shouldAddWallConnection(i, totalShelves)) {

        let geometryToUse, materialToUse;
        
        // Model seçim mantığı:
        // Front bar YES -> öndeki modeller normal davranış (Type16A kullan)
        const shouldUseModel13 = false; // Wall mount'da ön taraf için her zaman Type16A
        
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
          if (selectedShelvesForBars.includes(i)) {
            // Horizontal bar açık - Model13 rotasyonu
            connectorMesh.rotation.y = Math.PI;
          } else {
            // Horizontal bar kapalı - Type16A rotasyonu
            if (type16AGeometry) {
              connectorMesh.rotation.y = Math.PI;
            } else {
              connectorMesh.rotation.y = Math.PI; // Fallback rotasyon
            }
          }
          
          // Pozisyon hesaplaması
          let zPos = pos.z + zOffset + 5;
          
          if (selectedShelvesForBars.includes(i)) {
            // Horizontal bar açık - Model13 pozisyonu
            zPos += model13Depth - 110;
          } else {
            // Horizontal bar kapalı - Type16A pozisyonu
            if (type16AGeometry) {
              zPos += model13Depth - 110; // Type16A için aynı pozisyon
            } else {
              zPos += model13Depth - 110; // Fallback pozisyon
            }
          }
          
          connectorMesh.position.set(pos.x, currentHeight, zPos);
          scene.add(connectorMesh);
        }
      }

      // Arka bağlantılar için Model seçimi - normal mantık (değişiklik yok)
      const isBack = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon
      
      if (isBack) {
        let geometryToUse, materialToUse;
        
        // Model seçim mantığı:
        // Front bar YES -> sadece seçili raflarda arkadaki modeller Model13
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
          
          // Model tipine göre rotasyonlar (normal mantık)
          if (selectedShelvesForBars.includes(i)) {
            // Horizontal bar açık - Model13 rotasyonu
            if (model13Geometry) {
              backConnectorMesh.rotation.y = Math.PI;
            } else {
              backConnectorMesh.rotation.y = Math.PI / 2;
            }
          } else {
            // Horizontal bar kapalı - Type16A rotasyonu
            if (type16AGeometry) {
              backConnectorMesh.rotation.y = Math.PI;
            } else {
              backConnectorMesh.rotation.y = Math.PI / 2;
            }
          }
          
          // Pozisyon ayarlamaları (normal mantık)
          let backZPos = pos.z + zOffset + 5;
          
          if (selectedShelvesForBars.includes(i)) {
            // Horizontal bar açık - Model13 pozisyonu
            backZPos -= model13Depth + 8;
          } else {
            // Horizontal bar kapalı - Type16A pozisyonu
            if (type16AGeometry) {
              backZPos += model13Depth - 108;
            } else {
              backZPos += model13Depth - 85;
            }
          }

          backConnectorMesh.position.set(pos.x, currentHeight, backZPos);
          scene.add(backConnectorMesh);
        }
      }

      // Dikey ripler - backVertical seçeneğine göre
      if (i < totalShelves - 1) {
        // Raflar arası normal ripler
        const isFront = pos.z === shelfBoundingBox.min.z + 5; // Ön pozisyon kontrolü
        const isBack = pos.z === shelfBoundingBox.max.z - 5;   // Arka pozisyon kontrolü
        
        // Dikey ripler - backVertical NO iken Type16E kullanılan yerlerde rip kaldır
        
        // Back Vertical: NO olduğunda TÜM ön pozisyonlardaki dikey ripler kaldırılır
        if (!backVertical && isFront) {
          // Back Vertical NO - ön pozisyonlarda dikey rip ekleme
          return;
        }
        
        // Normal raflar arası ripler
        // Individual spacing desteği
        const spacingForNext = (shelfSpacings && shelfSpacings.length >= shelfQuantity && i < shelfSpacings.length)
          ? shelfSpacings[i]
          : shelfSpacing;
        
        // useTopShelf true ise ve ilk raf ise ripi uzat (top shelf kullanılıyor)
        const shouldExtendRip = useTopShelf && i === 0;
        const baseExtension = shouldExtendRip ? 100 : 0;
        
        // Type16A modeli kullanıldığında ripleri uzat
        const type16AExtension = (!selectedShelvesForBars.includes(i) && type16AGeometry) ? 80 : 0;
        
        // Ön ve arka ripler için çıkıntı - frontBars YES durumunda daha uzun çıkıntı
        const edgeExtension = (isFront || isBack) ? (frontBars ? 90 : 20) : 0;
        const totalExtension = baseExtension + edgeExtension + type16AExtension;
        
        const verticalRipGeometry = new THREE.CylinderGeometry(
          pipeRadius, 
          pipeRadius, 
          spacingForNext + totalExtension, 
          32
        );
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        verticalRip.position.set(
          pos.x,
          currentHeight - spacingForNext / 2, // Merkez pozisyonda tut (hem yukarı hem aşağı eşit uzatma)
          pos.z + zOffset
        );
        scene.add(verticalRip);
      }
    });

    // Her bay için ayrı ayrı crossbar ve kısa kenar ripleri ekle
    shelfPositions.forEach((shelfX, sectionIndex) => {
      // Front bar için arka crossbar'ları ekle
      if (frontBars) {
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
            zStart -= model13Depth + 10;
            zEnd -= model13Depth + 10;

            const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
            const horizontalRipRadius = 14; // Horizontal bar açıksa daha kalın
            const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, length, 32);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model13Height / 2 - 15, // 5 birim yukarı kaldırıldı
            (zStart + zEnd) / 2 + 44 // Front YES: 20 mm arkaya al
            );
            scene.add(horizontalRip);
          }
        }
      } else {
        // Front bar NO durumu - sadece seçili raflarda horizontal bar ekle
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
            
            // Front NO durumunda farklı pozisyon hesaplama
            if (type16AGeometry) {
              zStart += model13Depth - 108;
              zEnd += model13Depth - 108;
            } else {
              zStart += model13Depth - 85;
              zEnd += model13Depth - 85;
            }

            const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
            const horizontalRipRadius = pipeRadius; // Front NO durumunda normal kalınlık
            const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, length, 32);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model13Height / 2 - 15, // 5 birim yukarı kaldırıldı
              (zStart + zEnd) / 2
            );
            scene.add(horizontalRip);
          }
        }
      }



      // Kısa kenarlara yatay rip ekle (her durumda)
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
      if (frontBars) {
        zBack -= model13Depth; // Arkadaki modeli öne yaklaştır
      } else {
        if (type16AGeometry) {
          zBack += model13Depth - 108; // Type16A arkadaki pozisyon
        } else {
          zBack += model13Depth - 85; // Normal arkadaki pozisyon
        }
      }
      
      let length = Math.abs(zBack - zFront);
      
      // Kısa ripleri biraz kısalt
      length -= 40; // Kısa ripleri 40 birim kısalt
      
      // Type16A modeli kullanıldığında kısa kenar riplerini uzat (ama daha az)
      if (!selectedShelvesForBars.includes(i) && type16AGeometry) {
        length += 30; // Type16A için kısa kenar riplerini 30 birim uzat (60'tan 30'a düşürüldü)
      }

      // Bay'in pozisyonunu kontrol et
      const bayIndex = shelfPositions.indexOf(shelfX);
      
      if (baySpacing === 0) {
        // Bay spacing 0 ise eski mantık: sol kenar sadece ilk bay, sağ kenar her bay
        // Sol kısa kenar - sadece en soldaki bay için ekle
        if (bayIndex === 0) {
          const leftEdgeRipRadius = (frontBars && selectedShelvesForBars.includes(i)) ? 14 : pipeRadius; // Horizontal bar seçili raflarda daha kalın
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
        const rightEdgeRipRadius = (frontBars && selectedShelvesForBars.includes(i)) ? 14 : pipeRadius; // Horizontal bar seçili raflarda daha kalın
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
        const leftEdgeRipRadius = (frontBars && selectedShelvesForBars.includes(i)) ? 14 : pipeRadius; // Horizontal bar seçili raflarda daha kalın
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
        const rightEdgeRipRadius = (frontBars && selectedShelvesForBars.includes(i)) ? 14 : pipeRadius; // Horizontal bar seçili raflarda daha kalın
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
  }
};