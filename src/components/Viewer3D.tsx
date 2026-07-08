"use client";

import { useEffect, useRef } from "react";

type Props = {
  glbUrl: string;
  coloreCiondolo: string | null;
  coloreDisegno: string | null;
  coloreOcchioSx: string | null;
  coloreOcchioDx: string | null;
  height?: string | number;
  zoom?: number;
};

export default function Viewer3D({
  glbUrl,
  coloreCiondolo,
  coloreDisegno,
  coloreOcchioSx,
  coloreOcchioDx,
  height = "280px",
  zoom = 1,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const animIdRef = useRef<number>(0);
  const stateRef = useRef<{
    ciondoloMat: any;
    disegnoMat: any;
    occhioSxMat: any;
    occhioDxMat: any;
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
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100);
      camera.position.set(0, 0, 4);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 1.5));
      const dir1 = new THREE.DirectionalLight(0xffffff, 2);
      dir1.position.set(2, 4, 3);
      scene.add(dir1);
      const dir2 = new THREE.DirectionalLight(0xffffff, 0.8);
      dir2.position.set(-2, 1, -2);
      scene.add(dir2);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.enablePan = false;
      controls.minDistance = 3 * zoom;
      controls.maxDistance = 3.5 * zoom;
      controls.autoRotate = false;
      controls.update();

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

        // Calcola bounding box DOPO la rotazione
        outerGroup.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(outerGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = (1.4 * zoom) / maxDim;

        outerGroup.scale.setScalar(scale);

        // Ricalcola bounding box dopo la scala per centrare correttamente
        outerGroup.updateMatrixWorld(true);
        const box2 = new THREE.Box3().setFromObject(outerGroup);
        const center2 = box2.getCenter(new THREE.Vector3());
        outerGroup.position.set(-center2.x, -center2.y, -center2.z);

        // Con rotazione X PI/2 il centro visivo scende: compenso con target Y negativo
        const targetY = zoom > 1 ? -0.45 * (zoom - 1) : 0;
        controls.target.set(0, targetY, 0);
        camera.lookAt(0, targetY, 0);
        controls.update();

        let ciondoloMat: any = null;
        let disegnoMat: any = null;
        let occhioSxMat: any = null;
        let occhioDxMat: any = null;

        model.traverse((obj: any) => {
          if (!obj.isMesh) return;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat: any) => {
            mat.roughness = 0.11;
            mat.metalness = 0;
            if (mat.name === "ciondolo") { ciondoloMat = mat; mat.color.set(coloreCiondolo || "#1a1a1a"); }
            if (mat.name === "disegno") { disegnoMat = mat; mat.color.set(coloreDisegno || "#ffffff"); }
            if (mat.name === "occhio sx") { occhioSxMat = mat; mat.color.set(coloreOcchioSx || "#e07010"); }
            if (mat.name === "occhio dx") { occhioDxMat = mat; mat.color.set(coloreOcchioDx || "#e07010"); }
          });
        });

        stateRef.current = { ciondoloMat, disegnoMat, occhioSxMat, occhioDxMat };
      });

      function animate() {
        if (cancelled) return;
        animIdRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
    };
  }, [glbUrl]);

  useEffect(() => {
    if (!stateRef.current) return;
    const { ciondoloMat, disegnoMat, occhioSxMat, occhioDxMat } = stateRef.current;
    if (ciondoloMat && coloreCiondolo) ciondoloMat.color.set(coloreCiondolo);
    if (disegnoMat && coloreDisegno) disegnoMat.color.set(coloreDisegno);
    if (occhioSxMat && coloreOcchioSx) occhioSxMat.color.set(coloreOcchioSx);
    if (occhioDxMat && coloreOcchioDx) occhioDxMat.color.set(coloreOcchioDx);
  }, [coloreCiondolo, coloreDisegno, coloreOcchioSx, coloreOcchioDx]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height, borderRadius: 12, overflow: "hidden" }} />
  );
}
