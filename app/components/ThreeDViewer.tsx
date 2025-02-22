import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface ThreeDViewerProps {
  modelUrl: string;
  shelfUrl: string;
  ripUrl: string;
  shelfQuantity: number;
  mountType: string;
  barCount: number;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  modelUrl,
  shelfUrl,
  ripUrl,
  shelfQuantity,
  mountType,
  barCount,
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
    if (mountType === 'ceiling to counter') {
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4000;
    controls.maxDistance = 8000;
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

    // Load shelf, connector, and rip models
    loader.load(shelfUrl, (shelfGeometry) => {
      loader.load(modelUrl, (modelGeometry) => {
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
            // Her iki ardışık pozisyon arasına yatay rip ekle
            for (let i = 0; i < positions.length - 1; i++) {
              const start = positions[i];
              const end = positions[i + 1];
              
              // İki nokta arasındaki mesafe
              const length = Math.abs(end.x - start.x);
              
              // Yatay rip geometrisi
              const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
              const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
              
              // Ripin pozisyonu (iki nokta arasının ortası)
              horizontalRip.position.set(
                start.x + (length / 2),
                baseHeight,
                (isFront ? shelfBoundingBox.min.z : shelfBoundingBox.max.z) + zOffset
              );
              
              scene.add(horizontalRip);
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
                
                // Yatay rip geometrisi
                const sideRipGeometry = new THREE.BoxGeometry(10, 10, length);
                const sideRip = new THREE.Mesh(sideRipGeometry, materialGold);
                
                // Ripin pozisyonu (iki nokta arasının ortası)
                sideRip.position.set(
                  frontPoint.x,
                  baseHeight,
                  frontPoint.z + (length / 2) + zOffset
                );
                
                scene.add(sideRip);
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
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);
              } else {
                // Tek shelf için yatay ripler
                const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Tek shelf için ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, adjustedCornerPositions);
              }

              adjustedCornerPositions.forEach((pos) => {
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                ripMesh.scale.set(1, 1, 1);
                ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(ripMesh);
              });
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
            
            if (shelfQuantity <= 3) {
              // Normal aralıklarla rafları yerleştir
              for (let i = 0; i < shelfQuantity; i++) {
                baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

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
                    const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                    connectorMesh.scale.set(1.5, 1.5, 1.5);
                    connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(connectorMesh);

                    const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                    ripMesh.scale.set(1, 1, 1);
                    ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
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

                  // Yatay ripleri ekle
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);

                  // Ön-arka bağlantı ripleri için pozisyonlar
                  const allPositions = [
                    // Sol shelf'in köşeleri
                    { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                    { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                    // Orta bağlantı noktaları
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                    // Sağ shelf'in köşeleri
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                  ];

                  // Ön-arka bağlantı riplerini ekle
                  addFrontToBackRips(baseHeight, allPositions);
                } else {
                  // Tek shelf için yatay ripler
                  const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                  const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                  
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);

                  // Tek shelf için ön-arka bağlantı riplerini ekle
                  addFrontToBackRips(baseHeight, adjustedCornerPositions);
                }

                adjustedCornerPositions.forEach((pos) => {
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(ripMesh);
                });
              }

              // Son raf ile counter arasına uzatılmış rip ekle
              const lastShelfHeight = topShelfHeight - ((shelfQuantity - 1) * (shelfHeight + shelfSpacing));
              const counterTop = 400; // Counter yüksekliği
              
              if (lastShelfHeight > counterTop) {
                // Son raf ile counter arasındaki mesafe
                const gapHeight = lastShelfHeight - counterTop;
                
                if (barCount === 2) {
                  // Bay 2 için counter'a uzanan ripler
                  const ripPositions = [
                    // Ön taraf için 3 pozisyon (sol uç, orta, sağ uç)
                    { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },                // Sol shelf sol uç
                    { x: 0, z: shelfBoundingBox.min.z + 5 },  // Ortada
                    { x: shelfWidth, z: shelfBoundingBox.min.z + 5 }, // Sağ shelf sağ uç
                    
                    // Arka taraf için 3 pozisyon (sol uç, orta, sağ uç)
                    { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },                // Sol shelf sol uç
                    { x: 0, z: shelfBoundingBox.max.z - 5 },  // Ortada
                    { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }  // Sağ shelf sağ uç
                  ];

                  ripPositions.forEach((pos) => {
                    const extendedRipGeometry = new THREE.BoxGeometry(10, gapHeight, 10);
                    const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                    
                    extendedRip.position.set(
                      pos.x,
                      counterTop + (gapHeight / 2),
                      pos.z + zOffset
                    );
                    
                    scene.add(extendedRip);
                  });
                } else {
                  // Bay 1 için counter'a uzanan ripler
                  adjustedCornerPositions.forEach((pos) => {
                    const extendedRipGeometry = new THREE.BoxGeometry(10, gapHeight, 10);
                    const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                    
                    extendedRip.position.set(
                      pos.x,
                      counterTop + (gapHeight / 2),
                      pos.z + zOffset
                    );
                    
                    scene.add(extendedRip);
                  });
                }
              }
            } else {
              // 4 ve üzeri raf sayısı için counter'a kadar olan mesafeyi hesapla
              const counterHeight = 400;
              const availableSpace = topShelfHeight - counterHeight;
              const adjustedSpacing = (availableSpace - (shelfQuantity * shelfHeight)) / (shelfQuantity - 1);
              
              for (let i = 0; i < shelfQuantity; i++) {
                baseHeight = topShelfHeight - (i * (shelfHeight + adjustedSpacing));

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
                    const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                    connectorMesh.scale.set(1.5, 1.5, 1.5);
                    connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(connectorMesh);

                    const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                    ripMesh.scale.set(1, 1, 1);
                    ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
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

                  // Yatay ripleri ekle
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);

                  // Ön-arka bağlantı ripleri için pozisyonlar
                  const allPositions = [
                    // Sol shelf'in köşeleri
                    { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                    { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                    // Orta bağlantı noktaları
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                    { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                    // Sağ shelf'in köşeleri
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                    { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                  ];

                  // Ön-arka bağlantı riplerini ekle
                  addFrontToBackRips(baseHeight, allPositions);
                } else {
                  // Tek shelf için yatay ripler
                  const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                  const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                  
                  addHorizontalConnectingRips(baseHeight, frontPositions, true);
                  addHorizontalConnectingRips(baseHeight, backPositions, false);

                  // Tek shelf için ön-arka bağlantı riplerini ekle
                  addFrontToBackRips(baseHeight, adjustedCornerPositions);
                }

                adjustedCornerPositions.forEach((pos) => {
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(ripMesh);
                });
              }
            }
          } else if (mountType === 'ceiling to floor') {
            const topShelfHeight = 1195;
            const shelfSpacing = 250; // Normal raf aralığı
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

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
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);
              } else {
                // Tek shelf için yatay ripler
                const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Tek shelf için ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, adjustedCornerPositions);
              }

              adjustedCornerPositions.forEach((pos) => {
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                ripMesh.scale.set(1, 1, 1);
                ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(ripMesh);
              });
            }

            // Zemine uzanan ripler ekle
            if (barCount === 2) {
              // Bay 2 için tüm rip pozisyonlardan zemine uzanan ripler ekle
              const ripPositions = [
                // Ön taraf için 3 pozisyon (sol uç, orta, sağ uç)
                { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },                // Sol shelf sol uç
                { x: 0, z: shelfBoundingBox.min.z + 5 },  // Ortada
                { x: shelfWidth, z: shelfBoundingBox.min.z + 5 }, // Sağ shelf sağ uç
                
                // Arka taraf için 3 pozisyon (sol uç, orta, sağ uç)
                { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },                // Sol shelf sol uç
                { x: 0, z: shelfBoundingBox.max.z - 5 },  // Ortada
                { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }  // Sağ shelf sağ uç
              ];

              // Her pozisyon için uzatılmış rip ekle
              ripPositions.forEach((pos) => {
                const extendedRipGeometry = new THREE.BoxGeometry(10, topShelfHeight, 10);
                const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                
                extendedRip.position.set(
                  pos.x,
                  topShelfHeight / 2,
                  pos.z + zOffset
                );
                
                scene.add(extendedRip);
              });
            } else {
              // Bay 1 için zemine uzanan ripler ekle
              adjustedCornerPositions.forEach((pos) => {
                const extendedRipGeometry = new THREE.BoxGeometry(10, topShelfHeight, 10);
                const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                
                extendedRip.position.set(
                  pos.x,
                  topShelfHeight / 2,
                  pos.z + zOffset
                );
                
                scene.add(extendedRip);
              });
            }
          } else if (mountType === 'ceiling to wall') {
            const topShelfHeight = 1195;
            const shelfSpacing = 250; // Normal raf aralığı
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

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
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);

                // Add wall connections for each shelf level
                const wallConnectionPositions = [
                  { x: -shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: 0, z: shelfBoundingBox.min.z + 5 },
                  { x: shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: -shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  { x: 0, z: shelfBoundingBox.max.z - 5 },
                  { x: shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                wallConnectionPositions.forEach((pos) => {
                  // Add wall connector (Model 5)
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2; // Rotate to face outward from wall
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000); // Position at wall

                  // Add horizontal rip from wall to shelf
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );

                  scene.add(wallConnector);
                  scene.add(horizontalRip);
                });
              } else {
                // For single shelf
                adjustedCornerPositions.forEach((pos) => {
                  // Add wall connector (Model 5)
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2; // Rotate to face outward from wall
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000); // Position at wall

                  // Add horizontal rip from wall to shelf
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );

                  scene.add(wallConnector);
                  scene.add(horizontalRip);
                });
              }
            }

            // ... rest of the existing code for ceiling connections ...
          } else if (mountType === 'wall to floor') {
            const topShelfHeight = 1195;
            const shelfSpacing = 250; // Normal raf aralığı
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Shelf pozisyonlarını hesapla (odanın içinde olacak şekilde)
              const xOffset = barCount === 2 ? -shelfWidth : 0; // Sol shelf'i sola kaydır
              const secondShelfOffset = xOffset + shelfWidth; // İki shelf arası mesafe 0

              // Normal shelf oluşturma
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(xOffset, baseHeight, zOffset);
              scene.add(shelfMesh);

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
                  // Model ekle
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  // Dikey rip ekle (ilk raf hariç)
                  if (i !== 0) {
                    const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                    verticalRip.scale.set(1, 1, 1);
                    verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(verticalRip);
                  }

                  // Yatay rip ekle
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvardaki bağlantı noktaları
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);

                  // Zemine uzanan rip ekle
                  const floorRipGeometry = new THREE.BoxGeometry(10, baseHeight, 10);
                  const floorRip = new THREE.Mesh(floorRipGeometry, materialGold);
                  
                  floorRip.position.set(
                    pos.x,
                    baseHeight / 2,
                    pos.z + zOffset
                  );
                  
                  scene.add(floorRip);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);
              } else {
                // Bay 1 için model ve ripleri ekle
                adjustedCornerPositions.forEach((pos) => {
                  // Model ekle
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  // Dikey rip ekle (ilk raf hariç)
                  if (i !== 0) {
                    const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                    verticalRip.scale.set(1, 1, 1);
                    verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(verticalRip);
                  }

                  // Yatay rip ekle
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvardaki bağlantı noktaları
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);

                  // Zemine uzanan rip ekle
                  const floorRipGeometry = new THREE.BoxGeometry(10, baseHeight, 10);
                  const floorRip = new THREE.Mesh(floorRipGeometry, materialGold);
                  
                  floorRip.position.set(
                    pos.x,
                    baseHeight / 2,
                    pos.z + zOffset
                  );
                  
                  scene.add(floorRip);
                });

                // Tek shelf için yatay ripler
                const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Tek shelf için ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, adjustedCornerPositions);
              }
            }
          } else if (mountType === 'wall to counter') {
            const topShelfHeight = 1195;
            const shelfSpacing = 250; // Normal raf aralığı
            
            // Counter'ı oluştur
            const counter = new THREE.Mesh(roomGeometry.counter, whiteRoomMaterial);
            counter.position.set(0, 200, -600);
            scene.add(counter);

            // Dolap kapakları oluştur
            const createCabinetDoor = (xPos: number) => {
              const door = new THREE.Mesh(roomGeometry.cabinetDoor, whiteRoomMaterial);
              door.position.set(xPos, 190, -199);
              door.rotateY(Math.PI);

              const edgeGeometry = new THREE.EdgesGeometry(door.geometry);
              const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xd3d3d3 });
              const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
              door.add(edges);

              const handleGeometry = new THREE.BoxGeometry(10, 100, 5);
              const handle = new THREE.Mesh(handleGeometry, whiteRoomMaterial);
              handle.position.set(220, 0, 2);
              door.add(handle);

              return door;
            };

            // Kapakları ekle
            const doorPositions = [-750, -250, 250, 750];
            doorPositions.forEach(xPos => {
              const door = createCabinetDoor(xPos);
              scene.add(door);
            });

            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Shelf pozisyonlarını hesapla (odanın içinde olacak şekilde)
              const xOffset = barCount === 2 ? -shelfWidth : 0; // Sol shelf'i sola kaydır
              const secondShelfOffset = xOffset + shelfWidth; // İki shelf arası mesafe 0

              // Normal shelf oluşturma
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(xOffset, baseHeight, zOffset);
              scene.add(shelfMesh);

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
                  // Model ekle
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  // Dikey rip ekle (ilk raf hariç)
                  if (i !== 0) {
                    const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                    verticalRip.scale.set(1, 1, 1);
                    verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(verticalRip);
                  }

                  // Yatay rip ekle
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvardaki bağlantı noktaları
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);

                  // Counter'a uzanan rip ekle
                  const counterHeight = 400; // Counter yüksekliği
                  const ripHeight = baseHeight - counterHeight;
                  const counterRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
                  const counterRip = new THREE.Mesh(counterRipGeometry, materialGold);
                  
                  counterRip.position.set(
                    pos.x,
                    counterHeight + (ripHeight / 2),
                    pos.z + zOffset
                  );
                  
                  scene.add(counterRip);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);
              } else {
                // Bay 1 için model ve ripleri ekle
                adjustedCornerPositions.forEach((pos) => {
                  // Model ekle
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  // Dikey rip ekle (ilk raf hariç)
                  if (i !== 0) {
                    const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                    verticalRip.scale.set(1, 1, 1);
                    verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(verticalRip);
                  }

                  // Yatay rip ekle
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvardaki bağlantı noktaları
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);

                  // Counter'a uzanan rip ekle
                  const counterHeight = 400; // Counter yüksekliği
                  const ripHeight = baseHeight - counterHeight;
                  const counterRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
                  const counterRip = new THREE.Mesh(counterRipGeometry, materialGold);
                  
                  counterRip.position.set(
                    pos.x,
                    counterHeight + (ripHeight / 2),
                    pos.z + zOffset
                  );
                  
                  scene.add(counterRip);
                });

                // Tek shelf için yatay ripler
                const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Tek shelf için ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, adjustedCornerPositions);
              }
            }
          } else if (mountType === 'wall') {
            const topShelfHeight = 1195;
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Shelf pozisyonlarını hesapla
              const xOffset = barCount === 2 ? -shelfWidth : 0;
              const secondShelfOffset = xOffset + shelfWidth;

              // Normal shelf oluşturma
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(xOffset, baseHeight, zOffset);
              scene.add(shelfMesh);

              if (barCount === 2) {
                const secondShelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
                secondShelfMesh.position.set(secondShelfOffset, baseHeight, zOffset);
                scene.add(secondShelfMesh);

                // Tüm bağlantı noktaları (köşeler ve shelf'ler arası)
                const allConnectPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },  // Sol ön
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },  // Sol arka
                  // Shelf'ler arası bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },  // Orta ön
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },  // Orta arka
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },  // Sağ ön
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }   // Sağ arka
                ];

                allConnectPositions.forEach((pos) => {
                  // Model ekle
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  // Dikey rip ekle (ilk raf hariç)
                  if (i !== 0) {
                    const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                    verticalRip.scale.set(1, 1, 1);
                    verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(verticalRip);
                  }

                  // Yatay rip ekle
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvardaki bağlantı noktaları
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);
              } else {
                // Bay 1 için model ve ripleri ekle
                adjustedCornerPositions.forEach((pos) => {
                  // Model ekle
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  // Dikey rip ekle (ilk raf hariç)
                  if (i !== 0) {
                    const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                    verticalRip.scale.set(1, 1, 1);
                    verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                    scene.add(verticalRip);
                  }

                  // Yatay rip ekle
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvardaki bağlantı noktaları
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);
                });

                // Tek shelf için yatay ripler
                const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Tek shelf için ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, adjustedCornerPositions);
              }
            }
          } else {
            // Zeminden yukarıya doğru
            const bottomShelfHeight = 300;
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = bottomShelfHeight + (i * (shelfHeight + shelfSpacing));

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
                  const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                  connectorMesh.scale.set(1.5, 1.5, 1.5);
                  connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(connectorMesh);

                  const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                  ripMesh.scale.set(1, 1, 1);
                  ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
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

                // Yatay ripleri ekle
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Ön-arka bağlantı ripleri için pozisyonlar
                const allPositions = [
                  // Sol shelf'in köşeleri
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in köşeleri
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                // Ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, allPositions);
              } else {
                // Tek shelf için yatay ripler
                const frontPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.min.z + 5);
                const backPositions = adjustedCornerPositions.filter(pos => pos.z === shelfBoundingBox.max.z - 5);
                
                addHorizontalConnectingRips(baseHeight, frontPositions, true);
                addHorizontalConnectingRips(baseHeight, backPositions, false);

                // Tek shelf için ön-arka bağlantı riplerini ekle
                addFrontToBackRips(baseHeight, adjustedCornerPositions);
              }

              adjustedCornerPositions.forEach((pos) => {
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
                ripMesh.scale.set(1, 1, 1);
                ripMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(ripMesh);
              });
            }
          }

          // Kamera pozisyonunu daha da uzaktan gösterecek şekilde ayarla
          camera.position.set(4500, 2000, 2000);     // Tüm değerleri artırdık
          camera.lookAt(0, 600, -500);               // Hedef nokta aynı
          controls.update();
        });
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
  }, [modelUrl, shelfUrl, ripUrl, shelfQuantity, mountType, barCount]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div ref={mountRef} className="w-full md:w-[80%] lg:w-[70%] h-[400px] md:h-[500px] lg:h-[70%] max-h-[900px]" />
    </div>
  );
};

export default ThreeDViewer;
