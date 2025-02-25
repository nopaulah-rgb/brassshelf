import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface ThreeDViewerProps {
  shelfUrl: string;
  ripUrl: string;
  shelfQuantity: number;
  mountType: string;
  barCount: number;
  showCrossbars: boolean;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  shelfUrl,
  ripUrl,
  shelfQuantity,
  mountType,
  barCount,
  showCrossbars,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous content
    mountRef.current.innerHTML = '';

    // Get container dimensions
    const container = mountRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || window.innerHeight * 0.6; // Responsive yükseklik

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup with container aspect ratio
    const camera = new THREE.PerspectiveCamera(
      35,  // Daha uygun bir görüş açısı
      containerWidth / containerHeight,
      0.1,
      10000
    );

    // Renderer setup with container size
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0xf5f5f5);
    container.appendChild(renderer.domElement);

    // Oda duvarlarını oluştur
    const roomGeometry = {
      floor: new THREE.PlaneGeometry(2000, 2000),
      backWall: new THREE.PlaneGeometry(2000, 1500),
      ceiling: new THREE.PlaneGeometry(2000, 2000),
      counter: new THREE.BoxGeometry(2000, 400, 800),
      cabinetDoor: new THREE.PlaneGeometry(495, 380), // Dolap kapakları için
    };

    // Oda materyallerini oluştur
    const whiteRoomMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.0,
      envMapIntensity: 1.0,
    });

    // Texture oluştur
    
    // Gradient texture oluştur
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;

    const gradient = context!.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ffd6ff');  // Açık pembe
    gradient.addColorStop(0.5, '#e7c6ff'); // Lavanta
    gradient.addColorStop(1, '#c8b6ff');  // Açık mor

    context!.fillStyle = gradient;
    context!.fillRect(0, 0, canvas.width, canvas.height);

    // Noise pattern ekle
    for (let i = 0; i < 100000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const brightness = Math.random() * 10 + 90;
      context!.fillStyle = `hsla(0, 0%, ${brightness}%, 0.05)`;
      context!.fillRect(x, y, 2, 2);
    }

    const wallTexture = new THREE.CanvasTexture(canvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(1, 1);

    // Duvar materyali güncelle
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.1,
      envMapIntensity: 0.8,
    });

    // Ambient occlusion texture
    const aoCanvas = document.createElement('canvas');
    const aoContext = aoCanvas.getContext('2d');
    aoCanvas.width = 1024;
    aoCanvas.height = 1024;

    const aoGradient = aoContext!.createRadialGradient(
      512, 512, 0,
      512, 512, 512
    );
    aoGradient.addColorStop(0, '#ffffff');
    aoGradient.addColorStop(1, '#e0e0e0');

    aoContext!.fillStyle = aoGradient;
    aoContext!.fillRect(0, 0, aoCanvas.width, aoCanvas.height);

    const aoTexture = new THREE.CanvasTexture(aoCanvas);
    wallMaterial.aoMap = aoTexture;
    wallMaterial.aoMapIntensity = 0.5;

    // Işıklandırmayı güçlendir
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(500, 1000, 500);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Duvar için özel spot ışıklar
    const wallLight1 = new THREE.SpotLight(0xffd6ff, 0.3);
    wallLight1.position.set(-1000, 1500, -500);
    wallLight1.target.position.set(0, 750, -1000);
    wallLight1.angle = Math.PI / 3;
    wallLight1.penumbra = 1;
    scene.add(wallLight1);
    scene.add(wallLight1.target);

    const wallLight2 = new THREE.SpotLight(0xc8b6ff, 0.3);
    wallLight2.position.set(1000, 1500, -500);
    wallLight2.target.position.set(0, 750, -1000);
    wallLight2.angle = Math.PI / 3;
    wallLight2.penumbra = 1;
    scene.add(wallLight2);
    scene.add(wallLight2.target);

    // Zemin
    const floor = new THREE.Mesh(roomGeometry.floor, whiteRoomMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    scene.add(floor);

    // Counter ve kapakları sadece 'ceiling to counter' mount type'ında oluştur
    if (mountType === 'ceiling') {
      // Counter (dolap) oluşturma
      const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
      counter.position.set(0, 200, -600);
      scene.add(counter);

      // Dolap kapakları oluşturma
      const createCabinetDoor = (xPos: number) => {
        const door = new THREE.Mesh(roomGeometry.cabinetDoor, whiteRoomMaterial);
        door.position.set(xPos, 190, -199);
        door.rotateY(Math.PI);

        // Kapak çerçevesi oluştur
        const edgeGeometry = new THREE.EdgesGeometry(door.geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xd3d3d3 });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        door.add(edges);

        // Kulp ekle
        const handleGeometry = new THREE.BoxGeometry(10, 100, 5);
        const handle = new THREE.Mesh(handleGeometry, whiteRoomMaterial);
        handle.position.set(220, 0, 2);
        door.add(handle);

        return door;
      };

      // 4 kapak ekle
      const doorPositions = [-750, -250, 250, 750];
      doorPositions.forEach(xPos => {
        const door = createCabinetDoor(xPos);
        scene.add(door);
      });
    }

    // Arka duvar
    const backWall = new THREE.Mesh(roomGeometry.backWall, wallMaterial);
    backWall.position.set(0, 750, -1000);
    scene.add(backWall);

    // Tavan
    const ceiling = new THREE.Mesh(roomGeometry.ceiling, whiteRoomMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 1500, 0);
    scene.add(ceiling);

    // OrbitControls ayarlarını güncelle
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Minimum mesafeyi azalt, maximum mesafeyi artır
    controls.minDistance = 500;    // 4000'den 500'e düşürdük
    controls.maxDistance = 15000;  // 8000'den 15000'e çıkardık
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minPolarAngle = Math.PI / 4;
    controls.target.set(0, 600, -500);
    
    // Responsive handler
    const handleResize = () => {
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight || window.innerHeight * 0.6;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Ekran boyutuna göre kamera pozisyonunu ayarla
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        camera.position.set(5500, 2500, 2500);  // Mobil için daha uzak
      } else {
        camera.position.set(4500, 2000, 2000);  // Desktop için normal
      }
      camera.lookAt(0, 600, -500);
      controls.update();
    };

    window.addEventListener('resize', handleResize);

    const loader = new STLLoader();

    // Load default models for connectors
    let modelGeometry: THREE.BufferGeometry;
    let model2Geometry: THREE.BufferGeometry;

    loader.load('/models/model1.stl', (geometry) => {
      geometry.rotateX(-Math.PI / 2);
      geometry.rotateY(Math.PI / 2);
      modelGeometry = geometry;
    }, undefined, (error) => {
      console.error('Error loading model1:', error);
    });

    loader.load('/models/model2.stl', (geometry) => {
      geometry.rotateX(-Math.PI / 2);
      geometry.rotateY(Math.PI / 2);
      model2Geometry = geometry;
    }, undefined, (error) => {
      console.error('Error loading model2:', error);
    });

    // Load shelf, connector, and rip models
    loader.load(shelfUrl, (shelfGeometry) => {
      loader.load(ripUrl, (ripGeometry) => {
        const materialShelf = new THREE.MeshStandardMaterial({
          color: 0x9bc3c9,
          opacity: 0.7,
          transparent: true,
          metalness: 0.1,
          roughness: 0.2,
          side: THREE.DoubleSide,
        });

        const materialGold = new THREE.MeshStandardMaterial({
          color: 0xf7ef8a,
          metalness: 0.3,
          roughness: 0.8,
        });

        const shelfBoundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(shelfGeometry));
        const shelfHeight = shelfBoundingBox.max.y - shelfBoundingBox.min.y;
        const shelfDepth = shelfBoundingBox.max.z - shelfBoundingBox.min.z;
        const shelfWidth = shelfBoundingBox.max.x - shelfBoundingBox.min.x;

        const adjustedCornerPositions = [
          { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.min.z + 5 },
          { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.max.z - 5 },
          { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.max.z - 5 },
        ];

        const safetyMargin = 200;
        const zOffset = -950 + (shelfDepth / 2) + safetyMargin;
        const shelfSpacing = 250; // Raflar arası mesafe

        // Yatay ripleri ekleyen yeni fonksiyon
        const addHorizontalConnectingRips = (
          baseHeight: number,
          positions: { x: number, z: number }[],
          isFront: boolean
        ) => {
          // Only add horizontal rips if showCrossbars is true
          if (!showCrossbars) return;

          // Her iki ardışık pozisyon arasına yatay rip ekle
          for (let i = 0; i < positions.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];
            
            // İki nokta arasındaki mesafe
            const length = Math.abs(end.x - start.x);
            
            // Sadece üst yatay rip geometrisi
            const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
            
            // Üst pozisyon
            horizontalRip.position.set(
              start.x + (length / 2),
              baseHeight,
              (isFront ? shelfBoundingBox.min.z : shelfBoundingBox.max.z) + zOffset
            );
            scene.add(horizontalRip);

            // Alt yatay rip kaldırıldı
          }
        };

        // Ön ve arka modeller arasına yatay rip ekleyen fonksiyon
        const addFrontToBackRips = (
          baseHeight: number,
          positions: { x: number, z: number }[]
        ) => {
          // Aynı x koordinatına sahip ön ve arka noktaları eşleştir
          const frontPoints = positions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
          const backPoints = positions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);

          frontPoints.forEach(frontPoint => {
            const backPoint = backPoints.find(bp => bp.x === frontPoint.x);
            if (backPoint) {
              // İki nokta arasındaki mesafe
              const length = Math.abs(backPoint.z - frontPoint.z);
              
              // Sadece üst yatay rip geometrisi
              const sideRipGeometry = new THREE.BoxGeometry(10, 10, length);
              const sideRip = new THREE.Mesh(sideRipGeometry, materialGold);
              
              // Üst pozisyon
              sideRip.position.set(
                frontPoint.x,
                baseHeight,
                frontPoint.z + (length / 2) + zOffset
              );
              scene.add(sideRip);

              // Alt yatay rip kaldırıldı
            }
          });
        };

        // Mount type'a göre başlangıç yüksekliğini ve yön hesaplaması
        let baseHeight: number;
        if (mountType === 'ceiling') {
          // Tavandan aşağıya doğru
          const topShelfHeight = 1195;
          
          for (let i = 0; i < shelfQuantity; i++) {
            baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
            const ripOffset = 15; // Deliğin merkez noktasına göre offset değeri

            // Shelf pozisyonlarını hesapla (odanın içinde olacak şekilde)
            const xOffset = barCount === 2 ? -shelfWidth : 0; // Sol shelf'i sola kaydır
            const secondShelfOffset = xOffset + shelfWidth; // İki shelf arası mesafe 0

            // Normal shelf oluşturma
            const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
            shelfMesh.position.set(xOffset, baseHeight, zOffset);
            scene.add(shelfMesh);

            // Eğer barCount 2 ise, ikinci shelf'i ekle
            if (barCount === 2) {
              const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
              scene.add(secondShelfMesh);

              // İki shelf için rip-model setlerinin pozisyonlarını hesapla
              const ripPositions = [
                // Ön taraf için 3 pozisyon (sol uç, orta, sağ uç)
                { x: xOffset, z: shelfBoundingBox.min.z + 5 },                // Sol shelf sol uç
                { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },  // Ortada (iki shelf'in birleştiği yer)
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 }, // Sağ shelf sağ uç
                
                // Arka taraf için 3 pozisyon (sol uç, orta, sağ uç)
                { x: xOffset, z: shelfBoundingBox.max.z - 5 },                // Sol shelf sol uç
                { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },  // Ortada (iki shelf'in birleştiği yer)
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }  // Sağ shelf sağ uç
              ];

              // Her pozisyon için rip-model setini ekle
              ripPositions.forEach((pos) => {
                const isMiddleConnector = pos.x === (xOffset + shelfWidth);
                const connectorGeometry = isMiddleConnector && 
                  ((mountType as string) === 'ceiling to counter' || 
                   (mountType as string) === 'ceiling to wall' || 
                   (mountType as string) === 'ceiling to floor') && 
                  showCrossbars 
                    ? model2Geometry 
                    : modelGeometry;
                
                const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);

                if (pos.x === -shelfWidth) {  // En soldaki model
                  connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                } else if (pos.x === secondShelfOffset + shelfWidth) {  // En sağdaki model
                  connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                } else if (isMiddleConnector) {  // Ortadaki model
                  connectorMesh.position.set(pos.x + 45, baseHeight, pos.z + zOffset);
                } else {
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                }
                scene.add(connectorMesh);

                // Rip eklerken pozisyonu ayarla
                const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                ripMesh.scale.set(1, 1, 1);

                // Ripin modelin deliğinden geçmesi için pozisyonu ayarla
                // Modelin deliğinin merkezi varsayılan olarak y ekseninde 0 noktasında
                ripMesh.position.set(
                  pos.x,
                  baseHeight + ripOffset, // Y pozisyonunu deliğe göre ayarla
                  pos.z + zOffset
                );
                scene.add(ripMesh);
              });

              // Ön taraftaki yatay ripler için pozisyonlar
              const frontPositions = [
                { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 }
              ];
              
              // Arka taraftaki yatay ripler için pozisyonlar
              const backPositions = [
                { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
              ];

              // Ön ve arka pozisyonlar tanımlandıktan sonra
              const allPositions = [...frontPositions, ...backPositions];

              // Yatay ripleri ekle
              addHorizontalConnectingRips(baseHeight, frontPositions, true);
              addHorizontalConnectingRips(baseHeight, backPositions, false);
              addFrontToBackRips(baseHeight, allPositions);
            } else {
              // Single shelf case
              adjustedCornerPositions.forEach((pos) => {
                // Add connector model
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                
                // Check if this is the left side connector
                if (pos.x === shelfBoundingBox.min.x + 5) {
                  // Rotate the left connector 180 degrees around Y axis
                  connectorMesh.rotation.y = Math.PI;
                  // Adjust position to account for rotation
                  connectorMesh.position.set(pos.x - 25, baseHeight, pos.z + zOffset);
                } else {
                  // Right side connector remains unchanged
                  connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                }
                scene.add(connectorMesh);

                // Add rip
                const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                ripMesh.scale.set(1, 1, 1);
                ripMesh.position.set(
                  pos.x,
                  baseHeight + ripOffset,
                  pos.z + zOffset
                );
                scene.add(ripMesh);
              });

              // Add horizontal connecting rips for single bay
              const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
              const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
              
              addHorizontalConnectingRips(baseHeight, frontPositions, true);
              addHorizontalConnectingRips(baseHeight, backPositions, false);
              addFrontToBackRips(baseHeight, adjustedCornerPositions);
            }
          }

          // After all shelves are created, add ceiling connectors
          if (barCount === 2) {
            // For two shelves setup
            const ceilingConnectorPositions = [
              { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: 0, z: shelfBoundingBox.min.z + 5 },
              { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
              { x: 0, z: shelfBoundingBox.max.z - 5 },
              { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }
            ];

            // Load Model 11 for ceiling connections
            const model11Loader = new STLLoader();
            model11Loader.load('/models/model11.stl', (model11Geometry) => {
              ceilingConnectorPositions.forEach((pos) => {
                const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
                ceilingConnector.scale.set(1.5, 1.5, 1.5);
                ceilingConnector.rotation.x = Math.PI; // Rotate 180 degrees to face down
                ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset); // Position at ceiling height (1500)
                scene.add(ceilingConnector);
              });
            });
          } else {
            // For single shelf setup
            const model11Loader = new STLLoader();
            model11Loader.load('/models/model11.stl', (model11Geometry) => {
              adjustedCornerPositions.forEach((pos) => {
                const ceilingConnector = new THREE.Mesh(model11Geometry, materialGold);
                ceilingConnector.scale.set(1.5, 1.5, 1.5);
                ceilingConnector.rotation.x = Math.PI; // Rotate 180 degrees to face down
                ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset); // Position at ceiling height (1500)
                scene.add(ceilingConnector);
              });
            });
          }
        } else if (mountType === 'ceiling to counter') {
          const topShelfHeight = 1195;
          const shelfSpacing = 250;

          // Counter (dolap) oluşturma
          const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
          counter.position.set(0, 200, -600);
          scene.add(counter);

          // Dolap kapakları oluşturma
          const createCabinetDoor = (xPos: number) => {
            const door = new THREE.Mesh(roomGeometry.cabinetDoor, whiteRoomMaterial);
            door.position.set(xPos, 190, -199);
            door.rotateY(Math.PI);

            // Kapak çerçevesi oluştur
            const edgeGeometry = new THREE.EdgesGeometry(door.geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xd3d3d3 });
            const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            door.add(edges);

            // Kulp ekle
            const handleGeometry = new THREE.BoxGeometry(10, 100, 5);
            const handle = new THREE.Mesh(handleGeometry, whiteRoomMaterial);
            handle.position.set(220, 0, 2);
            door.add(handle);

            return door;
          };

          // 4 kapak ekle
          const doorPositions = [-750, -250, 250, 750];
          doorPositions.forEach(xPos => {
            const door = createCabinetDoor(xPos);
            scene.add(door);
          });

          // Load Model 12 for ceiling connections
          const model12Loader = new STLLoader();
          model12Loader.load('/models/model12.stl', (model12Geometry) => {
            // Add shelves with their connectors
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
              const ripOffset = 15;

              const xOffset = barCount === 2 ? -shelfWidth : 0;
              const secondShelfOffset = xOffset + shelfWidth;

              // Normal shelf
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(xOffset, baseHeight, zOffset);
              scene.add(shelfMesh);

              if (barCount === 2) {
                // Second shelf
                const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
                secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
                scene.add(secondShelfMesh);

                // Connection positions for double bay
                const ripPositions = [
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Add connectors and rips for each position
                ripPositions.forEach((pos) => {
                  const isMiddleConnector = pos.x === (xOffset + shelfWidth);
                  const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
                  
                  // Add normal connector
                  const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(
                    pos.x + (isMiddleConnector ? 45 : 25),
                    baseHeight,
                    pos.z + zOffset
                  );
                  scene.add(connectorMesh);

                  // Add normal rip
                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight + ripOffset, pos.z + zOffset);
                  scene.add(ripMesh);

                  // Add vertical rip from ceiling to counter
                  const verticalRipGeometry = new THREE.BoxGeometry(10, 1500 - 400, 10); // Counter height is 400
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(pos.x, 750 + 200, pos.z + zOffset); // Adjusted for counter height
                  scene.add(verticalRip);

                  // Add ceiling connector
                  const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
                  ceilingConnector.scale.set(1.5, 1.5, 1.5);
                  ceilingConnector.rotation.x = Math.PI;
                  ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
                  scene.add(ceilingConnector);

                  // Add counter connector (Model 11)
                  const model11Loader = new STLLoader();
                  model11Loader.load('/models/model11.stl', (model11Geometry) => {
                    const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
                    counterConnector.scale.set(1.5, 1.5, 1.5);
                    counterConnector.position.set(pos.x, 400, pos.z + zOffset);
                    scene.add(counterConnector);
                  });
                });

                // Add horizontal connecting rips if showCrossbars is true
                if (showCrossbars) {
                  const frontPositions = [
                    { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 }
                  ];
                  
                  const backPositions = [
                    { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                  ];

                  const allPositions = [...frontPositions, ...backPositions];
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);
                  addFrontToBackRips(baseHeight, allPositions);
                }
              } else {
                // Single bay case - similar structure with adjusted positions
                adjustedCornerPositions.forEach((pos) => {
                  // Add connector model
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  
                  if (pos.x === shelfBoundingBox.min.x + 5) {
                    connectorMesh.rotation.y = Math.PI;
                    connectorMesh.position.set(pos.x - 25, baseHeight, pos.z + zOffset);
                  } else {
                    connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                  }
                  scene.add(connectorMesh);

                  // Add normal rip
                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight + ripOffset, pos.z + zOffset);
                  scene.add(ripMesh);

                  // Add vertical rip from ceiling to counter
                  const verticalRipGeometry = new THREE.BoxGeometry(10, 1500 - 400, 10);
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(pos.x, 750 + 200, pos.z + zOffset);
                  scene.add(verticalRip);

                  // Add ceiling connector
                  const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
                  ceilingConnector.scale.set(1.5, 1.5, 1.5);
                  ceilingConnector.rotation.x = Math.PI;
                  ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
                  scene.add(ceilingConnector);

                  // Add counter connector (Model 11)
                  const model11Loader = new STLLoader();
                  model11Loader.load('/models/model11.stl', (model11Geometry) => {
                    const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
                    counterConnector.scale.set(1.5, 1.5, 1.5);
                    counterConnector.position.set(pos.x, 400, pos.z + zOffset);
                    scene.add(counterConnector);
                  });
                });

                // Add horizontal connecting rips for single bay
                if (showCrossbars) {
                  const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                  const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                  
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);
                  addFrontToBackRips(baseHeight, adjustedCornerPositions);
                }
              }
            }
          });
        } else if (mountType === 'ceiling to floor') {
          const topShelfHeight = 1195;
          const shelfSpacing = 250;
          
          // Load Model 12 for ceiling and floor connections
          const model12Loader = new STLLoader();
          model12Loader.load('/models/model12.stl', (model12Geometry) => {
            // Add shelves with their connectors
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
              const ripOffset = 15;

              const xOffset = barCount === 2 ? -shelfWidth : 0;
              const secondShelfOffset = xOffset + shelfWidth;

              // Normal shelf
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(xOffset, baseHeight, zOffset);
              scene.add(shelfMesh);

              if (barCount === 2) {
                // Second shelf
                const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
                secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
                scene.add(secondShelfMesh);

                // Connection positions for double bay
                const ripPositions = [
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Add connectors and rips for each position
                ripPositions.forEach((pos) => {
                  const isMiddleConnector = pos.x === (xOffset + shelfWidth);
                  const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
                  
                  // Add normal connector
                  const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(
                    pos.x + (isMiddleConnector ? 45 : 25),
                    baseHeight,
                    pos.z + zOffset
                  );
                  scene.add(connectorMesh);

                  // Add normal rip
                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight + ripOffset, pos.z + zOffset);
                  scene.add(ripMesh);

                  // Add vertical rip from ceiling to floor
                  const verticalRipGeometry = new THREE.BoxGeometry(10, 1500, 10);
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(pos.x, 750, pos.z + zOffset);
                  scene.add(verticalRip);

                  // Add ceiling connector
                  const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
                  ceilingConnector.scale.set(1.5, 1.5, 1.5);
                  ceilingConnector.rotation.x = Math.PI;
                  ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
                  scene.add(ceilingConnector);

                  // Add floor connector
                  const floorConnector = new THREE.Mesh(model12Geometry, materialGold);
                  floorConnector.scale.set(1.5, 1.5, 1.5);
                  floorConnector.position.set(pos.x, 0, pos.z + zOffset);
                  scene.add(floorConnector);
                });

                // Add horizontal connecting rips if showCrossbars is true
                if (showCrossbars) {
                  const frontPositions = [
                    { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 }
                  ];
                  
                  const backPositions = [
                    { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                  ];

                  const allPositions = [...frontPositions, ...backPositions];
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);
                  addFrontToBackRips(baseHeight, allPositions);
                }
              } else {
                // Single bay case
                adjustedCornerPositions.forEach((pos) => {
                  // Add connector model
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  
                  if (pos.x === shelfBoundingBox.min.x + 5) {
                    connectorMesh.rotation.y = Math.PI;
                    connectorMesh.position.set(pos.x - 25, baseHeight, pos.z + zOffset);
                  } else {
                    connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                  }
                  scene.add(connectorMesh);

                  // Add normal rip
                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight + ripOffset, pos.z + zOffset);
                  scene.add(ripMesh);

                  // Add vertical rip from ceiling to floor
                  const verticalRipGeometry = new THREE.BoxGeometry(10, 1500, 10);
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(pos.x, 750, pos.z + zOffset);
                  scene.add(verticalRip);

                  // Add ceiling connector
                  const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
                  ceilingConnector.scale.set(1.5, 1.5, 1.5);
                  ceilingConnector.rotation.x = Math.PI;
                  ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
                  scene.add(ceilingConnector);

                  // Add floor connector
                  const floorConnector = new THREE.Mesh(model12Geometry, materialGold);
                  floorConnector.scale.set(1.5, 1.5, 1.5);
                  floorConnector.position.set(pos.x, 0, pos.z + zOffset);
                  scene.add(floorConnector);
                });

                // Add horizontal connecting rips for single bay
                if (showCrossbars) {
                  const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                  const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                  
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);
                  addFrontToBackRips(baseHeight, adjustedCornerPositions);
                }
              }
            }
          });
        } else if (mountType === 'ceiling to wall') {
          const topShelfHeight = 1195;
          const shelfSpacing = 250;
          
          // Model 12'yi yükle
          const model12Loader = new STLLoader();
          model12Loader.load('/models/model12.stl', (model12Geometry) => {
            // Her raf seviyesi için Model 12'leri ekle
            for (let i = 0; i < shelfQuantity; i++) {
              const currentHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
              
              if (barCount === 2) {
                const connectionPositions = [
                  { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: 0, z: shelfBoundingBox.min.z + 5 },
                  { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: 0, z: shelfBoundingBox.max.z - 5 },
                  { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                connectionPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan yatay rip
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Tavana uzanan dikey rip (sadece en üst raf için)
                  if (i === 0) {
                    const verticalRipGeometry = new THREE.BoxGeometry(10, 1500 - currentHeight, 10);
                    const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                    verticalRip.position.set(
                      pos.x,
                      (1500 + currentHeight) / 2,
                      pos.z + zOffset
                    );
                    scene.add(verticalRip);

                    // Tavan bağlantısı için Model 12
                    const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
                    ceilingConnector.scale.set(1.5, 1.5, 1.5);
                    ceilingConnector.rotation.x = Math.PI; // 180 derece döndür
                    ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
                    scene.add(ceilingConnector);
                  }
                });
              } else {
                // Tek bay için
                adjustedCornerPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan yatay rip
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Tavana uzanan dikey rip (sadece en üst raf için)
                  if (i === 0) {
                    const verticalRipGeometry = new THREE.BoxGeometry(10, 1500 - currentHeight, 10);
                    const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                    verticalRip.position.set(
                      pos.x,
                      (1500 + currentHeight) / 2,
                      pos.z + zOffset
                    );
                    scene.add(verticalRip);

                    // Tavan bağlantısı için Model 12
                    const ceilingConnector = new THREE.Mesh(model12Geometry, materialGold);
                    ceilingConnector.scale.set(1.5, 1.5, 1.5);
                    ceilingConnector.rotation.x = Math.PI; // 180 derece döndür
                    ceilingConnector.position.set(pos.x, 1500, pos.z + zOffset);
                    scene.add(ceilingConnector);
                  }
                });
              }
            }
          });

          // Normal shelf ve yatay rip oluşturma kodu
          for (let i = 0; i < shelfQuantity; i++) {
            baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

            const xOffset = barCount === 2 ? -shelfWidth : 0;
            const secondShelfOffset = xOffset + shelfWidth;

            // Normal shelf oluşturma
            const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
            shelfMesh.position.set(xOffset, baseHeight, zOffset);
            scene.add(shelfMesh);

            // Her shelf için bağlantı pozisyonları
            const ripPositions = [
              { x: xOffset, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset, z: shelfBoundingBox.max.z - 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
            ];

            // Her pozisyon için Model 1/2 ve rip ekle
            ripPositions.forEach((pos) => {
              const isMiddleConnector = pos.x === (xOffset + shelfWidth);
              const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
              
              const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
              connectorMesh.scale.set(1.5, 1.5, 1.5);
              connectorMesh.position.set(
                pos.x + (isMiddleConnector ? 45 : pos.x === xOffset ? 25 : 25),
                baseHeight,
                pos.z + zOffset
              );
              scene.add(connectorMesh);

              // Dikey rip (son raf hariç)
              if (i < shelfQuantity - 1) {
                const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                verticalRip.position.set(
                  pos.x,
                  baseHeight - (shelfSpacing / 2),
                  pos.z + zOffset
                );
                scene.add(verticalRip);
              }
            });

            if (barCount === 2) {
              // İkinci shelf
              const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
              scene.add(secondShelfMesh);

              // İkinci shelf için ek pozisyonlar
              const additionalPositions = [
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
              ];

              // İkinci shelf için Model 1/2 ve rip ekle
              additionalPositions.forEach((pos) => {
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                // Dikey rip (son raf hariç)
                if (i < shelfQuantity - 1) {
                  const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(
                    pos.x,
                    baseHeight - (shelfSpacing / 2),
                    pos.z + zOffset
                  );
                  scene.add(verticalRip);
                }
              });
            }

            // Yatay bağlantı ripleri için pozisyonlar ve ekleme kodu aynı kalacak...
          }
        } else if (mountType === 'wall') {
          const topShelfHeight = 1195;
          const shelfSpacing = 250;
          
          // Model 12'yi yükle
          const model12Loader = new STLLoader();
          model12Loader.load('/models/model12.stl', (model12Geometry) => {
            // Her raf seviyesi için Model 12'leri ekle
            for (let i = 0; i < shelfQuantity; i++) {
              const currentHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
              
              if (barCount === 2) {
                const connectionPositions = [
                  { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: 0, z: shelfBoundingBox.min.z + 5 },
                  { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: 0, z: shelfBoundingBox.max.z - 5 },
                  { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                connectionPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan yatay rip
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);
                });
              } else {
                // Tek bay için
                adjustedCornerPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan yatay rip
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);
                });
              }
            }
          });

          // Normal shelf ve yatay rip oluşturma kodu
          for (let i = 0; i < shelfQuantity; i++) {
            baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

            const xOffset = barCount === 2 ? -shelfWidth : 0;
            const secondShelfOffset = xOffset + shelfWidth;

            // Normal shelf oluşturma
            const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
            shelfMesh.position.set(xOffset, baseHeight, zOffset);
            scene.add(shelfMesh);

            // Her shelf için bağlantı pozisyonları
            const ripPositions = [
              { x: xOffset, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset, z: shelfBoundingBox.max.z - 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
            ];

            // Her pozisyon için Model 1/2 ve rip ekle
            ripPositions.forEach((pos) => {
              const isMiddleConnector = pos.x === (xOffset + shelfWidth);
              const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
              
              const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
              connectorMesh.scale.set(1.5, 1.5, 1.5);
              connectorMesh.position.set(
                pos.x + (isMiddleConnector ? 45 : pos.x === xOffset ? 25 : 25),
                baseHeight,
                pos.z + zOffset
              );
              scene.add(connectorMesh);

              // Dikey rip (son raf hariç)
              if (i < shelfQuantity - 1) {
                const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                verticalRip.position.set(
                  pos.x,
                  baseHeight - (shelfSpacing / 2),
                  pos.z + zOffset
                );
                scene.add(verticalRip);
              }
            });

            if (barCount === 2) {
              // İkinci shelf
              const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
              scene.add(secondShelfMesh);

              // İkinci shelf için ek pozisyonlar
              const additionalPositions = [
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
              ];

              // İkinci shelf için Model 1/2 ve rip ekle
              additionalPositions.forEach((pos) => {
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                // Dikey rip (son raf hariç)
                if (i < shelfQuantity - 1) {
                  const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(
                    pos.x,
                    baseHeight - (shelfSpacing / 2),
                    pos.z + zOffset
                  );
                  scene.add(verticalRip);
                }
              });
            }

            // Yatay bağlantı ripleri için pozisyonlar ve ekleme kodu aynı kalacak...
          }
        } else if (mountType === 'wall to counter') {
          const topShelfHeight = 1195;
          const shelfSpacing = 250;
          
          // Counter (dolap) oluşturma
          const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
          counter.position.set(0, 200, -600);
          scene.add(counter);

          // Dolap kapakları oluşturma
          const createCabinetDoor = (xPos: number) => {
            const door = new THREE.Mesh(roomGeometry.cabinetDoor, whiteRoomMaterial);
            door.position.set(xPos, 190, -199);
            door.rotateY(Math.PI);

            // Kapak çerçevesi oluştur
            const edgeGeometry = new THREE.EdgesGeometry(door.geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xd3d3d3 });
            const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            door.add(edges);

            // Kulp ekle
            const handleGeometry = new THREE.BoxGeometry(10, 100, 5);
            const handle = new THREE.Mesh(handleGeometry, whiteRoomMaterial);
            handle.position.set(220, 0, 2);
            door.add(handle);

            return door;
          };

          // 4 kapak ekle
          const doorPositions = [-750, -250, 250, 750];
          doorPositions.forEach(xPos => {
            const door = createCabinetDoor(xPos);
            scene.add(door);
          });

          // Model 12'yi yükle
          const model12Loader = new STLLoader();
          model12Loader.load('/models/model12.stl', (model12Geometry) => {
            // Her raf seviyesi için Model 12'leri ekle
            for (let i = 0; i < shelfQuantity; i++) {
              const currentHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
              
              if (barCount === 2) {
                const connectionPositions = [
                  { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: 0, z: shelfBoundingBox.min.z + 5 },
                  { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: 0, z: shelfBoundingBox.max.z - 5 },
                  { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                connectionPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan yatay rip
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Counter'a uzanan dikey rip (son raf için)
                  if (i === shelfQuantity - 1) {
                    const verticalRipGeometry = new THREE.BoxGeometry(10, currentHeight - 400, 10);
                    const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                    verticalRip.position.set(
                      pos.x,
                      (currentHeight + 400) / 2,
                      pos.z + zOffset
                    );
                    scene.add(verticalRip);

                    // Counter bağlantısı için Model 11
                    const model11Loader = new STLLoader();
                    model11Loader.load('/models/model11.stl', (model11Geometry) => {
                      const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
                      counterConnector.scale.set(1.5, 1.5, 1.5);
                      counterConnector.position.set(pos.x, 400, pos.z + zOffset);
                      scene.add(counterConnector);
                    });
                  }
                });
              } else {
                // Tek bay için
                adjustedCornerPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan yatay rip
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Counter'a uzanan dikey rip (son raf için)
                  if (i === shelfQuantity - 1) {
                    const verticalRipGeometry = new THREE.BoxGeometry(10, currentHeight - 400, 10);
                    const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                    verticalRip.position.set(
                      pos.x,
                      (currentHeight + 400) / 2,
                      pos.z + zOffset
                    );
                    scene.add(verticalRip);

                    // Counter bağlantısı için Model 11
                    const model11Loader = new STLLoader();
                    model11Loader.load('/models/model11.stl', (model11Geometry) => {
                      const counterConnector = new THREE.Mesh(model11Geometry, materialGold);
                      counterConnector.scale.set(1.5, 1.5, 1.5);
                      counterConnector.position.set(pos.x, 400, pos.z + zOffset);
                      scene.add(counterConnector);
                    });
                  }
                });
              }
            }
          });

          // Normal shelf ve yatay rip oluşturma kodu
          for (let i = 0; i < shelfQuantity; i++) {
            baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

            const xOffset = barCount === 2 ? -shelfWidth : 0;
            const secondShelfOffset = xOffset + shelfWidth;

            // Normal shelf oluşturma
            const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
            shelfMesh.position.set(xOffset, baseHeight, zOffset);
            scene.add(shelfMesh);

            if (barCount === 2) {
              // İkinci shelf
              const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
              scene.add(secondShelfMesh);
            }

            // Her shelf için bağlantı pozisyonları ve Model 1/2 ekleme
            const ripPositions = barCount === 2 ? [
              { x: xOffset, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset, z: shelfBoundingBox.max.z - 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
              { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
            ] : adjustedCornerPositions;

            // Her pozisyon için Model 1/2 ve rip ekle
            ripPositions.forEach((pos) => {
              const isMiddleConnector = pos.x === (xOffset + shelfWidth);
              const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
              
              const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
              connectorMesh.scale.set(1.5, 1.5, 1.5);
              connectorMesh.position.set(
                pos.x + (isMiddleConnector ? 45 : 25),
                baseHeight,
                pos.z + zOffset
              );
              scene.add(connectorMesh);

              // Dikey rip (son raf hariç)
              if (i < shelfQuantity - 1) {
                const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                verticalRip.position.set(
                  pos.x,
                  baseHeight - (shelfSpacing / 2),
                  pos.z + zOffset
                );
                scene.add(verticalRip);
              }
            });

            // Yatay bağlantı ripleri
            if (showCrossbars) {
              const frontPositions = ripPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
              const backPositions = ripPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
              
              addHorizontalConnectingRips(baseHeight, frontPositions, true);
              addHorizontalConnectingRips(baseHeight, backPositions, false);
              addFrontToBackRips(baseHeight, ripPositions);
            }
          }
        } else if (mountType === 'wall to floor') {
          const topShelfHeight = 1195;
          const shelfSpacing = 250;
          
          // Model 12'yi yükle
          const model12Loader = new STLLoader();
          model12Loader.load('/models/model12.stl', (model12Geometry) => {
            // Her raf seviyesi için Model 12'leri ekle
            for (let i = 0; i < shelfQuantity; i++) {
              const currentHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));
              const xOffset = barCount === 2 ? -shelfWidth : 0;
              
              if (barCount === 2) {
                const connectionPositions = [
                  { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: 0, z: shelfBoundingBox.min.z + 5 },
                  { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: 0, z: shelfBoundingBox.max.z - 5 },
                  { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                connectionPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan kısa rip
                  const horizontalRipLength = 50;
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    -1000 + (horizontalRipLength / 2)
                  );
                  scene.add(horizontalRip);

                  // Raflar arası dikey bağlantılar (son raf hariç)
                  if (i < shelfQuantity - 1) {
                    const isMiddleConnector = pos.x === (xOffset + shelfWidth);
                    const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
                    
                    const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
                    connectorMesh.scale.set(1.5, 1.5, 1.5);
                    connectorMesh.position.set(
                      pos.x + (isMiddleConnector ? 45 : pos.x === -shelfWidth ? 25 : pos.x === shelfWidth ? 25 : 0),
                      currentHeight,
                      pos.z + zOffset
                    );
                    scene.add(connectorMesh);

                    // Dikey rip
                    const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                    const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                    verticalRip.position.set(
                      pos.x,
                      currentHeight - (shelfSpacing / 2), // Bir alt rafa kadar uzansın
                      pos.z + zOffset
                    );
                    scene.add(verticalRip);
                  }

                  // Zemindeki Model 11 ve zemine uzanan rip (sadece en alttaki raf için)
                  if (i === shelfQuantity - 1) {
                    const model11Loader = new STLLoader();
                    model11Loader.load('/models/model11.stl', (model11Geometry) => {
                      const floorConnector = new THREE.Mesh(model11Geometry, materialGold);
                      floorConnector.scale.set(1.5, 1.5, 1.5);
                      floorConnector.position.set(pos.x, 0, pos.z + zOffset);
                      scene.add(floorConnector);

                      // Zeminden yukarı uzanan dikey rip
                      const verticalRipGeometry = new THREE.BoxGeometry(10, currentHeight, 10);
                      const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                      verticalRip.position.set(
                        pos.x,
                        currentHeight / 2,
                        pos.z + zOffset
                      );
                      scene.add(verticalRip);
                    });
                  }
                });
              } else {
                // Tek bay için
                adjustedCornerPositions.forEach((pos) => {
                  // Duvardaki Model 12
                  const wallConnector = new THREE.Mesh(model12Geometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, currentHeight, -1000);
                  scene.add(wallConnector);

                  // Duvara uzanan kısa rip
                  const horizontalRipLength = 50;
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    currentHeight,
                    -1000 + (horizontalRipLength / 2)
                  );
                  scene.add(horizontalRip);

                  // Zemindeki Model 11 ve zemine uzanan rip (sadece en alttaki raf için)
                  if (i === shelfQuantity - 1) {
                    const model11Loader = new STLLoader();
                    model11Loader.load('/models/model11.stl', (model11Geometry) => {
                      const floorConnector = new THREE.Mesh(model11Geometry, materialGold);
                      floorConnector.scale.set(1.5, 1.5, 1.5);
                      floorConnector.position.set(pos.x, 0, pos.z + zOffset);
                      scene.add(floorConnector);

                      // Zeminden yukarı uzanan dikey rip
                      const verticalRipGeometry = new THREE.BoxGeometry(10, currentHeight, 10);
                      const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                      verticalRip.position.set(
                        pos.x,
                        currentHeight / 2,
                        pos.z + zOffset
                      );
                      scene.add(verticalRip);
                    });
                  }
                });
              }
            }
          });

          // Normal shelf ve yatay rip oluşturma kodu
          for (let i = 0; i < shelfQuantity; i++) {
            baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

            const xOffset = barCount === 2 ? -shelfWidth : 0;
            const secondShelfOffset = xOffset + shelfWidth;

            // Normal shelf oluşturma
            const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
            shelfMesh.position.set(xOffset, baseHeight, zOffset);
            scene.add(shelfMesh);

            // Her shelf için bağlantı pozisyonları
            const ripPositions = [
              { x: xOffset, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
              { x: xOffset, z: shelfBoundingBox.max.z - 5 },
              { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
            ];

            // Her pozisyon için Model 1/2 ve rip ekle
            ripPositions.forEach((pos) => {
              const isMiddleConnector = pos.x === (xOffset + shelfWidth);
              const connectorGeometry = isMiddleConnector && showCrossbars ? model2Geometry : modelGeometry;
              
              const connectorMesh = new THREE.Mesh(connectorGeometry, materialGold);
              connectorMesh.scale.set(1.5, 1.5, 1.5);
              connectorMesh.position.set(
                pos.x + (isMiddleConnector ? 45 : pos.x === xOffset ? 25 : 25),
                baseHeight,
                pos.z + zOffset
              );
              scene.add(connectorMesh);

              // Dikey rip (son raf hariç)
              if (i < shelfQuantity - 1) {
                const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                verticalRip.position.set(
                  pos.x,
                  baseHeight - (shelfSpacing / 2),
                  pos.z + zOffset
                );
                scene.add(verticalRip);
              }
            });

            if (barCount === 2) {
              // İkinci shelf
              const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
              scene.add(secondShelfMesh);

              // İkinci shelf için ek pozisyonlar
              const additionalPositions = [
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
              ];

              // İkinci shelf için Model 1/2 ve rip ekle
              additionalPositions.forEach((pos) => {
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x + 25, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                // Dikey rip (son raf hariç)
                if (i < shelfQuantity - 1) {
                  const verticalRipGeometry = new THREE.BoxGeometry(10, shelfSpacing, 10);
                  const verticalRip = new THREE.Mesh(verticalRipGeometry, materialGold);
                  verticalRip.position.set(
                    pos.x,
                    baseHeight - (shelfSpacing / 2),
                    pos.z + zOffset
                  );
                  scene.add(verticalRip);
                }
              });
            }

            // Yatay bağlantı ripleri için pozisyonlar ve ekleme kodu aynı kalacak...
          }
        }

        // Kamera pozisyonunu daha da uzaktan gösterecek şekilde ayarla
        camera.position.set(4500, 2000, 2000);     // Tüm değerleri artırdık
        camera.lookAt(0, 600, -500);               // Hedef nokta aynı
        controls.update();
      });
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [shelfUrl, ripUrl, shelfQuantity, mountType, barCount, showCrossbars]); // Add showCrossbars to dependencies

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div ref={mountRef} className="w-full md:w-[80%] lg:w-[70%] h-[400px] md:h-[500px] lg:h-[70%] max-h-[900px]" />
    </div>
  );
};

export default ThreeDViewer;
