'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { site } from '@/lib/config/site';
import { lerp } from '@/utils/math';
import { buildMarkGeometries, MARK_HEIGHT, MARK_WIDTH } from '../lib/mark-geometry';

interface SparkSceneProps {
  /** 0 → 1 scroll progress of the surrounding sticky section, written by the parent each frame. */
  progressRef: RefObject<number>;
  /** Camera distance; larger values make the mark smaller in its canvas. */
  distance?: number;
}

/** World-space width of the mark. */
const MARK_SIZE = 3.2;

/**
 * The Sparkoders "S" as a lit 3D object wearing the logo's own gradient. It turns as the visitor
 * scrolls through the intro, tilts toward the pointer and floats gently. Rendering pauses
 * whenever it is off-screen.
 */
export default function SparkScene({ progressRef, distance = 7.2 }: SparkSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (cause) {
      // Surfaced to the surrounding ErrorBoundary, which shows the static glow instead.
      throw new Error('WebGL is unavailable', { cause });
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, distance);

    scene.add(new AmbientLight(0xffffff, 1.1));
    const key = new DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 4, 6);
    scene.add(key);
    const violet = new PointLight(0xb26cff, 30, 30);
    violet.position.set(-4, -1.5, 3);
    scene.add(violet);
    const aqua = new PointLight(0x7feefa, 24, 30);
    aqua.position.set(4, -3, 2.5);
    scene.add(aqua);

    const texture = new TextureLoader().load(site.markTexture, () => requestRender());
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const material = new MeshPhysicalMaterial({
      map: texture,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      // The mark is mirrored on y (image space), which flips face winding; render both sides.
      side: DoubleSide,
    });

    const scale = MARK_SIZE / MARK_WIDTH;
    const mark = new Group();
    const pieces = buildMarkGeometries();
    for (const piece of pieces) {
      const mesh = new Mesh(piece.geometry, material);
      mesh.position.z = piece.depth;
      mark.add(mesh);
    }
    mark.scale.set(scale, -scale, scale);
    mark.position.set(-MARK_WIDTH * scale * 0.5, MARK_HEIGHT * scale * 0.5, -0.2);
    const pivot = new Group();
    pivot.add(mark);
    scene.add(pivot);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = `${width}px`;
      renderer.domElement.style.height = `${height}px`;
      camera.aspect = width / height;
      // Keep the whole mark in frame on narrow (portrait) canvases.
      camera.position.z = camera.aspect < 1 ? distance / Math.max(camera.aspect, 0.55) : distance;
      camera.updateProjectionMatrix();
      requestRender();
    };

    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    const onPointer = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let visible = false;
    let frame = 0;
    const start = performance.now();

    function render() {
      frame = 0;
      const progress = progressRef.current ?? 0;
      const time = reduced ? 0 : (performance.now() - start) / 1000;
      tiltX = lerp(tiltX, pointerY * 0.25, 0.06);
      tiltY = lerp(tiltY, pointerX * 0.35, 0.06);

      pivot.rotation.y = progress * Math.PI * 2 + Math.sin(time * 0.6) * 0.14 + tiltY;
      pivot.rotation.x = Math.sin(progress * Math.PI) * 0.35 + tiltX;
      pivot.rotation.z = Math.sin(progress * Math.PI * 2) * 0.08;
      pivot.position.y = Math.sin(time * 1.1) * 0.06;
      pivot.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.15);

      renderer.render(scene, camera);
      if (visible && !reduced) frame = requestAnimationFrame(render);
    }

    function requestRender() {
      if (visible && !frame) frame = requestAnimationFrame(render);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const onScroll = () => {
      if (reduced) requestRender();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      requestRender();
    });
    io.observe(host);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      pieces.forEach((piece) => piece.geometry.dispose());
      texture.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef, reduced, distance]);

  return <div ref={hostRef} className="absolute inset-0" />;
}
