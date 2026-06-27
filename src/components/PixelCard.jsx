"use client";

import { useEffect, useRef, useState } from 'react';
import './PixelCard.css';

// --- Shared single animation loop ---
const registry = new Map();
let running = false;

function sharedTick() {
  for (const [, paint] of registry) {
    paint();
  }
  if (registry.size > 0) {
    requestAnimationFrame(sharedTick);
  } else {
    running = false;
  }
}

function registerPaint(id, paint) {
  registry.set(id, paint);
  if (!running) {
    running = true;
    requestAnimationFrame(sharedTick);
  }
}

function unregisterPaint(id) {
  registry.delete(id);
}
// -----------------------------------

class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = parseInt(value, 10);

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

const VARIANTS = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: '#f8fafc,#f1f5f9,#cbd5e1',
    noFocus: false
  },
  blue: {
    activeColor: '#e0f2fe',
    gap: 10,
    speed: 25,
    colors: '#e0f2fe,#7dd3fc,#0ea5e9',
    noFocus: false
  },
  yellow: {
    activeColor: '#fef08a',
    gap: 3,
    speed: 20,
    colors: '#fef08a,#fde047,#eab308',
    noFocus: false
  },
  pink: {
    activeColor: '#fecdd3',
    gap: 6,
    speed: 80,
    colors: '#fecdd3,#fda4af,#e11d48',
    noFocus: true
  }
};

let uid = 0;

export default function PixelCard({ variant = 'default', gap = undefined, speed = undefined, colors = undefined, noFocus = undefined, className = '', children }) {
  const id = useRef(++uid);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  // IntersectionObserver: only allow canvas for cards near viewport
  useEffect(() => {
    const el = cardRef.current;
    const currentId = id.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      unregisterPaint(currentId);
      pixelsRef.current = [];
    };
  }, []);

  // Canvas lifecycle: create + register on hover+visible, dispose on leave
  useEffect(() => {
    const currentId = id.current;
    if (!active || !visible) {
      unregisterPaint(currentId);
      pixelsRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    const container = cardRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const finalGap = gap ?? variantCfg.gap;
    const finalSpeed = speed ?? variantCfg.speed;
    const finalColors = colors ?? variantCfg.colors;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const colorArr = finalColors.split(',');
    const pxs = [];
    for (let x = 0; x < width; x += parseInt(finalGap, 10)) {
      for (let y = 0; y < height; y += parseInt(finalGap, 10)) {
        const c = colorArr[Math.floor(Math.random() * colorArr.length)];
        const dx = x - width / 2;
        const dy = y - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        pxs.push(new Pixel(canvas, ctx, x, y, c, getEffectiveSpeed(finalSpeed, reducedMotion), reducedMotion ? 0 : dist));
      }
    }
    pixelsRef.current = pxs;

    let idle = false;
    registerPaint(currentId, () => {
      if (idle) return;
      ctx.clearRect(0, 0, width, height);
      let allIdle = true;
      for (const px of pxs) {
        px.appear();
        if (!px.isIdle) allIdle = false;
      }
      idle = allIdle;
      if (idle) unregisterPaint(currentId);
    });

    return () => {
      unregisterPaint(currentId);
      pixelsRef.current = [];
    };
  }, [active, visible, variant, gap, speed, colors]);

  const showCanvas = active && visible;

  return (
    <div
      ref={cardRef}
      className={`pixel-card ${className}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={finalNoFocus ? undefined : (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(true);
      }}
      onBlur={finalNoFocus ? undefined : (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(false);
      }}
      tabIndex={finalNoFocus ? -1 : 0}
    >
      {showCanvas && <canvas className="pixel-canvas" ref={canvasRef} />}
      {children}
    </div>
  );
}
