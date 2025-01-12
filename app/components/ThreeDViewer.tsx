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
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf5f5f5);
    mountRef.current?.appendChild(renderer.domElement);

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
    controls.minDistance = 500;
    controls.maxDistance = 3000;

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
            // Tavandan başla, normal aralıklarla yerleştir
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

                // Bay 2 için yatay ripleri ve duvar bağlantılarını ekle
                const wallConnectPositions = [
                  // Sol shelf'in bağlantı noktaları
                  { x: xOffset, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset, z: shelfBoundingBox.max.z - 5 },
                  // Orta bağlantı noktaları
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: xOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 },
                  // Sağ shelf'in bağlantı noktaları
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.min.z + 5 },
                  { x: secondShelfOffset + shelfWidth, z: shelfBoundingBox.max.z - 5 }
                ];

                wallConnectPositions.forEach((pos) => {
                  // Yatay ripler (arka duvara bağlantı)
                  const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                  const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                  const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                  
                  horizontalRip.position.set(
                    pos.x,
                    baseHeight,
                    (pos.z + zOffset - 1000) / 2
                  );
                  scene.add(horizontalRip);

                  // Duvara bağlantı için yan çevrilmiş model
                  const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                  wallConnector.scale.set(1.5, 1.5, 1.5);
                  wallConnector.rotation.z = Math.PI / 2;
                  wallConnector.rotation.y = Math.PI / 2;
                  wallConnector.position.set(pos.x, baseHeight, -1000);
                  scene.add(wallConnector);
                });
              }

              adjustedCornerPositions.forEach((pos) => {
                // Dikey connector ve ripler
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                verticalRip.scale.set(1, 1, 1);
                verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(verticalRip);

                // Yatay ripler (arka duvara bağlantı)
                const horizontalRipLength = Math.abs(pos.z + zOffset + 1000);
                const horizontalRipGeometry = new THREE.BoxGeometry(10, 10, horizontalRipLength);
                const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
                
                horizontalRip.position.set(
                  pos.x,
                  baseHeight,
                  (pos.z + zOffset - 1000) / 2
                );
                
                scene.add(horizontalRip);

                // Duvara bağlantı için yan çevrilmiş model
                const wallConnector = new THREE.Mesh(modelGeometry, materialGold);
                wallConnector.scale.set(1.5, 1.5, 1.5);
                // Modeli 90 derece yan çevir
                wallConnector.rotation.z = Math.PI / 2;
                // Duvara dönük olması için y ekseninde döndür
                wallConnector.rotation.y = Math.PI / 2;
                wallConnector.position.set(pos.x, baseHeight, -1000);
                scene.add(wallConnector);
              });
            }

            // Dikey ripleri tavana kadar uzat
            if (shelfQuantity > 0) {
              const lastShelfHeight = topShelfHeight - ((shelfQuantity - 1) * (shelfHeight + shelfSpacing));
              
              adjustedCornerPositions.forEach((pos) => {
                const extendedRipGeometry = new THREE.BoxGeometry(10, topShelfHeight - lastShelfHeight, 10);
                const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                
                extendedRip.position.set(
                  pos.x,
                  (topShelfHeight + lastShelfHeight) / 2,
                  pos.z + zOffset
                );
                
                scene.add(extendedRip);
              });
            }
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

          // Kamera pozisyonunu ayarla
          camera.position.set(0, 750, 1500);
          camera.lookAt(0, 750, -500);
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
      controls.dispose();
      renderer.dispose();
    };
  }, [modelUrl, shelfUrl, ripUrl, shelfQuantity, mountType, barCount]);

  return <div ref={mountRef}></div>;
};

export default ThreeDViewer;
