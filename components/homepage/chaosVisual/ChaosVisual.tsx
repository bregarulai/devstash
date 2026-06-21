'use client';

import { useRef, useEffect, useCallback, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  el: HTMLSpanElement;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  scale: number;
  phase: number;
  homeCol: number;
  homeRow: number;
}

const ICONS = [
  { title: 'Notion', color: '#e6ebf5', path: 'M4 3h12l4 4v14H4V3zm2 2v14h12V8.5L13.5 5H6zM9 9h6v1H9zM9 12h6v1H9zM9 15h4v1H9z' },
  { title: 'GitHub', color: '#c9d3e8', path: 'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.85c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z' },
  { title: 'Slack', color: '#f59e0b', path: 'M5 15a2 2 0 1 1 2-2v2H5zm1-5a2 2 0 1 1 2 2H6v-2zm5 5a2 2 0 1 1 2-2v2h-2zm1-5a2 2 0 1 1 2 2h-2v-2zm5 5a2 2 0 1 1-2-2v2h2zm-1-5a2 2 0 1 1-2 2h2v-2zm5-5a2 2 0 1 1 2 2h-2V5z' },
  { title: 'VS Code', color: '#3b82f6', path: 'M17 3l3 2v14l-3 2-7-7-4 3-2-1V8l2-1 4 3 7-7zm0 4.5L11.5 12 17 16.5v-9z' },
  { title: 'Browser tabs', color: '#22d3ee', path: 'M3 5h18v14H3V5zm2 2v2h6V7H5zm0 4v6h14v-6H5z' },
  { title: 'Terminal', color: '#22c55e', path: 'M2 4h20v16H2V4zm2 2v12h16V6H4zm2 2l3 3-3 3 1 1 4-4-4-4-1 1zm5 6h5v1h-5v-1z' },
  { title: 'Text file', color: '#ec4899', path: 'M6 2h8l4 4v16H6V2zm2 2v16h8V7h-4V4H8z' },
  { title: 'Bookmark', color: '#6366f1', path: 'M7 3h10v18l-5-3-5 3V3zm2 2v13l3-1.8L15 18V5H9z' },
];

const REPULSE_RADIUS = 110;
const REPULSE_STRENGTH = 0.55;
const MAX_SPEED = 2.2;
const ICON_SIZE = 58;
const COLS = 4;

