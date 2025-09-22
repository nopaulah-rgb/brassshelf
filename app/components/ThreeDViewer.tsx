import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
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
  handleFreestandingMount,
} from "./three/MountTypes";

export interface ThreeDViewerHandle {
  captureViews: () => Promise<{ front: string; side: string; top: string }>;
}

interface ThreeDViewerProps {
  shelfUrl: string;
  shelfQuantity: number;
  shelfSpacing?: number;
  shelfSpacings?: number[];
  mountType: string;
  barCount: number;
  baySpacing?: number;
  baySpacings?: number[];
  showCrossbars: boolean;
  userHeight?: number;
  userWidth?: number;
  shelfDepth?: number;
  useTopShelf?: boolean;
  pipeDiameter?: string;
  frontBars?: boolean;
  backBars?: boolean;
  verticalBarsAtBack?: boolean;
  wallConnectionPoint?: string[];
  selectedShelvesForBars?: number[];
  selectedBackShelvesForBars?: number[];
  backVertical?: boolean;
  price?: number;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onReset?: () => void;
  onAddToCart?: () => void;
}

const ThreeDViewer = forwardRef<ThreeDViewerHandle, ThreeDViewerProps>(({ 
  shelfUrl,
  shelfQuantity,
  shelfSpacing = 250,
  shelfSpacings = [250],
  mountType,
  barCount,
  baySpacing = 0,
  baySpacings = [],
  showCrossbars,
  userHeight,
  userWidth,
  shelfDepth,
  useTopShelf = false,
  pipeDiameter = '5/8',
  frontBars = false,
  backBars = false,
  verticalBarsAtBack = true,
  wallConnectionPoint = ['all'],
  selectedShelvesForBars = [],
  selectedBackShelvesForBars = [],
  backVertical = true,
  price = 2499,
  onSave,
  onLoad,
  onExport,
  onReset,
  onAddToCart,
}, ref): JSX.Element => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const ceilingMeshRef = useRef<THREE.Mesh | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const backWallMeshRef = useRef<THREE.Mesh | null>(null);
  
  console.log('ThreeDViewer props:', {
    shelfUrl,
    shelfQuantity,
    shelfSpacing,
    shelfSpacings,
    mountType,
    barCount,
    baySpacing,
    baySpacings,
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
    let isMounted = true;
    
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
    sceneRef.current = scene;
    
    // Camera setup with container aspect ratio
    const camera = new THREE.PerspectiveCamera(
      45, // FOV'u 35'ten 45'e çıkardık - daha geniş görüş açısı
      containerWidth / containerHeight,
      0.1,
      10000
    );
    cameraRef.current = camera;

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
    
    // Calculate dynamic room height based on shelf quantity and spacing
    const baseRoomHeight = 1500;
    const totalShelfSystemHeight = shelfQuantity * shelfSpacing;
    const heightExtension = Math.max(0, totalShelfSystemHeight - 500); // Extend if system is taller than 500mm
    roomHeight = baseRoomHeight + heightExtension;
    
    // Adjust room size for taller shelf systems (existing logic)
    if (heightInInches > 60) {
      const scaleFactor = Math.max(1.2, heightInInches / 50);
      roomWidth = Math.max(roomWidth, roomWidth * scaleFactor); // Use the already adjusted width
      roomDepth = Math.max(1200, roomDepth * scaleFactor);
      roomHeight = Math.max(roomHeight, userHeight! + 400); // Ensure enough space above shelves
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
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, "#f8f8f8");
    gradient.addColorStop(1, "#f0f0f0");

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

    // Balanced lighting setup for natural appearance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Reduced ambient for more natural look
    scene.add(ambientLight);

    // Main key light - softer intensity for natural illumination
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2); // Reduced intensity
    mainLight.position.set(800, 1200, 800); // Positioned for optimal brass illumination
    mainLight.castShadow = true;
    // Enhanced shadow settings for better quality
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 4000;
    mainLight.shadow.camera.left = -2000;
    mainLight.shadow.camera.right = 2000;
    mainLight.shadow.camera.top = 2000;
    mainLight.shadow.camera.bottom = -2000;
    scene.add(mainLight);

    // Front fill light - reduced for subtler glass illumination
    // const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // frontLight.position.set(0, 600, 1200); // Softer front lighting
    // scene.add(frontLight);

    // Side light for brass frame definition - reduced intensity
    // const sideLight = new THREE.DirectionalLight(0xffffff, 0.6);
    // sideLight.position.set(-1000, 800, 200); // Gentler brass highlights
    // scene.add(sideLight);
    
    // Subtle rim light for depth without overpowering
    // const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    // rimLight.position.set(-600, 600, -800); // Behind and to the side
    // scene.add(rimLight);
    
    // Enhanced front view lighting for realistic brass appearance
    // const frontBrassLight = new THREE.DirectionalLight(0xffffff, 1.2);
    // frontBrassLight.position.set(0, 600, 1000); // Stronger front-facing light
    // frontBrassLight.castShadow = false; // No shadow to avoid conflicts
    // scene.add(frontBrassLight);
    
    // const rightBrassLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // rightBrassLight.position.set(800, 500, 600); // Right side for brass definition
    // scene.add(rightBrassLight);
    
    // Add dramatic top-down light for front view brass highlights
    // const topFrontLight = new THREE.DirectionalLight(0xffffff, 0.9);
    // topFrontLight.position.set(0, 1200, 500); // Top-down angled toward front
    // scene.add(topFrontLight);
    
    // Add subtle left side light for balance
    // const leftBrassLight = new THREE.DirectionalLight(0xffffff, 0.6);
    // leftBrassLight.position.set(-600, 400, 600); // Left side illumination
    // scene.add(leftBrassLight);

    // Calculate dynamic floor position based on shelf system height
    const dynamicFloorY = -heightExtension; // Floor moves down as room extends
    
    // Create room elements but don't add them to scene (keep references for technical drawings)
    const floor = new THREE.Mesh(roomGeometry.floor, whiteRoomMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, dynamicFloorY, -roomDepth / 2);
    floor.visible = false; // Make floor invisible
    
    // Keep floor reference but don't add to scene for clean background
    if (mountType !== "ceiling to counter") {
      floorMeshRef.current = floor;
    } else {
      floorMeshRef.current = null;
    }

    const backWall = new THREE.Mesh(roomGeometry.backWall, wallMaterial);
    backWall.position.set(0, roomHeight / 2, -roomDepth);
    backWall.visible = false; // Make back wall invisible
    backWallMeshRef.current = backWall;

    const ceiling = new THREE.Mesh(roomGeometry.ceiling, whiteRoomMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, roomHeight, -roomDepth / 2);
    ceiling.visible = false; // Make ceiling invisible
    ceilingMeshRef.current = ceiling;

    // Remove wall lights since we don't have visible walls
    // Keep lighting focused on the shelving unit only

    // Set initial camera position using room-based logic for optimal room view
    // Calculate camera distance based on room dimensions to ensure entire room is visible
    const roomDiagonal = Math.sqrt(roomWidth * roomWidth + roomDepth * roomDepth + roomHeight * roomHeight);
    const shelfHeightFactor = (userHeight || 1194) / 1000;
    const shelfQuantityFactor = Math.max(1, shelfQuantity / 3);
    const bayCountFactor = Math.max(1, barCount / 2);
    const roomHeightFactor = roomHeight / 1500;
    
    // Use room diagonal as base for camera distance to ensure full room visibility
    const baseCameraDistance = roomDiagonal * 0.8 * shelfHeightFactor * shelfQuantityFactor * bayCountFactor * roomHeightFactor;
    const cameraDistance = Math.max(2000, Math.min(baseCameraDistance, 6000));
    
    // Position camera to show entire room
    const cameraX = 0; // Center on x-axis
    const cameraY = Math.max((userHeight || 1194) * 0.7, roomHeight * 0.5) + Math.abs(dynamicFloorY);
    const cameraZ = cameraDistance * 0.9; // Move camera further back to see more of the room
    
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Calculate room center for camera target
    const roomCenterX = 0;
    const roomCenterY = roomHeight / 2 + Math.abs(dynamicFloorY);
    const roomCenterZ = -roomDepth / 2; // Center of the room depth
    
    camera.lookAt(roomCenterX, roomCenterY, roomCenterZ);

    // Renderer setup with container size
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // For export functionality
    });
    rendererRef.current = renderer;
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Better quality on high DPI
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Make sure canvas fills the container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    
    container.appendChild(renderer.domElement);

    // Setup OrbitControls with dynamic settings optimized for multiple bays
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // Reasonable zoom limits for better usability
    controls.minDistance = 300;
    controls.maxDistance = 5000;
    // Angle restrictions - prevent vertical rotation but allow horizontal
    controls.maxPolarAngle = Math.PI / 2; // Lock vertical angle to prevent up/down rotation
    controls.minPolarAngle = Math.PI / 2; // Lock vertical angle to prevent up/down rotation
    controls.maxAzimuthAngle = Math.PI / 2; // Allow unlimited horizontal rotation
    controls.minAzimuthAngle = -Math.PI / 2; // Allow unlimited horizontal rotation
    controls.enableZoom = true;
    controls.enablePan = false; // Disable panning to prevent dragging
    controls.enableRotate = true; // Enable rotation (horizontal only due to polar angle restrictions)
    controls.autoRotate = false;
    // Center target on the room center - same as camera lookAt
    controls.target.set(roomCenterX, roomCenterY, roomCenterZ);
    controls.update();
    targetRef.current.set(roomCenterX, roomCenterY, roomCenterZ);

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
      
      // Recalculate room dimensions for resize (same logic as initial setup)
      let resizeRoomWidth = 2000;
      let resizeRoomDepth = 1200;
      let resizeRoomHeight = 1500;
      
      // Adjust room width dynamically based on barCount
      if (barCount > 1) {
        const additionalWidth = (barCount - 1) * 950;
        resizeRoomWidth = Math.max(2000, resizeRoomWidth + additionalWidth);
      }
      
      // Calculate dynamic room height based on shelf quantity and spacing
      const baseRoomHeight = 1500;
      const totalShelfSystemHeight = shelfQuantity * shelfSpacing;
      const heightExtension = Math.max(0, totalShelfSystemHeight - 500);
      resizeRoomHeight = baseRoomHeight + heightExtension;
      
      // Adjust room size for taller shelf systems
      const heightInInches = userHeight ? userHeight / 25.4 : 47;
      if (heightInInches > 60) {
        const scaleFactor = Math.max(1.2, heightInInches / 50);
        resizeRoomWidth = Math.max(resizeRoomWidth, resizeRoomWidth * scaleFactor);
        resizeRoomDepth = Math.max(1200, resizeRoomDepth * scaleFactor);
        resizeRoomHeight = Math.max(resizeRoomHeight, userHeight! + 400);
      }
      
      // Calculate dynamic floor position
      const resizeDynamicFloorY = -heightExtension;
      
      // Calculate camera distance using room-based logic
      const resizeRoomDiagonal = Math.sqrt(resizeRoomWidth * resizeRoomWidth + resizeRoomDepth * resizeRoomDepth + resizeRoomHeight * resizeRoomHeight);
      const currentShelfHeightFactor = (userHeight || 1194) / 1000;
      const currentShelfQuantityFactor = Math.max(1, shelfQuantity / 3);
      const currentBayCountFactor = Math.max(1, barCount / 2);
      const currentRoomHeightFactor = resizeRoomHeight / 1500;
      
      const resizeBaseCameraDistance = resizeRoomDiagonal * 0.8 * currentShelfHeightFactor * currentShelfQuantityFactor * currentBayCountFactor * currentRoomHeightFactor;
      const resizeCameraDistance = Math.max(2000, Math.min(resizeBaseCameraDistance, isMobile ? 5000 : 6000));
      
      // Position camera to show entire room
      const resizeCameraX = 0;
      const resizeCameraY = Math.max((userHeight || 1194) * 0.7, resizeRoomHeight * 0.5) + Math.abs(resizeDynamicFloorY);
      const resizeCameraZ = resizeCameraDistance * 0.9;
      
      // Update camera position
      camera.position.set(resizeCameraX, resizeCameraY, resizeCameraZ);
      
      // Calculate room center for camera target
      const resizeRoomCenterX = 0;
      const resizeRoomCenterY = resizeRoomHeight / 2 + Math.abs(resizeDynamicFloorY);
      const resizeRoomCenterZ = -resizeRoomDepth / 2;
      
      // Maintain room-centered target
      camera.lookAt(resizeRoomCenterX, resizeRoomCenterY, resizeRoomCenterZ);
      controls.target.set(resizeRoomCenterX, resizeRoomCenterY, resizeRoomCenterZ);
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
        // Natural glass material with subtle appearance
        const materialShelf = new THREE.MeshPhysicalMaterial({
          color: 0xf8f8f8, // Slightly off-white for more natural glass look
          metalness: 0.0,
          roughness: 0.1, // Slightly more roughness for softer appearance
          transparent: true,
          opacity: 0.4, // Reduced opacity for more subtle glass
          transmission: 0.8, // Higher transmission for more glass-like transparency
          thickness: 0.5, // Reduced thickness for lighter appearance
          ior: 1.52, // Standard glass refraction index
          clearcoat: 0.8, // Slightly reduced clearcoat
          clearcoatRoughness: 0.05, // Tiny bit of roughness on clearcoat
          side: THREE.DoubleSide,
          // Reduced environment map intensity for subtler reflections
          envMapIntensity: 0.6,
        });

        // Ultra-realistic brass material optimized for all viewing angles
        const metalColor = 0xCD7F32; // True brass color (bronze-gold)
        const metalRoughness = 0.05; // Very polished surface for maximum light interaction
        const metalMetalness = 0.98; // Nearly pure metallic properties
        
        const materialGold = new THREE.MeshPhysicalMaterial({
          color: metalColor,
          metalness: metalMetalness,
          roughness: metalRoughness,
          // Enhanced properties for realistic brass from all angles
          emissive: 0x442211, // Warmer emissive for authentic brass glow
          emissiveIntensity: 0.12, // Increased internal glow for front view
          envMapIntensity: 2.2, // Very strong environment reflections
          // Additional physical properties for realism
          clearcoat: 0.3, // Subtle clear coat for surface depth
          clearcoatRoughness: 0.1, // Slight roughness on clear coat
          reflectivity: 0.9, // High reflectivity for metallic shine
          // Add subtle surface variations for authentic metal look
          transparent: false,
          side: THREE.DoubleSide,
        });

        const shelfBoundingBox = new THREE.Box3().setFromObject(
          new THREE.Mesh(shelfGeometry)
        );
        
        // Scale shelf geometry based on user dimensions
        // Get original shelf dimensions
        const originalShelfWidth = shelfBoundingBox.max.x - shelfBoundingBox.min.x;
        const originalShelfDepth = shelfBoundingBox.max.z - shelfBoundingBox.min.z;
        
        // Default dimensions (based on original model)
        const defaultShelfWidth = 914.4; // 36 inches in mm
        const defaultShelfDepth = 304.8; // 12 inches in mm
        
        // Calculate scaling factors
        const widthScale = (userWidth || defaultShelfWidth) / originalShelfWidth;
        const depthScale = (shelfDepth || defaultShelfDepth) / originalShelfDepth;
        
        // Apply scaling to the shelf geometry
        shelfGeometry.scale(widthScale, 1, depthScale);
        
        // Center the shelf geometry on the x-axis
        const shelfCenter = new THREE.Vector3();
        shelfBoundingBox.getCenter(shelfCenter);
        shelfGeometry.translate(-shelfCenter.x, 0, 0);
        
        // Recalculate bounding box after scaling and centering
        shelfBoundingBox.setFromObject(new THREE.Mesh(shelfGeometry));

        // Helper functions for rips
        const addHorizontalConnectingRips = (
          baseHeight: number,
          positions: { x: number; z: number }[]
        ) => {
          if (!showCrossbars || !frontBars) return;
          
          // Calculate which shelf this height corresponds to
          // Calculate which shelf this height corresponds to
          const shelfIndex = Math.round((baseHeight - 100) / shelfSpacing);
          
          // Only add horizontal bars if this shelf is selected
          if (!selectedShelvesForBars.includes(shelfIndex)) return;
          
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

        // Calculate height-based scaling for system width
        // Taller systems should be proportionally wider for structural stability and aesthetics
        const calculateEffectiveWidth = (baseWidth: number, height: number): number => {
          // const defaultHeight = 1067; // 42 inches in mm (default height)
          const heightInInches = height / 25.4; // Convert mm to inches for calculation
          
          // Apply scaling factor based on height
          if (heightInInches <= 48) {
            // Small systems: no scaling needed
            return baseWidth;
          } else if (heightInInches <= 72) {
            // Medium systems: 10-20% wider
            const scaleFactor = 1 + (heightInInches - 48) * 0.008; // 0.8% per inch above 48"
            return baseWidth * scaleFactor;
          } else {
            // Large systems: 20-40% wider
            const mediumScale = 1.2; // 20% for 72" systems
            const additionalScale = (heightInInches - 72) * 0.01; // 1% per inch above 72"
            const scaleFactor = mediumScale + additionalScale;
            return baseWidth * Math.min(scaleFactor, 1.4); // Cap at 40% increase
          }
        };

        // Calculate effective width based on height scaling
        const baseUserWidth = userWidth || 914.4; // Default 36 inches in mm
        const effectiveUserWidth = calculateEffectiveWidth(baseUserWidth, userHeight || 1067);

        // Derive wall connection for freestanding based on mountType string
        const isFreestanding = mountType === 'freestanding' || mountType === 'freestanding to wall';
        const freestandingWall = mountType === 'freestanding to wall';

        const mountTypeProps = {
          scene,
          shelfQuantity,
          shelfSpacing,
          shelfSpacings,
          barCount,
          baySpacing,
          baySpacings,
          showCrossbars,
          userHeight,
          userWidth: effectiveUserWidth,
          shelfDepth: shelfDepth || 304.8, // Default 12 inches in mm
          useTopShelf,
          roomGeometry,
          whiteRoomMaterial,
          shelfGeometry,
          shelfMaterial: materialShelf,
          ripGeometry,
          zOffset: -950 + (shelfBoundingBox.max.z - shelfBoundingBox.min.z) / 2  -220,
          selectedShelvesForBars,
          selectedBackShelvesForBars,
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
          backBars,
          verticalBarsAtBack,
          pipeDiameter,
          roomDepth,
          roomHeight,
          dynamicFloorY,
          wallConnectionPoint: isFreestanding ? (freestandingWall ? ['all'] : []) : wallConnectionPoint,
          backVertical,
        };

        // Handle different mount types
        const handleMountType = async () => {
          console.log("Handling mount type:", mountType);
          console.log("Mount type props:", mountTypeProps);
          switch (mountType) {
            case "ceiling":
              console.log("Calling handleCeilingMount...");
              await handleCeilingMount(mountTypeProps);
              console.log("handleCeilingMount completed");
              break;
            case "freestanding":
              await handleFreestandingMount(mountTypeProps);
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
            case "freestanding to wall":
              await handleFreestandingMount(mountTypeProps);
              break;
          }
        };

        // Execute mount type handling and then start animation
        handleMountType().then(() => {
          if (!isMounted) return;
          
          // Camera is already positioned correctly above
          
          // Animation loop
          const animate = () => {
            if (!isMounted) return;
            animationIdRef.current = requestAnimationFrame(animate);
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
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      
      // Cancel animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      // Dispose of Three.js resources
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current = null;
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
        sceneRef.current = null;
      }
      
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
      
      cameraRef.current = null;
    };
  }, [shelfUrl, shelfQuantity, shelfSpacing, shelfSpacings, mountType, barCount, baySpacing, showCrossbars, userHeight, userWidth, shelfDepth, useTopShelf, pipeDiameter, frontBars, backBars, verticalBarsAtBack, wallConnectionPoint, selectedShelvesForBars, selectedBackShelvesForBars]);

  // Expose screenshot capture API
  useImperativeHandle(ref, () => ({
    captureViews: async () => {
      if (!cameraRef.current || !controlsRef.current || !rendererRef.current || !sceneRef.current) {
        return { front: "", side: "", top: "" };
      }

      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const renderer = rendererRef.current;
      const target = targetRef.current.clone();

      const originalPos = camera.position.clone();
      const originalTarget = controls.target.clone();
      const originalUp = camera.up.clone();

      const distance = originalPos.distanceTo(originalTarget);

      const renderAndGrab = () => {
        controls.update();
        renderer.render(sceneRef.current as THREE.Scene, camera);
        return renderer.domElement.toDataURL('image/png');
      };

      // Hide room elements for technical-style captures
      const prevVis = {
        ceiling: ceilingMeshRef.current?.visible,
        floor: floorMeshRef.current?.visible,
        backWall: backWallMeshRef.current?.visible,
      };
      if (ceilingMeshRef.current) ceilingMeshRef.current.visible = false;
      if (floorMeshRef.current) floorMeshRef.current.visible = false;
      if (backWallMeshRef.current) backWallMeshRef.current.visible = false;

      // FRONT/HOME
      camera.position.set(target.x, target.y + 50, Math.abs(distance));
      camera.lookAt(target);
      controls.target.copy(target);
      camera.up.set(0, 1, 0);
      const front = renderAndGrab();

      // SIDE (right side)
      camera.position.set(target.x + distance, target.y + 50, target.z);
      camera.lookAt(target);
      controls.target.copy(target);
      camera.up.set(0, 1, 0);
      const side = renderAndGrab();

      // TOP
      camera.position.set(target.x, target.y + distance, target.z);
      camera.lookAt(target);
      controls.target.copy(target);
      camera.up.set(0, 0, -1); // orient top view
      const top = renderAndGrab();

      // Restore room visibility
      if (typeof prevVis.ceiling === 'boolean' && ceilingMeshRef.current) ceilingMeshRef.current.visible = prevVis.ceiling;
      if (typeof prevVis.floor === 'boolean' && floorMeshRef.current) floorMeshRef.current.visible = prevVis.floor;
      if (typeof prevVis.backWall === 'boolean' && backWallMeshRef.current) backWallMeshRef.current.visible = prevVis.backWall;

      // Restore
      camera.up.copy(originalUp);
      camera.position.copy(originalPos);
      controls.target.copy(originalTarget);
      camera.lookAt(originalTarget);
      controls.update();

      return { front, side, top };
    }
  }));

  // Control functions for top-right icons
  const handleFitScreen = () => {
    if (cameraRef.current && controlsRef.current) {
      // Use the same room-based logic as initial view for consistency
      // Calculate dynamic room dimensions (same logic as initial setup)
      const heightInInches = userHeight ? userHeight / 25.4 : 47;
      
      // Base room dimensions
      let roomWidth = 2000;
      let roomDepth = 1200;
      let roomHeight = 1500;
      
      // Adjust room width dynamically based on barCount
      if (barCount > 1) {
        const additionalWidth = (barCount - 1) * 950;
        roomWidth = Math.max(2000, roomWidth + additionalWidth);
      }
      
      // Calculate dynamic room height based on shelf quantity and spacing
      const baseRoomHeight = 1500;
      const totalShelfSystemHeight = shelfQuantity * shelfSpacing;
      const heightExtension = Math.max(0, totalShelfSystemHeight - 500);
      roomHeight = baseRoomHeight + heightExtension;
      
      // Adjust room size for taller shelf systems
      if (heightInInches > 60) {
        const scaleFactor = Math.max(1.2, heightInInches / 50);
        roomWidth = Math.max(roomWidth, roomWidth * scaleFactor);
        roomDepth = Math.max(1200, roomDepth * scaleFactor);
        roomHeight = Math.max(roomHeight, userHeight! + 400);
      }
      
      // Calculate dynamic floor position
      const dynamicFloorY = -heightExtension;
      
      // Calculate camera distance based on room dimensions to ensure entire room is visible
      const roomDiagonal = Math.sqrt(roomWidth * roomWidth + roomDepth * roomDepth + roomHeight * roomHeight);
      const shelfHeightFactor = (userHeight || 1194) / 1000;
      const shelfQuantityFactor = Math.max(1, shelfQuantity / 3);
      const bayCountFactor = Math.max(1, barCount / 2);
      const roomHeightFactor = roomHeight / 1500;
      
      // Use room diagonal as base for camera distance to ensure full room visibility
      const baseCameraDistance = roomDiagonal * 0.8 * shelfHeightFactor * shelfQuantityFactor * bayCountFactor * roomHeightFactor;
      const cameraDistance = Math.max(2000, Math.min(baseCameraDistance, 6000));
      
      // Position camera to show entire room
      const cameraX = 0; // Center on x-axis
      const cameraY = Math.max((userHeight || 1194) * 0.7, roomHeight * 0.5) + Math.abs(dynamicFloorY);
      const cameraZ = cameraDistance * 0.9; // Move camera further back to see more of the room
      
      cameraRef.current.position.set(cameraX, cameraY, cameraZ);
      
      // Calculate room center for camera target
      const roomCenterX = 0;
      const roomCenterY = roomHeight / 2 + Math.abs(dynamicFloorY);
      const roomCenterZ = -roomDepth / 2; // Center of the room depth
      
      cameraRef.current.lookAt(roomCenterX, roomCenterY, roomCenterZ);
      controlsRef.current.target.set(roomCenterX, roomCenterY, roomCenterZ);
      controlsRef.current.update();
    }
  };

  const handleRotateLeft = () => {
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const angle = Math.PI / 8; // 22.5 degrees
      
      // Rotate around the target (Y axis)
      const offset = new THREE.Vector3();
      offset.copy(camera.position).sub(controls.target);
      
      // Apply rotation
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = offset.x;
      const z = offset.z;
      
      offset.x = x * cos + z * sin;
      offset.z = -x * sin + z * cos;
      
      camera.position.copy(controls.target).add(offset);
      camera.lookAt(controls.target);
      controls.update();
    }
  };

  const handleRotateRight = () => {
    if (cameraRef.current && controlsRef.current) {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      const angle = -Math.PI / 8; // -22.5 degrees
      
      // Rotate around the target (Y axis)
      const offset = new THREE.Vector3();
      offset.copy(camera.position).sub(controls.target);
      
      // Apply rotation
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = offset.x;
      const z = offset.z;
      
      offset.x = x * cos + z * sin;
      offset.z = -x * sin + z * cos;
      
      camera.position.copy(controls.target).add(offset);
      camera.lookAt(controls.target);
      controls.update();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "400px",
        overflow: "hidden"
      }} />
      
      {/* Top Right Control Icons - Matching Reference Design */}
      <div className="absolute right-4 top-4 z-10 flex items-center space-x-1 rounded-md border border-[var(--border-color)] bg-white/50 p-1 backdrop-blur-sm">
        <button 
          onClick={handleFitScreen}
          className="flex h-10 w-10 items-center justify-center rounded bg-white/70 text-[var(--text-primary)] transition-colors hover:bg-white"
        >
          <span className="material-symbols-outlined !text-xl">fit_screen</span>
        </button>
        <div className="h-6 w-px bg-[var(--border-color)]"></div>
        <button 
          onClick={handleRotateLeft}
          className="group flex h-10 w-10 items-center justify-center rounded text-[var(--text-primary)] transition-colors hover:bg-white/70"
        >
          <span className="material-symbols-outlined !text-2xl">rotate_left</span>
        </button>
        <button 
          onClick={handleRotateRight}
          className="group flex h-10 w-10 items-center justify-center rounded text-[var(--text-primary)] transition-colors hover:bg-white/70"
        >
          <span className="material-symbols-outlined !text-2xl">rotate_right</span>
        </button>
      </div>
      
      {/* Bottom Control Panel - Matching Reference Design */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-6">
        <div className="flex items-end justify-between gap-6">
          <div className="flex-grow">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <button
                onClick={onSave}
                className="btn border border-white/20 bg-white/10 !text-white backdrop-blur-md hover:bg-white/20"
              >
                <span className="material-symbols-outlined mr-2 !text-base">save</span> Save
              </button>
              <button
                onClick={onLoad}
                className="btn border border-white/20 bg-white/10 !text-white backdrop-blur-md hover:bg-white/20"
              >
                <span className="material-symbols-outlined mr-2 !text-base">folder_open</span> Load
              </button>
              <button
                onClick={onExport}
                className="btn border border-white/20 bg-white/10 !text-white backdrop-blur-md hover:bg-white/20"
              >
                <span className="material-symbols-outlined mr-2 !text-base">ios_share</span> Export
              </button>
              <button
                onClick={onReset}
                className="btn border border-white/20 bg-white/10 !text-white backdrop-blur-md hover:bg-white/20"
              >
                <span className="material-symbols-outlined mr-2 !text-base">restart_alt</span> Reset
              </button>
            </div>
          </div>
          <div className="w-full max-w-xs shrink-0 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md">
              <p className="text-base font-medium">Estimated Price:</p>
              <span className="text-xl font-bold text-white">${price}</span>
            </div>
            <button
              onClick={onAddToCart}
              className="btn btn-primary w-full"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
ThreeDViewer.displayName = 'ThreeDViewer';

export default ThreeDViewer;
