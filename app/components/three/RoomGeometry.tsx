import * as THREE from "three";

export interface RoomGeometryProps {
  scene: THREE.Scene;
}

export const createRoomGeometry = ({ scene }: RoomGeometryProps) => {
  // Room geometries
  const roomGeometry = {
    floor: new THREE.PlaneGeometry(200, 100),
    backWall: new THREE.PlaneGeometry(2000, 1500),
    ceiling: new THREE.PlaneGeometry(200, 100),
    counter: new THREE.BoxGeometry(2000, 400, 800),
    cabinetDoor: new THREE.PlaneGeometry(495, 380),
  };

  // Room materials
  const whiteRoomMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.0,
    envMapIntensity: 1.0,
  });

  // Create wall texture
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

  // Wall material
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallTexture,
    side: THREE.DoubleSide,
    roughness: 0.3,
    metalness: 0.1,
    envMapIntensity: 0.8,
  });

  // Add ambient occlusion
  const aoCanvas = document.createElement("canvas");
  const aoContext = aoCanvas.getContext("2d");
  aoCanvas.width = 1024;
  aoCanvas.height = 1024;

  const aoGradient = aoContext!.createRadialGradient(512, 512, 0, 512, 512, 512);
  aoGradient.addColorStop(0, "#ffffff");
  aoGradient.addColorStop(1, "#e0e0e0");

  aoContext!.fillStyle = aoGradient;
  aoContext!.fillRect(0, 0, aoCanvas.width, aoCanvas.height);

  const aoTexture = new THREE.CanvasTexture(aoCanvas);
  wallMaterial.aoMap = aoTexture;
  wallMaterial.aoMapIntensity = 0.5;

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
  mainLight.position.set(500, 1000, 500);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // Add wall spotlights
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

  // Create room meshes
  const floor = new THREE.Mesh(roomGeometry.floor, whiteRoomMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  scene.add(floor);

  const backWall = new THREE.Mesh(roomGeometry.backWall, wallMaterial);
  backWall.position.set(0, 750, -1000);
  scene.add(backWall);

  const ceiling = new THREE.Mesh(roomGeometry.ceiling, whiteRoomMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 1500, 0);
  scene.add(ceiling);

  return {
    roomGeometry,
    whiteRoomMaterial,
    wallMaterial,
  };
}; 