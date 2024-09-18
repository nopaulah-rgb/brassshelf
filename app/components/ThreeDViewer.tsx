import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const ThreeDViewer: React.FC<{ modelUrl: string; shelfUrl: string; ripUrl: string; shelfQuantity: number }> = ({ modelUrl, shelfUrl, ripUrl, shelfQuantity }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    mountRef.current?.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 3000;

    const loader = new STLLoader();

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
            roughness: 3,
          });

          const shelfBoundingBox = new THREE.Box3().setFromObject(new THREE.Mesh(shelfGeometry));
          const shelfHeight = shelfBoundingBox.max.y - shelfBoundingBox.min.y;

          const adjustedCornerPositions = [
            { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.min.z + 5 },
            { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.min.z + 5 },
            { x: shelfBoundingBox.min.x + 5, z: shelfBoundingBox.max.z - 5 },
            { x: shelfBoundingBox.max.x - 5, z: shelfBoundingBox.max.z - 5 },
          ];

          for (let i = 0; i < shelfQuantity; i++) {
            const baseHeight = i * (shelfHeight + 300);

            adjustedCornerPositions.forEach((pos) => {
              const connectorMesh = new THREE.Mesh(modelGeometry, materialGold);
              connectorMesh.scale.set(15 / 10, 15 / 10, 15 / 10);
              connectorMesh.position.set(pos.x, baseHeight, pos.z);
              scene.add(connectorMesh);

              const ripMesh = new THREE.Mesh(ripGeometry, materialGold);
              ripMesh.scale.set(10 / 10, 150 / 150, 10 / 10);
              ripMesh.position.set(pos.x, baseHeight , pos.z);
              scene.add(ripMesh);

              const shelfMesh = new THREE.Mesh(shelfGeometry, materialShelf);
              shelfMesh.position.set(0, baseHeight , 0);
              scene.add(shelfMesh);
            });
          }

          // Calculate the center of the shelf geometry
          const shelfCenter = new THREE.Vector3();
          shelfBoundingBox.getCenter(shelfCenter);

          // Adjust the camera's target to the center of the model
          controls.target.set(shelfCenter.x, shelfCenter.y, shelfCenter.z);
          controls.update();
        });
      });
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    camera.position.set(0, 200, 2000);

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, [modelUrl, shelfUrl, ripUrl, shelfQuantity]);

  return <div ref={mountRef}></div>;
};

export default ThreeDViewer;
