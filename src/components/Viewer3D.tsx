"use client";

import { useEffect, useRef } from "react";

type Props = {
  glbUrl: string;
  coloreCiondolo: "nero" | "bianco" | null;
  coloreDisegno: string | null;
  coloreOcchioSx: string | null;
  coloreOcchioDx: string | null;
  immagineOcchioSx?: string | null;
  immagineOcchioDx?: string | null;
  occhioSxPos?: { x: number; y: number; z: number } | null;
  occhioDxPos?: { x: number; y: number; z: number } | null;  
};

async function buildEyeMaterial(THREE: any, colore: string | null, immagine: string | null | undefined): Promise<any> {
  // 1. Se c'è immagine, prova a usarla come texture
  if (immagine) {
    try {
      const texture = await new Promise<any>((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(immagine, resolve, undefined, reject);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.05,
        metalness: 0.3,
        transparent: true,
      });
    } catch {
      // fallthrough a effetto cristallo
    }
  }

  // 2. Effetto cristallo/gemma con MeshPhysicalMaterial
  if (colore) {
    return new THREE.MeshPhysicalMaterial({
      color: colore,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
      ior: 2.4,
      reflectivity: 1,
      transparent: true,
      opacity: 0.92,
    });
  }

  // 3. Fallback colore piatto
  return new THREE.MeshStandardMaterial({
    color: "#aaddff",
    roughness: 0.05,
    metalness: 0.4,
  });
}

export default function Viewer3D({
  glbUrl,
  coloreCiondolo,
  coloreDisegno,
  coloreOcchioSx,
  coloreOcchioDx,
  immagineOcchioSx,
  immagineOcchioDx,
  occhioSxPos,
  occhioDxPos,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: any;
    eyeSx: any;
    eyeDx: any;
    corpeMat: any;
    disegnoMat: any;
    animId: number;
    THREE: any;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let cancelled = false;

    async function init() {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js" as any);
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js" as any);

      if (cancelled || !mountRef.current) return;

      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mountRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
      camera.position.set(0, 0, 4);
      camera.lookAt(0, 0, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambient);
      const dir1 = new THREE.DirectionalLight(0xffffff, 2);
      dir1.position.set(2, 4, 3);
      scene.add(dir1);
      const dir2 = new THREE.DirectionalLight(0xffffff, 0.8);
      dir2.position.set(-2, 1, -2);
      scene.add(dir2);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.enablePan = false;
      controls.minDistance = 3;
      controls.maxDistance = 3.5;
      controls.autoRotate = false;
      controls.update();

      // Costruisci materiali occhi con fallback
      const [eyeSxMat, eyeDxMat] = await Promise.all([
        buildEyeMaterial(THREE, coloreOcchioSx, immagineOcchioSx),
        buildEyeMaterial(THREE, coloreOcchioDx, immagineOcchioDx),
      ]);

      const eyeGeo = new THREE.SphereGeometry(0.04, 32, 32);
      const eyeSx = new THREE.Mesh(eyeGeo, eyeSxMat);
      const eyeDx = new THREE.Mesh(eyeGeo, eyeDxMat);

        eyeSx.position.set(
            occhioSxPos?.x ?? -0.05,
            occhioSxPos?.y ?? -0.42,
            occhioSxPos?.z ?? 0.05
        );
        eyeDx.position.set(
            occhioDxPos?.x ?? 0.05,
            occhioDxPos?.y ?? -0.42,
            occhioDxPos?.z ?? 0.05
        );

      scene.add(eyeSx);
      scene.add(eyeDx);

      let corpeMat: any = null;
      let disegnoMat: any = null;

      const loader = new GLTFLoader();
      loader.load(glbUrl, (gltf: any) => {
        if (cancelled) return;

        const model = gltf.scene;

        const innerGroup = new THREE.Group();
        innerGroup.rotation.x = Math.PI / 2;
        innerGroup.add(model);

        const outerGroup = new THREE.Group();
        outerGroup.add(innerGroup);
        scene.add(outerGroup);

        outerGroup.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(outerGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.4 / maxDim;

        outerGroup.scale.setScalar(scale);
        outerGroup.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        model.traverse((obj: any) => {
          if (!obj.isMesh) return;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat: any) => {
            mat.roughness = 0.11;
            mat.metalness = 0;
            if (mat.name === "nero") {
              corpeMat = mat;
              mat.color.set(coloreCiondolo === "bianco" ? "#d8d8d8" : "#1a1a1a");
            }
            if (mat.name === "bianco") {
              disegnoMat = mat;
              mat.color.set(coloreDisegno || "#ffffff");
            }
          });
        });

        stateRef.current = { renderer, eyeSx, eyeDx, corpeMat, disegnoMat, animId: 0, THREE };
      });

      function animate() {
        if (cancelled) return;
        const id = requestAnimationFrame(animate);
        if (stateRef.current) stateRef.current.animId = id;
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    }

    init();

    return () => {
      cancelled = true;
      if (stateRef.current) {
        cancelAnimationFrame(stateRef.current.animId);
        stateRef.current.renderer.dispose();
        if (mountRef.current && stateRef.current.renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(stateRef.current.renderer.domElement);
        }
        stateRef.current = null;
      }
    };
  }, [glbUrl, immagineOcchioSx, immagineOcchioDx]);

  // Aggiorna colori dinamicamente quando cambiano (senza ricreare il viewer)
  useEffect(() => {
    if (!stateRef.current) return;
    const { eyeSx, eyeDx, corpeMat, disegnoMat, THREE } = stateRef.current;

    // Aggiorna materiale occhi solo se non hanno texture
    if (eyeSx?.material && !eyeSx.material.map) {
      if (coloreOcchioSx) eyeSx.material.color.set(coloreOcchioSx);
    }
    if (eyeDx?.material && !eyeDx.material.map) {
      if (coloreOcchioDx) eyeDx.material.color.set(coloreOcchioDx);
    }
    if (corpeMat) corpeMat.color.set(coloreCiondolo === "bianco" ? "#d8d8d8" : "#1a1a1a");
    if (disegnoMat && coloreDisegno) disegnoMat.color.set(coloreDisegno);
  }, [coloreCiondolo, coloreDisegno, coloreOcchioSx, coloreOcchioDx]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "280px", borderRadius: 12, overflow: "hidden" }} />
  );
}
