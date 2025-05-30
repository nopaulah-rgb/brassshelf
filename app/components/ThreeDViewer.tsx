import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import {
  handleCeilingMount,
  handleWallToCounterMount,
  handleWallToFloorMount,
  handleWallMount,
  handleCeilingToWallMount,
  handleCeilingToFloorMount,
  handleCeilingToCounterMount,
  handleCeilingToCounterToWallMount,
  handleCeilingFloorWallMount,
} from "./three/MountTypes";

interface ThreeDViewerProps {
  shelfUrl: string;
  ripUrl: string;
  shelfQuantity: number;
  mountType: string;
  barCount: number;
  showCrossbars: boolean;
  userHeight?: number;
  useTopShelf?: boolean;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  shelfUrl,
  ripUrl,
  shelfQuantity,
  mountType,
  barCount,
  showCrossbars,
  userHeight,
  useTopShelf = false,
}): JSX.Element => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Scroll event handler for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollSpeed = 0.5; // Adjust this value to control parallax speed (0.5 means half speed)
      setScrollOffset(scrollY * scrollSpeed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous content
    mountRef.current.innerHTML = "";

    // Get container dimensions
    const container = mountRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || window.innerHeight * 0.6;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup with container aspect ratio
    const camera = new THREE.PerspectiveCamera(
      35,
      containerWidth / containerHeight,
      0.1,
      10000
    );

    // Calculate dynamic room dimensions based on userHeight
    const heightInInches = userHeight ? userHeight / 25.4 : 47; // Convert mm to inches, default 47"
    
    // Base room dimensions
    let roomWidth = 2000;
    let roomDepth = 1200;
    let roomHeight = 1500;
    
    // Adjust room size for taller shelf systems
    if (heightInInches > 60) {
      const scaleFactor = Math.max(1.2, heightInInches / 50);
      roomWidth = Math.max(2000, roomWidth * scaleFactor);
      roomDepth = Math.max(1200, roomDepth * scaleFactor);
      roomHeight = Math.max(1500, userHeight! + 300); // Add 300mm clearance above top shelf
    }

    // Room geometry setup with dynamic dimensions
    const roomGeometry = {
      floor: new THREE.PlaneGeometry(roomWidth, roomDepth),
      backWall: new THREE.PlaneGeometry(roomWidth, roomHeight),
      ceiling: new THREE.PlaneGeometry(roomWidth, roomDepth),
      counter: new THREE.BoxGeometry(roomWidth, 400, 800),
      cabinetDoor: new THREE.PlaneGeometry(495, 380),
    };

    // Room materials setup
    const whiteRoomMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      roughness: 0.1,
      metalness: 0.0,
      envMapIntensity: 1.0,
    });

    // Create gradient texture for walls
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 1024;
    canvas.height = 1024;

    const gradient = context!.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ffd6ff");
    gradient.addColorStop(0.5, "#e7c6ff");
    gradient.addColorStop(1, "#c8b6ff");

    context!.fillStyle = gradient;
    context!.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise pattern
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

    // Wall material with texture
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.1,
      envMapIntensity: 0.8,
    });

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(500, 1000, 500);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Add room elements with dynamic positioning
    const floor = new THREE.Mesh(roomGeometry.floor, whiteRoomMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -roomDepth / 2);
    scene.add(floor);

    const backWall = new THREE.Mesh(roomGeometry.backWall, wallMaterial);
    backWall.position.set(0, roomHeight / 2, -roomDepth);
    scene.add(backWall);

    const ceiling = new THREE.Mesh(roomGeometry.ceiling, whiteRoomMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, roomHeight, -roomDepth / 2);
    scene.add(ceiling);

    // Adjust wall lights for dynamic room size
    const wallLight1 = new THREE.SpotLight(0xffd6ff, 0.3);
    wallLight1.position.set(-roomWidth / 2, roomHeight, -roomDepth * 0.75);
    wallLight1.target.position.set(0, roomHeight / 2, -roomDepth);
    wallLight1.angle = Math.PI / 3;
    wallLight1.penumbra = 1;
    scene.add(wallLight1);
    scene.add(wallLight1.target);

    const wallLight2 = new THREE.SpotLight(0xc8b6ff, 0.3);
    wallLight2.position.set(roomWidth / 2, roomHeight, -roomDepth * 0.75);
    wallLight2.target.position.set(0, roomHeight / 2, -roomDepth);
    wallLight2.angle = Math.PI / 3;
    wallLight2.penumbra = 1;
    scene.add(wallLight2);
    scene.add(wallLight2.target);

    // Set initial camera position based on room size
    const cameraDistance = Math.max(3500, roomWidth * 1.5);
    const baseCameraY = roomHeight * 0.6;
    camera.position.set(cameraDistance, baseCameraY, cameraDistance * 0.7);
    camera.lookAt(0, roomHeight * 0.4, -roomDepth * 0.4);

    // Renderer setup with container size
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0xf5f5f5);
    container.appendChild(renderer.domElement);

    // Setup OrbitControls with dynamic settings
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = Math.max(800, roomWidth * 0.4);  // Minimum zoom distance
    controls.maxDistance = Math.max(8000, roomWidth * 4); // Maximum zoom distance
    controls.maxPolarAngle = Math.PI / 1.5;  // Allow rotation down to about 120 degrees
    controls.minPolarAngle = Math.PI / 3;    // Allow rotation up to about 60 degrees
    controls.maxAzimuthAngle = Math.PI / 4;  // Limit right rotation to 45 degrees
    controls.minAzimuthAngle = -Math.PI / 4; // Limit left rotation to -45 degrees
    controls.enableZoom = true;  // Enable zooming
    controls.enablePan = false;   // Disable panning
    controls.target.set(0, roomHeight * 0.4, -roomDepth * 0.4);

    // Update camera position based on scroll
    const updateCameraWithScroll = () => {
      const scrollEffect = scrollOffset * 0.2; // Adjust multiplier for scroll sensitivity
      camera.position.y = baseCameraY + scrollEffect;
      camera.lookAt(0, roomHeight * 0.4 + scrollEffect * 0.5, -roomDepth * 0.4);
      controls.target.set(0, roomHeight * 0.4 + scrollEffect * 0.5, -roomDepth * 0.4);
      controls.update();
    };

    // Handle window resize
    const handleResize = () => {
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight || window.innerHeight * 0.6;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      const isMobile = window.innerWidth < 768;
      const mobileCameraDistance = Math.max(4000, roomWidth * 2);
      const desktopCameraDistance = Math.max(3500, roomWidth * 1.5);
      
      camera.position.set(
        isMobile ? mobileCameraDistance : desktopCameraDistance,
        isMobile ? roomHeight * 0.8 : roomHeight * 0.6,
        isMobile ? mobileCameraDistance * 0.75 : desktopCameraDistance * 0.7
      );
      camera.lookAt(0, roomHeight * 0.4, -roomDepth * 0.4);
      controls.update();
    };

    window.addEventListener("resize", handleResize);

    // Load models and handle mount type
    const loader = new STLLoader();

    // Load all models using Promise.all
    Promise.all([
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load(
          "/models/model1.stl",
          (geometry) => {
      geometry.rotateX(-Math.PI / 2);
      geometry.rotateY(Math.PI / 2);
            resolve(geometry);
          },
          undefined,
          reject
        );
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load(
          "/models/model2.stl",
          (geometry) => {
      geometry.rotateX(-Math.PI / 2);
      geometry.rotateY(Math.PI / 2);
            resolve(geometry);
          },
          undefined,
          reject
        );
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load("/models/model11.stl", resolve, undefined, reject);
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load("/models/model12.stl", resolve, undefined, reject);
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load(shelfUrl, resolve, undefined, reject);
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        loader.load(ripUrl, resolve, undefined, reject);
      }),
    ])
      .then(([model1Geometry, model2Geometry, model11Geometry, model12Geometry, shelfGeometry, ripGeometry]) => {
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

        const shelfBoundingBox = new THREE.Box3().setFromObject(
          new THREE.Mesh(shelfGeometry)
        );

        // Helper functions for rips
        const addHorizontalConnectingRips = (
          baseHeight: number,
          positions: { x: number; z: number }[]
        ) => {
          if (!showCrossbars) return;
          for (let i = 0; i < positions.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];
            const length = Math.abs(end.x - start.x);
            const horizontalRipGeometry = new THREE.BoxGeometry(length, 10, 10);
            const horizontalRip = new THREE.Mesh(horizontalRipGeometry, materialGold);
            const zOffset = -950 + (shelfBoundingBox.max.z - shelfBoundingBox.min.z) / 2 + 200;
            horizontalRip.position.set(
              (start.x + end.x) / 2,
              baseHeight,
              start.z + zOffset
            );
            scene.add(horizontalRip);
          }
        };

        const addFrontToBackRips = (
          baseHeight: number,
          positions: { x: number; z: number }[]
        ) => {
          const frontPoints = positions.filter(
            (pos) => pos.z === shelfBoundingBox.min.z + 5
          );
          const backPoints = positions.filter(
            (pos) => pos.z === shelfBoundingBox.max.z - 5
          );
          frontPoints.forEach((frontPoint) => {
            const backPoint = backPoints.find((bp) => bp.x === frontPoint.x);
            if (backPoint) {
              const length = Math.abs(backPoint.z - frontPoint.z);
              const sideRipGeometry = new THREE.BoxGeometry(10, 10, length);
              const sideRip = new THREE.Mesh(sideRipGeometry, materialGold);
              const zOffset = -950 + (shelfBoundingBox.max.z - shelfBoundingBox.min.z) / 2 + 200;
              sideRip.position.set(
                frontPoint.x,
                baseHeight,
                frontPoint.z + length / 2 + zOffset
              );
              scene.add(sideRip);
            }
          });
        };

        const mountTypeProps = {
          scene,
          shelfQuantity,
          barCount,
          showCrossbars,
          userHeight,
          useTopShelf,
          roomGeometry,
          whiteRoomMaterial,
          shelfGeometry,
          shelfMaterial: materialShelf,
          ripGeometry,
          zOffset: -950 + (shelfBoundingBox.max.z - shelfBoundingBox.min.z) / 2 + 200,
          shelfWidth: shelfBoundingBox.max.x - shelfBoundingBox.min.x,
          shelfBoundingBox,
          model1Geometry,
          model2Geometry,
          model11Geometry,
          model12Geometry,
          materialGold,
          addHorizontalConnectingRips,
          addFrontToBackRips,
        };

        // Handle different mount types
        switch (mountType) {
          case "ceiling":
            handleCeilingMount(mountTypeProps);
            break;
          case "wall to counter":
            handleWallToCounterMount(mountTypeProps);
            break;
          case "wall to floor":
            handleWallToFloorMount(mountTypeProps);
            break;
          case "wall":
            handleWallMount(mountTypeProps);
            break;
          case "ceiling to wall":
            handleCeilingToWallMount(mountTypeProps);
            break;
          case "ceiling to floor":
            handleCeilingToFloorMount(mountTypeProps);
            break;
          case "ceiling to counter":
            handleCeilingToCounterMount(mountTypeProps);
            break;
          case "ceiling to counter to wall":
            handleCeilingToCounterToWallMount(mountTypeProps);
            break;
          case "ceiling to floor to wall":
            handleCeilingFloorWallMount(mountTypeProps);
            break;
        }

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          updateCameraWithScroll(); // Update camera based on scroll
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
      })
      .catch((error) => {
        console.error("Error loading models:", error);
      });

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [shelfUrl, ripUrl, shelfQuantity, mountType, barCount, showCrossbars, userHeight, useTopShelf]);

  return <div ref={mountRef} style={{ 
    width: "100%", 
    height: "600px",
    maxHeight: "calc(100vh - 100px)" // Responsive height that adjusts to viewport
  }} />;
};

export default ThreeDViewer;
