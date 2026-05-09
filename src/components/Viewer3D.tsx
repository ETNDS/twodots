"use client";

import { useEffect, useRef } from "react";

type Props = {
  glbUrl: string;
  coloreCiondolo: "nero" | "bianco" | null;
  coloreDisegno: string | null;
  coloreOcchioSx: string | null;
  coloreOcchioDx: string | null;
};

export default function Viewer3D({ glbUrl, coloreCiondolo, coloreDisegno, coloreOcchioSx, coloreOcchioDx }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: any;
    eyeSxMat: any;
    eyeDxMat: any;
    corpeMat: any;
    disegnoMat: any;
    animId: number;
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
      controls.minDistance = 2;
      controls.maxDistance = 8;
      controls.autoRotate = false;
      controls.update();

      const eyeSxMat = new THREE.MeshStandardMaterial({
        color: coloreOcchioSx || "#aaddff",
        roughness: 0.05,
        metalness: 0.4,
      });
      const eyeDxMat = new THREE.MeshStandardMaterial({
        color: coloreOcchioDx || "#aaddff",
        roughness: 0.05,
        metalness: 0.4,
      });

      const eyeGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const eyeSx = new THREE.Mesh(eyeGeo, eyeSxMat);
      const eyeDx = new THREE.Mesh(eyeGeo, eyeDxMat);

      // Posizioni calcolate: rotazione PI/2 applicata prima, poi center+scale
      eyeSx.position.set(-0.05, -0.4200, 0.08);
      eyeDx.position.set(0.05, -0.42, 0.08);

      scene.add(eyeSx);
      scene.add(eyeDx);

      let corpeMat: any = null;
      let disegnoMat: any = null;

      const loader = new GLTFLoader();
      loader.load(glbUrl, (gltf: any) => {
        if (cancelled) return;

        const model = gltf.scene;

        // Gruppo interno: applica rotazione al modello
        const innerGroup = new THREE.Group();
        innerGroup.rotation.x = Math.PI / 2;
        innerGroup.add(model);

        // Gruppo esterno: centra e scala dopo rotazione
        const outerGroup = new THREE.Group();
        outerGroup.add(innerGroup);
        scene.add(outerGroup);

        // Forza aggiornamento matrice per calcolare bounds corretti
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

        stateRef.current = { renderer, eyeSxMat, eyeDxMat, corpeMat, disegnoMat, animId: 0 };
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
  }, [glbUrl]);

  useEffect(() => {
    if (!stateRef.current) return;
    const { eyeSxMat, eyeDxMat, corpeMat, disegnoMat } = stateRef.current;
    if (coloreOcchioSx && eyeSxMat) eyeSxMat.color.set(coloreOcchioSx);
    if (coloreOcchioDx && eyeDxMat) eyeDxMat.color.set(coloreOcchioDx);
    if (corpeMat) corpeMat.color.set(coloreCiondolo === "bianco" ? "#d8d8d8" : "#1a1a1a");
    if (disegnoMat && coloreDisegno) disegnoMat.color.set(coloreDisegno);
  }, [coloreCiondolo, coloreDisegno, coloreOcchioSx, coloreOcchioDx]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "280px", borderRadius: 12, overflow: "hidden" }} />
  );
}
