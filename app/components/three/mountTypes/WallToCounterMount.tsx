import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MountTypeProps } from "../MountTypes";
import { createCabinetDoor } from "../CabinetDoor";

export const handleWallToCounterMount = async ({
  scene,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  barCount,
  baySpacing = 0,
  baySpacings = [], // Bayslar arası default boşluk 0mm (birleşik)
  showCrossbars,
  userHeight,
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
  pipeDiameter,
  roomHeight = 1500,
  wallConnectionPoint = ['all'],
  selectedShelvesForBars = [],
  backVertical = true, // Default: Yes (arkaya dikey bağlantı aktif)
}: MountTypeProps) => {
  // showCrossbars artık kullanılmıyor - frontBars ve backBars ile değiştirildi
  void showCrossbars;
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
  // Wall to counter için baseY hesaplama - ceiling'den başla ve tavandan biraz aşağıda başlat
  // Model yüksekliğini ve küçük bir güvenlik payını düşerek tavana yapışmayı engelle
  const ceilingClearance = 200; // mm - Daha aşağıda başlaması için artırıldı
  const modelHeightForOffset = model13Height > 0 ? model13Height : 120; // yedek değer
  const baseY = (roomHeight || 1500) - modelHeightForOffset - ceilingClearance;
  
  // Üst seviye sabit kalsın; ek raflar aşağı doğru eklensin
  const adjustedBaseY = baseY;
  
  // userHeight artık kullanılmıyor - wall position'a göre hesaplanıyor
  void userHeight;

  // Calculate pipe radius based on pipeDiameter
  const pipeRadius = pipeDiameter === '1' ? 16 : 12; // Çapı artırdık (12.5->16, 8->12)

  // Add counter and doors
  const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
  counter.position.set(0, 200, -800);
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

  // Function to determine if wall connection should be added at this level
  // Her raf için döngü - shelfQuantity + 1 oluşturulmalı ve en üst raf boş görünmeli
  const totalShelves = shelfQuantity + 1;

  const shouldAddWallConnection = (currentIndex: number) => {
    // Handle array of connection points
    if (wallConnectionPoint.includes('all')) {
      return true; // Connect to all shelf levels
    }
    
    // Check for top shelf
    if (wallConnectionPoint.includes('top') && currentIndex === totalShelves - 1) {
      return true;
    }
    
    // Check for dynamic shelf IDs (shelf-1, shelf-2, etc.)
    const shelfId = `shelf-${currentIndex + 1}`;
    if (wallConnectionPoint.includes(shelfId)) {
      return true;
    }
    
    // Legacy support for old hardcoded IDs
    if (wallConnectionPoint.includes('first') && currentIndex === 0) {
      return true;
    }
    if (wallConnectionPoint.includes('second') && currentIndex === 1 && totalShelves > 1) {
      return true;
    }
    if (wallConnectionPoint.includes('third') && currentIndex === 2 && totalShelves > 2) {
      return true;
    }
    
    return false; // No connection if none of the conditions match
  };
  for (let i = 0; i < shelfQuantity; i++) {
    // Individual spacing için cumulative height hesaplama
    let currentHeight;
    if (shelfSpacings && shelfSpacings.length >= shelfQuantity) {
      let cumulativeHeight = 0;
      for (let j = 0; j <= i; j++) {
        cumulativeHeight += shelfSpacings[j];
      }
      currentHeight = adjustedBaseY - cumulativeHeight; // i. rafın pozisyonu
    } else {
      // Fallback: eşit spacing
      currentHeight = adjustedBaseY - i * shelfSpacing;
    }
    
    console.log(`WallToCounter - Shelf ${i + 1} spacing:`, { shelfSpacings, shelfSpacing, adjustedBaseY, currentHeight });

    // Her bir bay için rafları yerleştir - modellerin üstünde (+1 shelf de eklenir)
    shelfPositions.forEach((shelfX) => {
      const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelfMesh.position.set(shelfX, currentHeight + model13Height * 1, zOffset); // Model yüksekliği kadar yukarı taşı
      scene.add(shelfMesh);
    });

    // Tüm sistem için köşe pozisyonlarını hesapla
    const allCornerPositions = [];
    
    if (baySpacing === 0) {
      // Eski mantık: Birleşik bayslar - ortak köşeler paylaşılır
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
      // Yeni mantık: Ayrık bayslar - her bay'in kendi 4 köşesi
      for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
        const bayX = shelfPositions[bayIndex];
        allCornerPositions.push(
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
          { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
          { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
        );
      }
    }

    allCornerPositions.forEach((pos) => {
      // Duvara yakın pozisyon (ön - wall side)
      const isWallSide = pos.z === shelfBoundingBox.min.z + 5; // Duvar tarafı
      const isBackSide = pos.z === shelfBoundingBox.max.z - 5;   // Arka taraf
        
        if (isWallSide) {
          // Duvar bağlantısı seviyesi için - backVertical seçeneğine göre model seçimi
          if (shouldAddWallConnection(i)) {
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
              // Type16F rotasyonu
              wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6;
              wallConnector.rotation.y = Math.PI;
            } else {
              // Type16E rotasyonu (aynı rotasyon)
              wallConnector.rotation.z = Math.PI / 2 + Math.PI / 4 + Math.PI / 6;
              wallConnector.rotation.y = Math.PI;
            }
            
            wallConnector.position.set(pos.x, currentHeight, -roomDepth + 140); // Wall connection position
            scene.add(wallConnector);
          } else {
            // Duvar bağlantısı olmayan seviyeler için - horizontal bar durumuna göre model seçimi

            let geometryToUse, materialToUse;
            
            // Model seçim mantığı:
            // Wall to counter'da ön taraf için her zaman Type16A
            const shouldUseModel13 = false;
            
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
              if (shouldUseModel13) {
                // Model13 rotasyonu
                connectorMesh.rotation.y = Math.PI;
              } else {
                // Type16A rotasyonu
                if (type16AGeometry) {
                  connectorMesh.rotation.y = Math.PI;
                } else {
                  connectorMesh.rotation.y = Math.PI; // Fallback rotasyon
                }
              }
              
              // Pozisyon hesaplaması
              let zPos = pos.z + zOffset + 5;
              
              if (shouldUseModel13) {
                // Model13 pozisyonu
                zPos += model13Depth - 110;
              } else {
                // Type16A pozisyonu
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
        }

        // Arka bağlantılar için Model seçimi - normal mantık (değişiklik yok)
        if (isBackSide) {
          let geometryToUse, materialToUse;
          
          // Model seçim mantığı:
          // Front bar YES -> arkadaki modeller Model13 (çünkü arkaya bağlanır)
          const shouldUseModel13 = (isBackSide && frontBars && selectedShelvesForBars.includes(i));
          
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
            
            // Pozisyon ayarlamaları
            let backZPos = pos.z + zOffset + 5;
            
          // Pozisyon ayarlamaları (normal mantık)
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
        
        // Ön bağlantılar - Type16F (duvar bağlantısı) kullanıldığı için ön modelleri eklemeye gerek yok
        // Model13 veya Type16A eklenmeyecek, sadece duvar bağlantısı yeterli

        // Dikey ripler - backVertical seçeneğine göre
        if (i === 0) {
          // Sadece ilk iterasyonda tek sürekli rip oluştur
          let topShelfHeight;
          
          // Shelf sayısı 1 ise, tek rafın pozisyonunu kullan
          if (shelfQuantity === 1) {
            topShelfHeight = currentHeight; // Tek rafın pozisyonu
          } else {
            topShelfHeight = adjustedBaseY; // En üst shelf pozisyonu (çoklu raf durumu)
          }
          
          const topExtension = 50; // 2 inches ≈ 50mm çıkıntı
          
          // Pozisyon ayarları
          let ripZPos = pos.z + zOffset;
          const isFrente = pos.z === shelfBoundingBox.min.z + 5;
          const isBacke = pos.z === shelfBoundingBox.max.z - 5;
          
        // Dikey ripler - backVertical NO iken Type16E kullanılan yerlerde rip kaldır
        
        // Back Vertical: NO olduğunda TÜM ön pozisyonlardaki dikey ripler kaldırılır
        if (!backVertical && isFrente) {
          // Back Vertical NO - ön pozisyonlarda dikey rip ekleme
          return;
        }
          
        // Normal dikey rip ekle
        if (isFrente) {
          ripZPos += 5; // Base offset
        }
        if (isBacke) {
          ripZPos += 5; // Base offset
        }
        
        // Sürekli rip uzunluğu: counter'dan top shelf'e + 2 inç çıkıntı
        const continuousRipHeight = topShelfHeight - counterHeight + topExtension;
        
        const verticalRipGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, continuousRipHeight, 32);
        const verticalRip = new THREE.Mesh(verticalRipGeometry, ripMaterial);
        
        // Ripi counter'dan başlatıp en üste + extension kadar uzat
        verticalRip.position.set(
          pos.x,
          counterHeight + continuousRipHeight / 2,
          ripZPos
        );
        scene.add(verticalRip);
          
          console.log('WallToCounter - Continuous rip created:', { 
            height: continuousRipHeight, 
            topExtension,
            position: { x: pos.x, y: counterHeight + continuousRipHeight / 2, z: ripZPos },
            backVertical,
            isBacke
          });
        }
      });

    // Her bay için ayrı ayrı crossbar ve kısa kenar ripleri ekle
    shelfPositions.forEach((shelfX) => {
      // Front bar için arka crossbar'ları ekle
      if (frontBars && selectedShelvesForBars.includes(i)) {
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
          const horizontalRipRadius = 14; // Horizontal bar açıksa daha kalın
          const horizontalRipGeometry = new THREE.CylinderGeometry(horizontalRipRadius, horizontalRipRadius, length, 32);
          const horizontalRip = new THREE.Mesh(horizontalRipGeometry, ripMaterial);
          horizontalRip.rotation.z = Math.PI / 2; // Yatay pozisyon için Z ekseninde 90 derece döndür
          horizontalRip.position.set(
            start.x + (end.x - start.x) / 2,
            currentHeight + model13Height / 2 - 15, // 5 birim yukarı çıkarıldı (-20 -> -15)
            (zStart + zEnd) / 2 + 5 // Front YES: 20 mm öne al
          );
          scene.add(horizontalRip);
        }
      }
    });



    // Kısa kenarlara yatay rip ekle - bay spacing'e göre
    if (baySpacing === 0) {
      // Bay spacing 0 ise eski mantık: sol kenar sadece ilk bay, sağ kenar her bay
      shelfPositions.forEach((shelfX) => {
        const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
        const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
        const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

        // Sol kısa kenar
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
        
        // Kısa kenar ribi, modellerin içine girecek kadar uzat
        const length = Math.abs(zBack - zFront) + 60;

        // Bay'in pozisyonunu kontrol et
        const bayIndex = shelfPositions.indexOf(shelfX);
        
        // Sol kısa kenar - sadece en soldaki bay için ekle
        if (bayIndex === 0) {
          const leftEdgeRipRadius = frontBars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
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
        const rightEdgeRipRadius = frontBars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 10,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      });
    } else {
      // Bay spacing > 0 ise her bay için hem sol hem sağ kısa kenar
      shelfPositions.forEach((shelfX) => {
        const leftFront = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.min.z + 5 };
        const leftBack = { x: shelfBoundingBox.min.x + 5 + shelfX, z: shelfBoundingBox.max.z - 5 };
        const rightFront = { x: shelfBoundingBox.max.x - 5 + shelfX, z: shelfBoundingBox.min.z + 5 };

        // Sol kısa kenar
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
        
        // Kısa kenar ribi, modellerin içine girecek kadar uzat
        const length = Math.abs(zBack - zFront) + 60;

        // Sol kısa kenar
        const leftEdgeRipRadius = frontBars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
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
        const rightEdgeRipRadius = frontBars ? 14 : pipeRadius; // Horizontal bar açıksa daha kalın
        const rightRipGeometry = new THREE.CylinderGeometry(rightEdgeRipRadius, rightEdgeRipRadius, length, 32);
        const rightRip = new THREE.Mesh(rightRipGeometry, ripMaterial);
        rightRip.rotation.x = Math.PI / 2; // Yatay pozisyon için 90 derece döndür
        rightRip.position.set(
          rightFront.x,
          currentHeight + model13Height / 2 - 10,
          zFront + (zBack - zFront) / 2
        );
        scene.add(rightRip);
      });
    }
  }

  // En alttaki raftan tezgaha kadar olan dikey ripler ve bağlantılar
  const allBottomCornerPositions = [];
  
  if (baySpacing === 0) {
    // Eski mantık: Birleşik bayslar - ortak köşeler paylaşılır
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
    // Yeni mantık: Ayrık bayslar - her bay'in kendi 4 köşesi
    for (let bayIndex = 0; bayIndex < barCount; bayIndex++) {
      const bayX = shelfPositions[bayIndex];
      allBottomCornerPositions.push(
        { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sol ön
        { x: shelfBoundingBox.min.x + 5 + bayX, z: shelfBoundingBox.max.z - 5 }, // Sol arka
        { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.min.z + 5 }, // Sağ ön
        { x: shelfBoundingBox.max.x - 5 + bayX, z: shelfBoundingBox.max.z - 5 }  // Sağ arka
      );
    }
  }

  allBottomCornerPositions.forEach((pos) => {
    // Tek sürekli ripler zaten ana döngüde oluşturuldu
    
    const isFrontPosition = pos.z === shelfBoundingBox.min.z + 5; // Ön pozisyon
    
    // Back Vertical: NO ve ön pozisyonlarda counter modelini kaldır (dikey rip olmadığı için gerek yok)
    if (!backVertical && isFrontPosition) {
      // Ön pozisyonlarda Type16E kullanılacak ama dikey rip olmayacağı için counter bağlantısı ekleme
      return;
    }
    
    // Normal tezgah bağlantıları
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
};