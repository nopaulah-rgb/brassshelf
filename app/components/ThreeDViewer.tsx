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
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  modelUrl,
  shelfUrl,
  ripUrl,
  shelfQuantity,
  mountType,
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

              // Rafları ve bağlantı parçalarını konumlandır
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

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

                // Rafları ve bağlantı parçalarını konumlandır
                const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
                shelfMesh.position.set(0, baseHeight, zOffset);
                scene.add(shelfMesh);

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
                
                adjustedCornerPositions.forEach((pos) => {
                  // Uzatılmış rip geometrisi oluştur
                  const extendedRipGeometry = new THREE.BoxGeometry(10, gapHeight, 10);
                  const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                  
                  // Ripi konumlandır (counter üstünden son rafa kadar)
                  extendedRip.position.set(
                    pos.x,
                    counterTop + (gapHeight / 2), // Counter üstünden başlat
                    pos.z + zOffset
                  );
                  
                  scene.add(extendedRip);
                });
              }
            } else {
              // 4 ve üzeri raf sayısı için counter'a kadar olan mesafeyi hesapla
              const counterHeight = 400;
              const availableSpace = topShelfHeight - counterHeight;
              const adjustedSpacing = (availableSpace - (shelfQuantity * shelfHeight)) / (shelfQuantity - 1);
              
              for (let i = 0; i < shelfQuantity; i++) {
                baseHeight = topShelfHeight - (i * (shelfHeight + adjustedSpacing));

                // Rafları ve bağlantı parçalarını konumlandır
                const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
                shelfMesh.position.set(0, baseHeight, zOffset);
                scene.add(shelfMesh);

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
            // Tavandan zemine kadar
            const topShelfHeight = 1195;
            const shelfSpacing = 250; // Normal raf aralığı
            
            // Önce normal aralıklarla rafları yerleştir
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Rafları ve bağlantı parçalarını konumlandır
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

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

            // En alttaki rafın yüksekliğini hesapla
            const lastShelfHeight = topShelfHeight - ((shelfQuantity - 1) * (shelfHeight + shelfSpacing));
            
            // Zemine uzanan ripler ekle
            adjustedCornerPositions.forEach((pos) => {
              // Rip yüksekliğini hesapla
              const ripHeight = lastShelfHeight;
              
              // Uzatılmış rip geometrisi oluştur
              const extendedRipGeometry = new THREE.BoxGeometry(10, ripHeight, 10);
              const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
              
              // Ripi konumlandır (zeminden başlayıp son rafa kadar)
              extendedRip.position.set(
                pos.x,
                ripHeight / 2, // Merkez noktasından yerleştirdiği için yarı yükseklik
                pos.z + zOffset
              );
              
              scene.add(extendedRip);
            });
          } else if (mountType === 'ceiling to wall') {
            // Tavandan başla, normal aralıklarla yerleştir
            const topShelfHeight = 1195;
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Rafları ve bağlantı parçalarını konumlandır
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

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
            // Wall mount gibi başla ama zeminden boşluk kalırsa ripler uzasın
            const topShelfHeight = 1195;
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Rafları yerleştir
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

              adjustedCornerPositions.forEach((pos) => {
                // Ön taraftaki connector ve ripler
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                // İlk raf hariç dikey ripleri ekle
                if (i !== 0) {
                  const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                  verticalRip.scale.set(1, 1, 1);
                  verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(verticalRip);
                }

                // Duvara bağlantı için yatay ripler
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

                // Dikey destek ripleri (duvardan rafa)
                const supportRipGeometry = new THREE.BoxGeometry(10, 80, 10);
                const supportRip = new THREE.Mesh(supportRipGeometry, materialGold);
                supportRip.rotation.x = Math.PI / 2;
                supportRip.position.set(
                  pos.x,
                  baseHeight - 5,
                  pos.z + zOffset - 40
                );
                scene.add(supportRip);
              });
            }

            // En alttaki raftan zemine kadar olan boşluğu hesapla
            const lastShelfHeight = topShelfHeight - ((shelfQuantity - 1) * (shelfHeight + shelfSpacing));
            
            if (lastShelfHeight > 0) {
              // Zemine uzanan ripler ekle
              adjustedCornerPositions.forEach((pos) => {
                // Uzatılmış rip geometrisi oluştur
                const extendedRipGeometry = new THREE.BoxGeometry(10, lastShelfHeight, 10);
                const extendedRip = new THREE.Mesh(extendedRipGeometry, materialGold);
                
                // Ripi konumlandır (zeminden başlayıp son rafa kadar)
                extendedRip.position.set(
                  pos.x,
                  lastShelfHeight / 2, // Merkez noktasından yerleştirdiği için yarı yükseklik
                  pos.z + zOffset
                );
                
                scene.add(extendedRip);
              });
            }
          } else if (mountType === 'wall to counter') {
            // Wall mount gibi başla ve counter ekle
            const topShelfHeight = 1195;
            
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

            // Rafları yerleştir
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Rafları yerleştir
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

              adjustedCornerPositions.forEach((pos) => {
                // Connector ve ripler
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                // İlk raf hariç dikey ripleri ekle
                if (i !== 0) {
                  const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                  verticalRip.scale.set(1, 1, 1);
                  verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(verticalRip);
                }

                // Duvara bağlantı için yatay ripler
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

            // En alttaki raf ile counter arasındaki boşluğu hesapla
            const lastShelfHeight = topShelfHeight - ((shelfQuantity - 1) * (shelfHeight + shelfSpacing));
            const counterTop = 400; // Counter yüksekliği

            if (lastShelfHeight > counterTop) {
              // Counter'a uzanan ripler ekle
              adjustedCornerPositions.forEach((pos) => {
                const gapHeight = lastShelfHeight - counterTop;
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
          } else if (mountType === 'wall') {
            // Sadece duvara bağlantılı yerleştirme
            const topShelfHeight = 1195;
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = topShelfHeight - (i * (shelfHeight + shelfSpacing));

              // Rafları yerleştir
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

              adjustedCornerPositions.forEach((pos) => {
                // Connector'ları ekle
                const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
                connectorMesh.scale.set(1.5, 1.5, 1.5);
                connectorMesh.position.set(pos.x, baseHeight, pos.z + zOffset);
                scene.add(connectorMesh);

                // Dikey ripler (ilk raf hariç)
                if (i !== 0) {
                  const verticalRip = new THREE.Mesh(ripGeometry, materialGold);
                  verticalRip.scale.set(1, 1, 1);
                  verticalRip.position.set(pos.x, baseHeight, pos.z + zOffset);
                  scene.add(verticalRip);
                }

                // Duvara bağlantı için yatay ripler
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

                // Duvardan rafa uzanan destek ripleri
                const supportRipGeometry = new THREE.BoxGeometry(10, 80, 10);
                const supportRip = new THREE.Mesh(supportRipGeometry, materialGold);
                supportRip.rotation.x = Math.PI / 2;
                supportRip.position.set(
                  pos.x,
                  baseHeight - 5,
                  pos.z + zOffset - 40
                );
                scene.add(supportRip);
              });
            }
          } else {
            // Zeminden yukarıya doğru
            const bottomShelfHeight = 300;
            
            for (let i = 0; i < shelfQuantity; i++) {
              baseHeight = bottomShelfHeight + (i * (shelfHeight + shelfSpacing));

              // Rafları ve bağlantı parçalarını konumlandır
              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight, zOffset);
              scene.add(shelfMesh);

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
  }, [modelUrl, shelfUrl, ripUrl, shelfQuantity, mountType]);

  return <div ref={mountRef}></div>;
};

export default ThreeDViewer;
