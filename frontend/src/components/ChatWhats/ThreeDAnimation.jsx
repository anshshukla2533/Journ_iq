import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.Fog(0xf8fafc, 20, 50);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0xf8fafc, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(8, 8, 8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 0.6);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 0.4);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create main group
    const group = new THREE.Group();
    scene.add(group);

    // Central sphere (Knowledge Core)
    const sphereGeometry = new THREE.IcosahedronGeometry(1.2, 5);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.2,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    group.add(sphere);

    // Main torus (Tech Ring 1)
    const torus1Geometry = new THREE.TorusGeometry(2.2, 0.25, 32, 128);
    const torus1Material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x1e40af,
      emissiveIntensity: 0.15,
    });
    const torus1 = new THREE.Mesh(torus1Geometry, torus1Material);
    torus1.rotation.x = 0.4;
    torus1.rotation.z = 0.2;
    torus1.castShadow = true;
    torus1.receiveShadow = true;
    group.add(torus1);

    // Secondary torus (Tech Ring 2)
    const torus2Geometry = new THREE.TorusGeometry(3.5, 0.15, 32, 128);
    const torus2Material = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.1,
    });
    const torus2 = new THREE.Mesh(torus2Geometry, torus2Material);
    torus2.rotation.y = 0.3;
    torus2.rotation.x = 0.6;
    torus2.castShadow = true;
    torus2.receiveShadow = true;
    group.add(torus2);

    // Octahedron shapes (Learning nodes)
    const nodes = [];
    for (let i = 0; i < 6; i++) {
      const octaGeometry = new THREE.OctahedronGeometry(0.4, 2);
      const colors = [0x6366f1, 0x3b82f6, 0x06b6d4, 0x8b5cf6, 0x0ea5e9, 0x7c3aed];
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: colors[i],
        metalness: 0.5,
        roughness: 0.3,
        emissive: colors[i],
        emissiveIntensity: 0.05,
      });
      const node = new THREE.Mesh(octaGeometry, nodeMaterial);

      const angle = (i / 6) * Math.PI * 2;
      const radius = 2.8;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius * 0.6;
      node.position.z = Math.sin(angle * 0.5) * 0.5;

      node.userData = { angle, radius, speed: 0.2 + Math.random() * 0.15 };
      node.castShadow = true;
      node.receiveShadow = true;
      nodes.push(node);
      group.add(node);
    }

    // Advanced particles - Knowledge flow
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positionArray = new Float32Array(particleCount * 3);
    const velocityArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positionArray[i] = (Math.random() - 0.5) * 12;
      positionArray[i + 1] = (Math.random() - 0.5) * 12;
      positionArray[i + 2] = (Math.random() - 0.5) * 12;

      velocityArray[i] = (Math.random() - 0.5) * 0.02;
      velocityArray[i + 1] = (Math.random() - 0.5) * 0.02;
      velocityArray[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x6366f1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      fog: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame++;

      // Smooth rotation
      group.rotation.x += 0.0002;
      group.rotation.y += 0.0003;

      // Sphere rotation
      sphere.rotation.x += 0.0008;
      sphere.rotation.y += 0.0012;

      // Torus rotation
      torus1.rotation.x += 0.0012;
      torus1.rotation.y += 0.0008;

      torus2.rotation.x -= 0.0008;
      torus2.rotation.y -= 0.0012;

      // Animate nodes
      nodes.forEach((node) => {
        node.userData.angle += node.userData.speed * 0.01;
        const angle = node.userData.angle;
        const radius = node.userData.radius;
        node.position.x = Math.cos(angle) * radius;
        node.position.y = Math.sin(angle) * radius * 0.6;
        node.position.z = Math.sin(angle * 0.5) * 0.5;
        node.rotation.x += 0.015;
        node.rotation.y += 0.015;
      });

      // Animate particles with velocity
      const positions = particlesGeometry.attributes.position.array;
      const velocities = particlesGeometry.attributes.velocity.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Wrap around bounds
        if (Math.abs(positions[i]) > 6) positions[i] *= -1;
        if (Math.abs(positions[i + 1]) > 6) positions[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 6) positions[i + 2] *= -1;

        // Subtle gravity toward center
        const dist = Math.sqrt(positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2);
        if (dist > 6) {
          velocities[i] -= positions[i] * 0.001;
          velocities[i + 1] -= positions[i + 1] * 0.001;
          velocities[i + 2] -= positions[i + 2] * 0.001;
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