function subscribeMotion(callback: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getMotionServerSnapshot() {
  return false;
}

export function ChaosVisual() {
  const stageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const stageDimensionsRef = useRef({ width: 0, height: 0 });
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });
  const prefersReduced = useSyncExternalStore(subscribeMotion, getMotionSnapshot, getMotionServerSnapshot);

  const measure = useCallback(() => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    stageDimensionsRef.current = { width: w, height: h };
    setStageDimensions((prev) =>
      prev.width === w && prev.height === h ? prev : { width: w, height: h }
    );
  }, []);

  const tick = useCallback(() => {
    const { width: stageW, height: stageH } = stageDimensionsRef.current;
    if (stageW === 0 || stageH === 0) return;

    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.phase += 0.04;
      p.scale = 1 + Math.sin(p.phase) * 0.06;

      if (p.x <= 0) { p.x = 0; p.vx = Math.abs(p.vx); }
      if (p.x + p.size >= stageW) { p.x = stageW - p.size; p.vx = -Math.abs(p.vx); }
      if (p.y <= 0) { p.y = 0; p.vy = Math.abs(p.vy); }
      if (p.y + p.size >= stageH) { p.y = stageH - p.size; p.vy = -Math.abs(p.vy); }

      if (mouseRef.current.active) {
        const cx = p.x + p.size / 2;
        const cy = p.y + p.size / 2;
        const dx = cx - mouseRef.current.x;
        const dy = cy - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPULSE_RADIUS && dist > 0.001) {
          const force = (1 - dist / REPULSE_RADIUS) * REPULSE_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      } else {
        const { width: stageW, height: stageH } = stageDimensionsRef.current;
        const pad = 10;
        const usableW = stageW - pad * 2;
        const usableH = stageH - pad * 2;
        const rows = Math.ceil(ICONS.length / COLS);
        const cellW = usableW / COLS;
        const cellH = usableH / rows;
        const homeCx = pad + p.homeCol * cellW + cellW / 2 - p.size / 2;
        const homeCy = pad + p.homeRow * cellH + cellH / 2 - p.size / 2;
        p.vx += (homeCx - p.x) * 0.003;
        p.vy += (homeCy - p.y) * 0.003;
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }
      p.vx *= 0.992;
      p.vy *= 0.992;
      if (Math.abs(p.vx) < 0.2) p.vx += (Math.random() - 0.5) * 0.05;
      if (Math.abs(p.vy) < 0.2) p.vy += (Math.random() - 0.5) * 0.05;
      if (p.rot > 18 || p.rot < -18) p.vrot *= -1;

      p.el.style.transform =
        `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) rotate(${p.rot.toFixed(2)}deg) scale(${p.scale.toFixed(3)})`;
    });
  }, []);

  const placeInitial = useCallback(() => {
    const { width: stageW, height: stageH } = stageDimensionsRef.current;
    if (stageW === 0 || stageH === 0) return;

    const pad = 10;
    const usableW = stageW - pad * 2;
    const usableH = stageH - pad * 2;
    const rows = Math.ceil(ICONS.length / COLS);
    const cellW = usableW / COLS;
    const cellH = usableH / rows;

    particlesRef.current.forEach((p) => {
      const cx = pad + p.homeCol * cellW + cellW / 2 + (Math.random() - 0.5) * 18;
      const cy = pad + p.homeRow * cellH + cellH / 2 + (Math.random() - 0.5) * 18;
      p.x = Math.max(pad, Math.min(stageW - p.size - pad, cx - p.size / 2));
      p.y = Math.max(pad, Math.min(stageH - p.size - pad, cy - p.size / 2));
    });
  }, []);

  const onMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    let cx: number, cy: number;
    if ('touches' in e && e.touches[0]) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = (e as MouseEvent).clientX;
      cy = (e as MouseEvent).clientY;
    }
    const x = cx - rect.left;
    const y = cy - rect.top;
    const { width, height } = stageDimensionsRef.current;
    mouseRef.current = {
      x,
      y,
      active: x >= 0 && x <= width && y >= 0 && y <= height,
    };
  }, []);

  const onLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999, active: false };
  }, []);

  useEffect(() => {
    particlesRef.current = ICONS.map((icon, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const el = document.createElement('span');
      el.title = icon.title;
      el.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="${icon.path}"/></svg>`;
      return {
        el,
        size: ICON_SIZE,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 1.1,
        vy: (Math.random() - 0.5) * 1.1,
        rot: (Math.random() - 0.5) * 16,
        vrot: (Math.random() - 0.5) * 0.6,
        scale: 1,
        phase: Math.random() * Math.PI * 2,
        homeCol: col,
        homeRow: row,
      };
    });

    const stage = stageRef.current;
    if (stage) {
      particlesRef.current.forEach((p, i) => {
        p.el.style.position = 'absolute';
        p.el.style.top = '0';
        p.el.style.left = '0';
        p.el.style.width = `${p.size}px`;
        p.el.style.height = `${p.size}px`;
        p.el.style.display = 'inline-flex';
        p.el.style.alignItems = 'center';
        p.el.style.justifyContent = 'center';
        p.el.style.borderRadius = '12px';
        p.el.style.background = 'rgba(255, 255, 255, 0.06)';
        p.el.style.border = '1px solid rgba(148, 163, 184, 0.22)';
        p.el.style.color = ICONS[i].color;
        p.el.style.willChange = 'transform';
        stage.appendChild(p.el);
      });
    }

    return () => {
      if (stage) {
        particlesRef.current.forEach((p) => {
          if (p.el.parentNode === stage) {
            stage.removeChild(p.el);
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (stageDimensions.width === 0 || stageDimensions.height === 0) return;
    placeInitial();
    if (prefersReduced) {
      particlesRef.current.forEach((p) => {
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });
      return;
    }
    let rafId = 0;
    const loop = () => {
      tick();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [stageDimensions, prefersReduced, placeInitial, tick]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      if (timer) clearTimeout(timer);
    };
  }, [measure]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    if (!isTouch) {
      stage.addEventListener('touchmove', onMove, { passive: true });
      stage.addEventListener('touchend', onLeave);
    }

    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
      if (!isTouch) {
        stage.removeEventListener('touchmove', onMove);
        stage.removeEventListener('touchend', onLeave);
      }
    };
  }, [onMove, onLeave]);

  return (
    <div className="relative grid grid-cols-1 gap-7 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
      <div className="bg-card border border-border rounded-xl p-[18px] relative overflow-hidden flex flex-col">
        <span className="block text-xs font-semibold tracking-[0.04em] text-muted-foreground mb-3 flex-none">
          Your knowledge today&hellip;
        </span>
        <div
          ref={stageRef}
          className="relative flex-1 min-h-[260px] rounded-lg overflow-hidden cursor-default"
          style={{
            background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-snippet) 8%, transparent), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      </div>

      <div
        className="relative h-[44px] rotate-90 flex items-center justify-center lg:h-auto lg:min-h-[60px] lg:rotate-0"
        aria-hidden="true"
      >
        <div className="w-[130px] h-1.5 bg-muted-foreground rounded-md relative">
          <div
            className="absolute -right-3.5 top-1/2 -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: '13px solid transparent',
              borderBottom: '13px solid transparent',
              borderLeft: '20px solid var(--muted-foreground)',
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={cn(
              'absolute w-[54px] h-[54px] border-2 border-primary rounded-full opacity-0',
              !prefersReduced && 'animate-[arrowPulse_2s_ease-out_infinite]'
            )}
          />
          <div
            className={cn(
              'absolute w-[54px] h-[54px] border-2 border-primary rounded-full opacity-0',
              !prefersReduced && 'animate-[arrowPulse_2s_ease-out_infinite_1s]'
            )}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-[18px] relative overflow-hidden flex flex-col">
        <span className="block text-xs font-semibold tracking-[0.04em] text-muted-foreground mb-3 flex-none">
          &hellip;with DevStash
        </span>
        <div className="grid gap-3 flex-1 min-h-[260px]" style={{ gridTemplateColumns: '110px 1fr' }}>
          <div className="bg-accent border border-border rounded-lg p-3 flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground py-[7px] px-2.5 rounded-md font-medium bg-primary/16 text-foreground">
              All
            </span>
            <span className="text-xs text-muted-foreground py-[7px] px-2.5 rounded-md font-medium">
              Snippets
            </span>
            <span className="text-xs text-muted-foreground py-[7px] px-2.5 rounded-md font-medium">
              Prompts
            </span>
            <span className="text-xs text-muted-foreground py-[7px] px-2.5 rounded-md font-medium">
              Commands
            </span>
            <span className="text-xs text-muted-foreground py-[7px] px-2.5 rounded-md font-medium">
              Notes
            </span>
            <span className="text-xs text-muted-foreground py-[7px] px-2.5 rounded-md font-medium">
              Files
            </span>
          </div>
          <div className="grid gap-2 h-full min-h-0" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
            {['snippet', 'prompt', 'command', 'note', 'image', 'url'].map((type) => (
              <div
                key={type}
                className="bg-accent border border-border rounded-lg overflow-hidden min-h-0 flex flex-row items-center"
              >
                <div className="px-3 flex items-center gap-2.5 flex-1 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full flex-none"
                    style={{
                      background:
                        type === 'snippet'
                          ? 'var(--color-snippet)'
                          : type === 'prompt'
                          ? 'var(--color-prompt)'
                          : type === 'command'
                          ? 'var(--color-command)'
                          : type === 'note'
                          ? 'var(--color-note)'
                          : type === 'image'
                          ? 'var(--color-image)'
                          : 'var(--color-link)',
                    }}
                  />
                  <span className="h-1.5 rounded-sm bg-border w-[38%] flex-none" />
                  <span className="h-1.5 rounded-sm bg-border w-[22%] flex-none" />
                  <span className="h-1.5 rounded-sm bg-border w-[14%] flex-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
