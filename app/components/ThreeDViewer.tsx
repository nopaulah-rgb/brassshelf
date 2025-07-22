import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


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
  userWidth?: number;
  shelfDepth?: number;
  useTopShelf?: boolean;
  pipeDiameter?: string;
  frontBars?: boolean;
  verticalBarsAtBack?: boolean;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  shelfUrl,
  ripUrl,
  shelfQuantity,
  mountType,
  barCount,
  showCrossbars,
  userHeight,
  userWidth,
  shelfDepth,
  useTopShelf = false,
  pipeDiameter = '5/8',
  frontBars = false,
  verticalBarsAtBack = true,
}): JSX.Element => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  console.log('ThreeDViewer props:', {
    shelfUrl,
    ripUrl,
    shelfQuantity,
    mountType,
    barCount,
    showCrossbars,
    userHeight,
    userWidth,
    shelfDepth,
    useTopShelf,
    pipeDiameter,
    frontBars,
    verticalBarsAtBack
  });

  useEffect(() => {
    if (!mountRef.current) {
      console.error('Mount ref is null');
      return;
    }

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
    
    // Adjust room width dynamically based on barCount for all mount types
    if (barCount > 1) {
      // Each additional shelf needs more width - increase the multiplier for more space
      const additionalWidth = (barCount - 1) * 950; // Increased from 600mm to 800mm per additional shelf
      roomWidth = Math.max(2000, roomWidth + additionalWidth);
    }
    
    // Adjust room size for taller shelf systems
    if (heightInInches > 60) {
      const scaleFactor = Math.max(1.2, heightInInches / 50);
      roomWidth = Math.max(roomWidth, roomWidth * scaleFactor); // Use the already adjusted width
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

    // Setup lighting - Güçlü ışıklandırma GLB modeller için
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Artırdım
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2); // Artırdım
    mainLight.position.set(500, 1000, 500);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Ek ışık kaynaklarını ekle
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 800, 1000);
    scene.add(frontLight);

    const sideLight = new THREE.DirectionalLight(0xffffff, 0.6);
    sideLight.position.set(-800, 600, 0);
    scene.add(sideLight);

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

    // Set initial camera position for perfect centering
    // Adjust distance based on shelf quantity and bay count for optimal framing
    const shelfHeightFactor = (userHeight || 1194) / 1000; // Height scaling factor
    const shelfQuantityFactor = Math.max(1, shelfQuantity / 3); // More shelves = further back
    const bayCountFactor = Math.max(1, barCount / 2); // More bays = further back
    
    const baseCameraDistance = 1000 * shelfHeightFactor * shelfQuantityFactor * bayCountFactor;
    const cameraDistance = Math.max(1200, Math.min(baseCameraDistance, 2500));
    
    // Position camera for optimal centered view
    const cameraX = cameraDistance * 0.7; // Slightly to the right for 3/4 view
    const cameraY = (userHeight || 1194) * 0.8; // Above the shelf system center
    const cameraZ = cameraDistance * 0.7; // Forward position for good perspective
    
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Calculate perfect center based on actual shelf dimensions and quantity
    const shelfSystemCenterX = 0; // Shelves are centered at x=0
    const shelfSystemCenterY = (userHeight || 1194) / 2; // Half of actual shelf height
    const shelfSystemCenterZ = -roomDepth * 0.3; // Optimal depth for viewing
    
    camera.lookAt(shelfSystemCenterX, shelfSystemCenterY, shelfSystemCenterZ);

    // Renderer setup with container size
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // For export functionality
    });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Better quality on high DPI
    renderer.setClearColor(0xf5f5f5, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Make sure canvas fills the container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    
    container.appendChild(renderer.domElement);

    // Setup OrbitControls with dynamic settings optimized for multiple bays
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // Reasonable zoom limits for better usability
    controls.minDistance = 200;
    controls.maxDistance = 5000;
    // Angle restrictions for better viewing
    controls.maxPolarAngle = Math.PI * 0.9; // Slight restriction for better angles
    controls.minPolarAngle = 0.1;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.autoRotate = false;
    // Center target on the shelf system - same as camera lookAt
    controls.target.set(shelfSystemCenterX, shelfSystemCenterY, shelfSystemCenterZ);
    controls.update();

    // Remove scroll-based camera updates - 3D viewer now has independent controls

    // Handle window resize
    const handleResize = () => {
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight || 400;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Ensure canvas still fills container after resize
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      const isMobile = window.innerWidth < 768;
      
      // Recalculate optimal camera position for centered view after resize
      const currentShelfHeightFactor = (userHeight || 1194) / 1000;
      const currentShelfQuantityFactor = Math.max(1, shelfQuantity / 3);
      const currentBayCountFactor = Math.max(1, barCount / 2);
      
      // Redefine center points for resize
      const shelfSystemCenterX = 0;
      const shelfSystemCenterY = (userHeight || 1194) / 2;
      const shelfSystemCenterZ = -roomDepth * 0.3;
      
      const responsiveDistance = isMobile ? 
        1200 * currentShelfHeightFactor * currentShelfQuantityFactor * currentBayCountFactor :
        1000 * currentShelfHeightFactor * currentShelfQuantityFactor * currentBayCountFactor;
      
      const finalDistance = Math.max(1200, Math.min(responsiveDistance, isMobile ? 3000 : 2500));
      
      // Update camera position maintaining centered view
      camera.position.set(
        finalDistance * 0.7, // X position for 3/4 view
        (userHeight || 1194) * 0.8, // Y position above center
        finalDistance * 0.7 // Z position for perspective
      );
      
      // Maintain centered target
      camera.lookAt(shelfSystemCenterX, shelfSystemCenterY, shelfSystemCenterZ);
      controls.target.set(shelfSystemCenterX, shelfSystemCenterY, shelfSystemCenterZ);
      controls.update();
    };

    window.addEventListener("resize", handleResize);

    // Load models and handle mount type
    const stlLoader = new STLLoader();
    const gltfLoader = new GLTFLoader();

    // Load all models using Promise.all
    Promise.all([
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        stlLoader.load(
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
        stlLoader.load(
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
        stlLoader.load("/models/model11.stl", resolve, undefined, reject);
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        stlLoader.load("/models/model12.stl", resolve, undefined, reject);
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        // Check if shelfUrl is GLB file
        if (shelfUrl.endsWith('.glb') || shelfUrl.endsWith('.gltf')) {
          gltfLoader.load(
            shelfUrl,
            (gltf) => {
              // Extract geometry from the first mesh in the GLB file
              const mesh = gltf.scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
              if (mesh && mesh.geometry) {

                
                // Apply rotations to make the shelf horizontal like the old STL models
                const geometry = mesh.geometry.clone();
                geometry.rotateX(-Math.PI / 2);
                geometry.rotateY(Math.PI); // 90 derece daha sağa çevirmek için PI kullanıyoruz
                resolve(geometry);
              } else {
                reject(new Error('No mesh geometry found in GLB file'));
              }
            },
            undefined,
            reject
          );
        } else {
          stlLoader.load(shelfUrl, resolve, undefined, reject);
        }
      }),
      new Promise<THREE.BufferGeometry>((resolve, reject) => {
        // Rod v2.glb modelini yükle
        gltfLoader.load(
          "/models/Rod v2.glb",
          (gltf) => {
            // Extract geometry from the first mesh in the GLB file
            const mesh = gltf.scene.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
            if (mesh && mesh.geometry) {
              const geometry = mesh.geometry.clone();
              // Rod modelini doğru yönde konumlandır
              geometry.rotateX(-Math.PI / 2);
              resolve(geometry);
            } else {
              reject(new Error('No mesh geometry found in Rod GLB file'));
            }
          },
          undefined,
          reject
        );
      }),
    ])
      .then(([model1Geometry, model2Geometry, model11Geometry, model12Geometry, shelfGeometry, ripGeometry]) => {
        // Gerçekçi cam malzemesi oluştur
        const materialShelf = new THREE.MeshPhysicalMaterial({
          color: 0xccddff, // Daha mavi cam rengi
          metalness: 0.0,
          roughness: 0.0,
          transparent: true,
          opacity: 0.2,
          transmission: 1.0, // Tam geçirgenlik
          thickness: 0.5,
          ior: 1.5, // Cam kırılma indeksi
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          side: THREE.DoubleSide,
        });

        // Metal material - always polished brass
        let metalColor = 0xf7ef8a; // Brass
        let metalRoughness = 0.2; // Polished
        let metalMetalness = 0.8; // Polished
        
        const materialGold = new THREE.MeshStandardMaterial({
          color: metalColor,
          metalness: metalMetalness,
          roughness: metalRoughness,
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
          userWidth: userWidth || 914.4, // Default 36 inches in mm
          shelfDepth: shelfDepth || 304.8, // Default 12 inches in mm
          useTopShelf,
          roomGeometry,
          whiteRoomMaterial,
          shelfGeometry,
          shelfMaterial: materialShelf,
          ripGeometry,
          zOffset: -950 + (shelfBoundingBox.max.z - shelfBoundingBox.min.z) / 2  -220,
          shelfWidth: shelfBoundingBox.max.x - shelfBoundingBox.min.x,
          shelfBoundingBox,
          model1Geometry,
          model2Geometry,
          model11Geometry,
          model12Geometry,
          materialGold,
          addHorizontalConnectingRips,
          addFrontToBackRips,
          frontBars,
          verticalBarsAtBack,
          pipeDiameter,
        };

        // Handle different mount types
        const handleMountType = async () => {
          switch (mountType) {
            case "ceiling":
              await handleCeilingMount(mountTypeProps);
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
            case "ceiling & counter & wall":
              handleCeilingToCounterToWallMount(mountTypeProps);
              break;
            case "ceiling to floor to wall":
            case "ceiling & floor & wall":
              handleCeilingFloorWallMount(mountTypeProps);
              break;
          }
        };

        // Execute mount type handling and then start animation
        handleMountType().then(() => {
          // Animation loop
          const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
          };
          animate();
                 }).catch((error) => {
           console.error("Error handling mount type:", error);
         });
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
  }, [shelfUrl, ripUrl, shelfQuantity, mountType, barCount, showCrossbars, userHeight, userWidth, shelfDepth, useTopShelf, pipeDiameter, frontBars, verticalBarsAtBack]);

  return <div ref={mountRef} style={{ 
    width: "100%", 
    height: "100%",
    minHeight: "400px",
    overflow: "hidden"
  }} />;
};

export default ThreeDViewer;
