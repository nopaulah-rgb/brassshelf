import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";

export const handleCeilingMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0, // Bayslar arası default boşluk 0mm (birleşik)
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
  backBars,
  pipeDiameter, // Kullanılmıyor - ripler için sabit çap kullanıyoruz
  roomHeight = 1500,
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

  // Ceiling mount için shelf sistemini yukarı çıkar ki ripler ceiling connectorlara ulaşsın
  const baseCeilingY = roomHeight || 1500;
  const baseY = baseCeilingY - shelfSpacing; // Ceiling'den rip uzunluğu kadar aşağı
  // userHeight artık kullanılmıyor - ceiling position'a göre hesaplanıyor
  void userHeight;
  // shelfSpacing now comes from props

  // Calculate pipe radius based on pipeDiameter
  const getPipeRadius = () => {
    if (pipeDiameter === '1') {
      return 12.5; // 1 inch = 25mm diameter = 12.5mm radius
    }
    return 8; // 5/8 inch = 16mm diameter = 8mm radius (default)
  };
  const pipeRadius = getPipeRadius();

  // Calculate shelf positions for multiple bars with spacing between them
  const getShelfPositions = (barCount: number) => {
    const positions = [];
    // Use userWidth if provided, otherwise use default shelfWidth
    const effectiveWidth = userWidth || shelfWidth;
    
    if (barCount === 1) {
      positions.push(0);
    } else {
      // For multiple bars, arrange them side by side with spacing between them
      const totalSpacing = (barCount - 1) * baySpacing; // Toplam boşluk
      const totalWidth = (barCount * effectiveWidth) + totalSpacing; // Toplam genişlik
      const startX = -totalWidth / 2 + effectiveWidth / 2; // İlk bay'in merkezi
      
      for (let i = 0; i < barCount; i++) {
        positions.push(startX + i * (effectiveWidth + baySpacing));
      }
    }
    return positions;
  };

  const shelfPositions = getShelfPositions(barCount);

  // Ripler için kullanılacak materyali belirle - modeller ile aynı olsun
  const ripMaterial = model13Material || materialGold;

  // Her raf için döngü
  for (let i = 0; i < shelfQuantity; i++) {
    // Individual spacing kullan veya fallback olarak tek spacing kullan
    const spacingToUse = shelfSpacings && shelfSpacings.length > i ? shelfSpacings[i] : shelfSpacing;
    console.log(`Shelf ${i + 1} spacing:`, { spacingToUse, shelfSpacings, shelfSpacing });
    
    // Tek raf olduğunda ceiling connector'dan spacing kadar aşağı
    // Çoklu raf olduğunda cumulative spacing hesaplama
    let currentHeight;
    if (shelfQuantity === 1) {
      currentHeight = baseCeilingY - spacingToUse; // Tek raf: ceiling'den spacing kadar aşağı
    } else {
      // Individual spacing için cumulative height hesaplama
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
      // Bay spacing 0 ise eski mantık: birleşim noktaları var
      // Sol en dış köşeler
      allCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
      );
      
      // Orta bağlantı noktaları (her bay arası için)
      for (let j = 0; j < barCount - 1; j++) {
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
      // Bay spacing > 0 ise her bay için kendi köşe noktaları
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
      // Front bar YES ve bu raf seçili -> arkadaki modeller Model13 (çünkü arkaya bağlanır)
      // Back bar YES ve bu raf seçili -> öndeki modeller Model13 (çünkü öne bağlanır)
      const shouldUseModel13 = 
        (isFrente && backBars && selectedBackShelvesForBars.includes(i)) ||   // Ön pozisyon ve back bar açık ve bu raf seçili
        (isBacke && frontBars && selectedShelvesForBars.includes(i));         // Arka pozisyon ve front bar açık ve bu raf seçili
      
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
        const hasHorizontalBarForThisShelf = 
          (frontBars && selectedShelvesForBars.includes(i)) || 
          (backBars && selectedBackShelvesForBars.includes(i));
          
        if (hasHorizontalBarForThisShelf) {
          // Bu raf için horizontal bar var durumunda
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
          // Bu raf için horizontal bar yok - Type16A kullan
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
        
        if (isFrente && backBars && selectedBackShelvesForBars.includes(i)) {
          // Ön pozisyon ve back bar açık ve bu raf seçili - Model13
          zPos += model13Depth + 3; // Normal öndeki model pozisyonu
        } else if (isBacke && frontBars && selectedShelvesForBars.includes(i)) {
          // Arka pozisyon ve front bar açık ve bu raf seçili - Model13
          zPos -= model13Depth + 23; // Arkadaki model13.glb pozisyonu - 20 birim geri çekildi
        } else {
          // Type16A pozisyonu (bu raf için horizontal bar yok)
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
        
        // Rip uzunluğu: mevcut raftan bir sonraki rafa kadar olan mesafe + model yüksekliği
        const ripLength = nextSpacingToUse + model13Height + 10; // Model yüksekliğini de dahil et ve biraz boşluk bırak
        
        const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, ripLength, 16);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        
        // Sadece arkadaki ripler değişsin, öndeki sabit kalsın
        let ripZPos = pos.z + zOffset;
        const isBacke = pos.z === shelfBoundingBox.max.z - 5;
        
        if (isBacke) {
          // Sadece arkadaki ripler için pozisyon ayarla
          ripZPos += 5; // Base offset
          if (frontBars && selectedShelvesForBars.includes(i)) {
            // Front bar açık ve bu raf seçili - arkadaki model Model13
            ripZPos -= model13Depth - 32; // Model13 arkadaki pozisyon
          } else {
            // Front bar kapalı veya bu raf seçili değil - Type16A
            if (type16AGeometry) {
              ripZPos += model13Depth - 68; // Type16A arkadaki pozisyon
            } else {
              ripZPos += model13Depth - 45; // Normal arkadaki pozisyon
            }
          }
        }
        
        // Ripi mevcut modelin altından başlatıp bir sonraki modele kadar uzat
        verticalRip.position.set(
          pos.x,
          currentHeight - ripLength / 2, // Mevcut model altından başla
          ripZPos
        );
        scene.add(verticalRip);
      }
    });

    // Her bay için ayrı ayrı crossbar ve kısa kenar ripleri ekle
    shelfPositions.forEach((shelfX) => {
      // Front bar için arka crossbar'ları ekle (mevcut çalışma şekli korunuyor)
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
            const horizontalRipGeometry = new THREE.CylinderGeometry(14, 14, length, 16);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay duruma getir
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2 ,
              currentHeight + model13Height / 2 -20,
              (zStart + zEnd) / 2 + 15 // Arkadaki modeller 20 birim öne yaklaştırıldığı için crossbar da öne kaydırıldı
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
            
            // Öndeki modellerin pozisyonuna göre ayarla
            // Back bar YES olduğunda öndeki modeller Model13 olur
            if (backBars) {
              // Back bar açık - öndeki modeller Model13
              zStart += model13Depth + 3; // Model13 pozisyonu
              zEnd += model13Depth + 3;
            } else {
              // Back bar kapalı - öndeki modeller Type16A
              if (type16AGeometry) {
                zStart += model13Depth - 20; // Type16A pozisyonu
                zEnd += model13Depth - 20;
              } else {
                zStart += model13Depth + 3; // Fallback Model13 pozisyonu
                zEnd += model13Depth + 3;
              }
            }

            const length = Math.abs(end.x - start.x) + 80; // Ripi 30 birim uzat
            const horizontalRipGeometry = new THREE.CylinderGeometry(14, 14, length, 16);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
            horizontalRip.rotation.z = Math.PI / 2; // Yatay duruma getir
            horizontalRip.position.set(
              start.x + (end.x - start.x) / 2,
              currentHeight + model13Height / 2 - 15, // 3 birim yukarı kaldırıldı
              (zStart + zEnd) / 2 - 48 // Öndeki crossbar pozisyonu - 20 birim öne hareket ettirildi
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
        // Back bar açık ve bu raf seçili - öndeki model Model13
        zFront += model13Depth + 3; // Model13 öndeki pozisyon
      } else {
        // Back bar kapalı veya bu raf seçili değil - Type16A
        if (type16AGeometry) {
          zFront += model13Depth - 20; // Type16A öndeki pozisyon
        } else {
          zFront += model13Depth + 3;
        }
      }
      
      // Arka modellerin pozisyonunu hesapla
      if (frontBars && selectedShelvesForBars.includes(i)) {
        // Front bar açık ve bu raf seçili - arkadaki model Model13
        zBack -= model13Depth; // Model13 arkadaki pozisyon
      } else {
        // Front bar kapalı veya bu raf seçili değil - Type16A
        if (type16AGeometry) {
          zBack += model13Depth - 108; // Type16A arkadaki pozisyon
        } else {
          zBack += model13Depth - 85; // Normal arkadaki pozisyon
        }
      }
      
      const length = Math.abs(zBack - zFront);
      const modelRadius = pipeRadius; // Pipe yarıçapı kullan

      // Bay'in pozisyonunu kontrol et
      const bayIndex = shelfPositions.indexOf(shelfX);
      
      if (baySpacing === 0) {
        // Bay spacing 0 ise eski mantık: sol kenar sadece ilk bay, sağ kenar her bay
        // Sol kısa kenar - sadece en soldaki bay için ekle
        if (bayIndex === 0) {
          const leftRipGeometry = new THREE.CylinderGeometry(modelRadius, modelRadius, length, 16);
          const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
          leftRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
          leftRip.position.set(
            leftFront.x,
            currentHeight + model13Height / 2 - 18,
            zFront + (zBack - zFront) / 2
          );
          scene.add(leftRip);
        }

        // Sağ kısa kenar - her bay için ekle (bu şekilde bay'ler arası ortak kenarlar tek olur)
        const rightRipGeometry = new THREE.CylinderGeometry(modelRadius, modelRadius, length, 16);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      } else {
        // Bay spacing > 0 ise her bay için hem sol hem sağ kısa kenar
        // Sol kısa kenar
        const leftRipGeometry = new THREE.CylinderGeometry(modelRadius, modelRadius, length, 16);
        const leftRip = new THREE.Mesh(leftRipGeometry, ripMaterial);
        leftRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
        leftRip.position.set(
          leftFront.x,
          currentHeight + model13Height / 2 - 18,
          zFront + (zBack - zFront) / 2
        );
        scene.add(leftRip);

        // Sağ kısa kenar
        const rightRipGeometry = new THREE.CylinderGeometry(modelRadius, modelRadius, length, 16);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Z ekseni boyunca uzanacak şekilde döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 5,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      }
    });
  }

  // En alt raftan aşağı uzayan dikey ripler (sadece çoklu shelf durumunda)
  if (shelfQuantity > 1) {
    const bottomShelfHeight = baseY - (shelfQuantity - 1) * shelfSpacing;
    const downwardExtension = 20; // Aşağı uzatma miktarı - kısaltıldı
  
  // Köşe pozisyonlarını hesapla
  const allBottomCornerPositions = [];
  
  if (baySpacing === 0) {
    // Bay spacing 0 ise eski mantık: birleşim noktaları var
    // Sol en dış köşeler
    allBottomCornerPositions.push(
      { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
    );
    
    // Orta bağlantı noktaları (her bay arası için)
    for (let j = 0; j < barCount - 1; j++) {
      const joinX = shelfPositions[j] + shelfBoundingBox.max.x;
      allBottomCornerPositions.push(
        { x: joinX, z: shelfBoundingBox.min.z + 5 },
        { x: joinX, z: shelfBoundingBox.max.z - 5 }
      );
    }
    
    // Sağ en dış köşeler
    allBottomCornerPositions.push(
      { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.min.z + 5 },
      { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.max.z - 5 }
    );
  } else {
    // Bay spacing > 0 ise her bay için kendi köşe noktaları
    for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
      const bayX = shelfPositions[bayIndex];
      
      // Her bay'in 4 köşesi
      allBottomCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
        { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
        { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
        { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
      );
    }
  }

  allBottomCornerPositions.forEach((pos) => {
    const downwardRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, downwardExtension, 16);
    const downwardRip = new THREE.Mesh(downwardRipGeometry, ripMaterial);
    
    // Sadece arkadaki ripler değişsin, öndeki sabit kalsın
    let ripZPos = pos.z + zOffset;
    const isBacke = pos.z === shelfBoundingBox.max.z - 5;
    
    if (isBacke) {
      // Sadece arkadaki ripler için pozisyon ayarla
      ripZPos += 5; // Base offset
      if (frontBars && selectedShelvesForBars.includes(shelfQuantity - 1)) {
        // Front bar açık ve son raf seçili - arkadaki model Model13
        ripZPos -= model13Depth - 32; // Model13 arkadaki pozisyon
      } else {
        // Front bar kapalı veya son raf seçili değil - Type16A
        if (type16AGeometry) {
          ripZPos += model13Depth - 68; // Type16A arkadaki pozisyon
        } else {
          ripZPos += model13Depth - 45; // Normal arkadaki pozisyon
        }
      }
    }
    
    downwardRip.position.set(
      pos.x,
      bottomShelfHeight - model13Height - downwardExtension / 2, // Model altından başlatıp aşağı uzat
      ripZPos
    );
    scene.add(downwardRip);
  });
  }

  // Tek shelf durumunda sadece tavan bağlantıları
  if (shelfQuantity === 1) {
    // Köşe pozisyonlarını hesapla
    const singleShelfCornerPositions: { x: number; z: number }[] = [];
    
    if (baySpacing === 0) {
      // Bay spacing 0 ise eski mantık: birleşim noktaları var
      // Sol en dış köşeler
      singleShelfCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
      );
      
      // Orta bağlantı noktaları (çoklu bay durumunda)
      for (let j = 0; j < barCount - 1; j++) {
        const joinX = shelfPositions[j] + shelfBoundingBox.max.x;
        singleShelfCornerPositions.push(
          { x: joinX, z: shelfBoundingBox.min.z + 5 },
          { x: joinX, z: shelfBoundingBox.max.z - 5 }
        );
      }
      
      // Sağ en dış köşeler
      singleShelfCornerPositions.push(
        { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.max.z - 5 }
      );
    } else {
      // Bay spacing > 0 ise her bay için kendi köşe noktaları
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        
        // Her bay'in 4 köşesi
        singleShelfCornerPositions.push(
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
        );
      }
    }

    singleShelfCornerPositions.forEach((pos) => {
      // Dikey rip: raftan tavana kadar - 30cm sabit uzunluk
      const topShelfHeight = shelfQuantity === 1 ? baseCeilingY - shelfSpacing : baseY;
      const ripHeight = 300; // 30cm sabit ceiling rip uzunluğu
      const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, ripHeight, 16);
      const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
      
      // Sadece arkadaki ripler değişsin, öndeki sabit kalsın
      let ripZPos = pos.z + zOffset;
      const isBacke = pos.z === shelfBoundingBox.max.z - 5;
      
      if (isBacke) {
        // Sadece arkadaki ripler için pozisyon ayarla
        ripZPos += 5; // Base offset
        if (frontBars && selectedShelvesForBars.includes(0)) {
          // Front bar açık ve tek raf seçili - arkadaki model Model13
          ripZPos -= model13Depth - 32; // Model13 arkadaki pozisyon
        } else {
          // Front bar kapalı veya tek raf seçili değil - Type16A
          if (type16AGeometry) {
            ripZPos += model13Depth - 68; // Type16A arkadaki pozisyon
          } else {
            ripZPos += model13Depth - 45; // Normal arkadaki pozisyon
          }
        }
      }
      
      // Ceiling rip uzunluğu shelf spacing ile aynı olsun
      const actualRipHeight = shelfSpacing;
      const updatedRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, actualRipHeight, 16);
      verticalRip.geometry = updatedRipGeometry;
      
      verticalRip.position.set(
        pos.x,
        topShelfHeight + actualRipHeight / 2,
        ripZPos
      );
      scene.add(verticalRip);

      // Tavan bağlantıları - Type16E v1.glb kullan
      const ceilingGeometry = type16EGeometry || model12Geometry;
      const ceilingMaterial = type16EMaterial || materialGold;
      const ceilingConnector = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
      ceilingConnector.scale.set(1.5, 1.5, 1.5);
      
      // Type16E modeli için farklı rotasyon, eski model için eskisi
      if (type16EGeometry) {
        // Type16E modelini dik durdurmak için 90 derece rotasyon
        ceilingConnector.rotation.x = Math.PI / 2;
        // 180 derece döndür
        ceilingConnector.rotation.y = Math.PI;
      } else {
        // Eski model rotasyonu
        ceilingConnector.rotation.x = Math.PI;
        // 180 derece döndür
        ceilingConnector.rotation.y = Math.PI;
      }
      
      // Type16E modeli için pozisyon ayarı - tek shelf durumunda asıl tavan seviyesinde
      const singleConnectorCeilingY = shelfQuantity === 1 ? baseCeilingY : topShelfHeight + shelfSpacing;
      ceilingConnector.position.set(pos.x, singleConnectorCeilingY, ripZPos);
      scene.add(ceilingConnector);
    });
  }

  // En üstteki raftan tavana kadar olan dikey ripler ve tavan bağlantıları (sadece çoklu shelf durumunda)
  if (shelfQuantity > 1) {
    // Köşe pozisyonlarını hesapla
    const allTopCornerPositions = [];
  
    if (baySpacing === 0) {
      // Bay spacing 0 ise eski mantık: birleşim noktaları var
      // Sol en dış köşeler
      allTopCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.min.x + 5 + shelfPositions[0], z: shelfBoundingBox.max.z - 5 }
      );
      
      // Orta bağlantı noktaları (her bay arası için)
      for (let j = 0; j < barCount - 1; j++) {
        const joinX = shelfPositions[j] + shelfBoundingBox.max.x;
        allTopCornerPositions.push(
          { x: joinX, z: shelfBoundingBox.min.z + 5 },
          { x: joinX, z: shelfBoundingBox.max.z - 5 }
        );
      }
      
      // Sağ en dış köşeler
      allTopCornerPositions.push(
        { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.min.z + 5 },
        { x: shelfBoundingBox.max.x - 5 + shelfPositions[barCount - 1], z: shelfBoundingBox.max.z - 5 }
      );
    } else {
      // Bay spacing > 0 ise her bay için kendi köşe noktaları
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        
        // Her bay'in 4 köşesi
        allTopCornerPositions.push(
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
        );
      }
    }

  allTopCornerPositions.forEach((pos) => {
          // Dikey rip: en üst raftan tavana kadar - 30cm sabit uzunluk
      const topShelfHeight = shelfQuantity === 1 ? baseCeilingY - shelfSpacing : baseY;
      const ripHeight = 300; // 30cm sabit ceiling rip uzunluğu
    const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, ripHeight, 16);
    const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
    
    // Sadece arkadaki ripler değişsin, öndeki sabit kalsın
    let ripZPos = pos.z + zOffset;
    const isBacke = pos.z === shelfBoundingBox.max.z - 5;
    
          if (isBacke) {
        // Sadece arkadaki ripler için pozisyon ayarla
        ripZPos += 5; // Base offset
        if (frontBars && selectedShelvesForBars.includes(0)) {
          // Front bar açık ve üst raf seçili - arkadaki model Model13
          ripZPos -= model13Depth - 32; // Model13 arkadaki pozisyon
        } else {
          // Front bar kapalı veya üst raf seçili değil - Type16A
          if (type16AGeometry) {
            ripZPos += model13Depth - 68; // Type16A arkadaki pozisyon
          } else {
            ripZPos += model13Depth - 45; // Normal arkadaki pozisyon
          }
        }
      }
    
    // Ceiling rip uzunluğu shelf spacing ile aynı olsun
    const actualRipHeight = shelfSpacing;
    const updatedRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, actualRipHeight, 16);
    verticalRip.geometry = updatedRipGeometry;
    
    verticalRip.position.set(
      pos.x,
      topShelfHeight + actualRipHeight / 2,
      ripZPos
    );
    scene.add(verticalRip);

    // Tavan bağlantıları - Type16E v1.glb kullan
    const ceilingGeometry = type16EGeometry || model12Geometry;
    const ceilingMaterial = type16EMaterial || materialGold;
    const ceilingConnector = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceilingConnector.scale.set(1.5, 1.5, 1.5);
    
    // Type16E modeli için farklı rotasyon, eski model için eskisi
    if (type16EGeometry) {
      // Type16E modelini dik durdurmak için 90 derece rotasyon
      ceilingConnector.rotation.x = Math.PI / 2;
      // 180 derece döndür
      ceilingConnector.rotation.y = Math.PI;
    } else {
      // Eski model rotasyonu
      ceilingConnector.rotation.x = Math.PI;
      // 180 derece döndür
      ceilingConnector.rotation.y = Math.PI;
    }
    
    // Type16E modeli için pozisyon ayarı - çoklu shelf durumunda
    const multiConnectorCeilingY = topShelfHeight + shelfSpacing;
    ceilingConnector.position.set(pos.x, multiConnectorCeilingY, ripZPos);
    scene.add(ceilingConnector);
  });
  }
};
