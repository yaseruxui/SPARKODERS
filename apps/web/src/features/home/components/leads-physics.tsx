'use client';

import { useEffect, useRef } from 'react';
import type { Body, Engine as MatterEngine } from 'matter-js';
import { useFinePointer } from '@/hooks/use-fine-pointer';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface LeadsPhysicsProps {
  tags: readonly string[];
  ariaLabel: string;
  tapLabel: string;
}

const PILL_FILLS = ['#B26CFF', '#6E29AC', '#0C8EC7', '#7FEEFA', '#A497FA', '#17123A'] as const;
const INK_TEXT = new Set<string>(['#7FEEFA', '#A497FA']);
const MAX_BODIES = 70;
const INITIAL_DROPS = 16;

interface PillMeta {
  label: string;
  fill: string;
  width: number;
  height: number;
}

/**
 * Falling "lead" pills: they rain down when the section first appears and pile up at the bottom.
 * Click or tap the area to drop more; mouse users can also grab and throw them.
 * The physics engine is fetched only when this component mounts.
 */
export function LeadsPhysics({ tags, ariaLabel, tapLabel }: LeadsPhysicsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spawnRef = useRef<(x?: number) => void>(() => undefined);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!host || !canvas || !context) return;

    let disposed = false;
    let cleanup: () => void = () => undefined;

    void import('matter-js').then((Matter) => {
      if (disposed) return;
      const { Bodies, Composite, Engine, Mouse, MouseConstraint, Events } = Matter;
      const engine: MatterEngine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.0012 } });
      const meta = new WeakMap<Body, PillMeta>();
      const fontFamily = getComputedStyle(document.body).fontFamily;
      let width = 0;
      let height = 0;
      let dpr = 1;
      let walls: Body[] = [];
      let tagIndex = 0;

      const fontFor = (size: number) => `600 ${size}px ${fontFamily}`;

      const layout = () => {
        const rect = host.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        Composite.remove(engine.world, walls);
        const thick = 200;
        walls = [
          Bodies.rectangle(width / 2, height + thick / 2, width * 3, thick, { isStatic: true }),
          Bodies.rectangle(-thick / 2, height / 2, thick, height * 4, { isStatic: true }),
          Bodies.rectangle(width + thick / 2, height / 2, thick, height * 4, { isStatic: true }),
        ];
        Composite.add(engine.world, walls);
      };

      const spawn = (x?: number) => {
        const label = tags[tagIndex % tags.length] ?? '';
        const fill = PILL_FILLS[tagIndex % PILL_FILLS.length] ?? PILL_FILLS[0];
        tagIndex += 1;
        const size = width < 640 ? 15 : 20;
        context.font = fontFor(size);
        const pillHeight = size * 2.6;
        const pillWidth = context.measureText(label).width + size * 2.4;
        const spawnX = x ?? pillWidth / 2 + Math.random() * Math.max(1, width - pillWidth);
        const body = Bodies.rectangle(spawnX, -pillHeight, pillWidth, pillHeight, {
          chamfer: { radius: pillHeight / 2 - 1 },
          restitution: 0.35,
          friction: 0.08,
          angle: (Math.random() - 0.5) * 0.8,
        });
        meta.set(body, { label, fill, width: pillWidth, height: pillHeight });
        Composite.add(engine.world, body);
        const dynamic = Composite.allBodies(engine.world).filter((b) => !b.isStatic);
        if (dynamic.length > MAX_BODIES && dynamic[0]) Composite.remove(engine.world, dynamic[0]);
      };
      spawnRef.current = spawn;

      const draw = () => {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        for (const body of Composite.allBodies(engine.world)) {
          const info = meta.get(body);
          if (!info) continue;
          context.save();
          context.translate(body.position.x, body.position.y);
          context.rotate(body.angle);
          context.beginPath();
          context.roundRect(-info.width / 2, -info.height / 2, info.width, info.height, info.height / 2);
          context.fillStyle = info.fill;
          context.fill();
          context.strokeStyle = 'rgba(255,255,255,0.12)';
          context.lineWidth = 1;
          context.stroke();
          context.fillStyle = INK_TEXT.has(info.fill) ? '#07051A' : '#F5F2FF';
          context.font = fontFor(info.height / 2.6);
          context.fillText(info.label, 0, 1);
          context.restore();
        }
      };

      layout();

      let frame = 0;
      let visible = false;
      let last = performance.now();
      const step = (now: number) => {
        frame = 0;
        const delta = Math.min(1000 / 60, now - last);
        last = now;
        Engine.update(engine, delta);
        draw();
        if (visible) frame = requestAnimationFrame(step);
      };

      let dropped = false;
      const dropInitial = () => {
        if (dropped) return;
        dropped = true;
        if (reduced) {
          for (let i = 0; i < INITIAL_DROPS; i += 1) spawn();
          for (let i = 0; i < 600; i += 1) Engine.update(engine, 1000 / 60);
          draw();
          return;
        }
        for (let i = 0; i < INITIAL_DROPS; i += 1) window.setTimeout(() => !disposed && spawn(), i * 140);
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          if (visible) {
            dropInitial();
            last = performance.now();
            if (!frame && !reduced) frame = requestAnimationFrame(step);
          }
        },
        { threshold: 0.2 },
      );
      io.observe(host);

      const resizeObserver = new ResizeObserver(() => {
        layout();
        draw();
      });
      resizeObserver.observe(host);

      let dragging = false;
      let mouseConstraint: ReturnType<typeof MouseConstraint.create> | null = null;
      if (fine && !reduced) {
        const mouse = Mouse.create(canvas);
        mouse.pixelRatio = 1;
        // Matter listens for wheel events and would block page scrolling over the canvas.
        canvas.removeEventListener('wheel', mouse.mousewheel);
        mouseConstraint = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2 } });
        Composite.add(engine.world, mouseConstraint);
        Events.on(mouseConstraint, 'startdrag', () => {
          dragging = true;
        });
      }

      const onPointerUp = (event: PointerEvent) => {
        if (dragging) {
          dragging = false;
          return;
        }
        const rect = canvas.getBoundingClientRect();
        spawn(event.clientX - rect.left);
        if (reduced) {
          for (let i = 0; i < 200; i += 1) Engine.update(engine, 1000 / 60);
          draw();
        }
      };
      canvas.addEventListener('pointerup', onPointerUp);

      cleanup = () => {
        cancelAnimationFrame(frame);
        io.disconnect();
        resizeObserver.disconnect();
        canvas.removeEventListener('pointerup', onPointerUp);
        if (mouseConstraint) Mouse.clearSourceEvents(mouseConstraint.mouse);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    });

    return () => {
      disposed = true;
      cleanup();
      spawnRef.current = () => undefined;
    };
  }, [tags, fine, reduced]);

  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        data-cursor={tapLabel}
        className="block size-full cursor-pointer touch-pan-y"
      />
      <button
        type="button"
        onClick={() => spawnRef.current()}
        className="absolute end-[6%] top-[38%] z-10 -rotate-8 cursor-pointer rounded-full bg-aqua px-[18px] py-2.5 font-display font-extrabold text-ink transition-transform duration-250 ease-brand hover:scale-106 hover:-rotate-4 active:scale-94 max-sm:top-auto max-sm:bottom-6"
      >
        {tapLabel}
      </button>
    </div>
  );
}
