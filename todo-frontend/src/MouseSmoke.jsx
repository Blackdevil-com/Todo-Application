import { useEffect, useRef } from "react";

/** Neon smoke / particle trail that follows the mouse cursor */
export default function MouseSmoke() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let lastX = mouseX;
    let lastY = mouseY;
    let animId;

    /* ── Resize ── */
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    /* ── Mouse track ── */
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    /* ── Particle pool ── */
    const particles = [];

    class Particle {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx + (Math.random() - 0.5) * 1.2;
        this.vy = vy + (Math.random() - 0.5) * 1.2 - 0.4; // slight upward drift
        this.radius = Math.random() * 18 + 6;
        this.alpha = Math.random() * 0.18 + 0.06; // keep it light
        this.decay = Math.random() * 0.008 + 0.004;
        this.grow = Math.random() * 0.3 + 0.1;   // expand as they fade

        // Color: accent green (#a8e063) or soft cyan (#63d4e0) — randomised
        const hue = Math.random() > 0.55 ? 82 : 185; // lime-green vs cyan
        this.hue = hue;
        this.sat = Math.floor(Math.random() * 20 + 70); // 70-90%
        this.lit = Math.floor(Math.random() * 15 + 70); // 70-85%
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.radius += this.grow;
        this.alpha -= this.decay;
      }

      draw(ctx) {
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        grad.addColorStop(0,   `hsla(${this.hue},${this.sat}%,${this.lit}%,${this.alpha})`);
        grad.addColorStop(0.4, `hsla(${this.hue},${this.sat}%,${this.lit}%,${this.alpha * 0.5})`);
        grad.addColorStop(1,   `hsla(${this.hue},${this.sat}%,${this.lit}%,0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      isDead() {
        return this.alpha <= 0;
      }
    }

    /* ── Glow cursor orb ── */
    class CursorOrb {
      constructor() {
        this.x = mouseX;
        this.y = mouseY;
        this.radius = 10;
        this.alpha = 0;
      }

      draw(ctx) {
        this.x += (mouseX - this.x) * 0.2;
        this.y += (mouseY - this.y) * 0.2;
        this.alpha = 0.45;

        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius * 3
        );
        grad.addColorStop(0,   `rgba(168, 224, 99, ${this.alpha})`);
        grad.addColorStop(0.3, `rgba(168, 224, 99, ${this.alpha * 0.25})`);
        grad.addColorStop(1,   `rgba(168, 224, 99, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // bright core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(230, 255, 160, 0.9)";
        ctx.fill();
      }
    }

    const orb = new CursorOrb();
    let frame = 0;

    /* ── Animation loop ── */
    const animate = () => {
      animId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);

      // Spawn smoke particles relative to mouse speed
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Always emit at least 1 particle, more when moving fast
      const count = Math.min(Math.floor(speed * 0.35) + 1, 5);
      for (let i = 0; i < count; i++) {
        // Interpolate spawn position between last & current
        const t = i / count;
        particles.push(new Particle(
          lastX + dx * t,
          lastY + dy * t,
          dx * 0.04,
          dy * 0.04
        ));
      }

      lastX += (mouseX - lastX) * 0.6;
      lastY += (mouseY - lastY) * 0.6;

      // Draw smoke particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.isDead()) { particles.splice(i, 1); continue; }
        p.draw(ctx);
      }

      // Draw cursor orb on top
      orb.draw(ctx);

      frame++;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",   /* never blocks clicks */
        zIndex: 9999,
      }}
    />
  );
}
