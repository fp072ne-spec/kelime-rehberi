export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 65 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    size: Math.random() * 8 + 4,
    color: ['#0d7355', '#16a37f', '#22c59b', '#f59e0b', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2.5,
    rot: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 6
  }));

  let frames = 0;
  function step() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frames++;
    if (frames < 110) {
      requestAnimationFrame(step);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(step);
}
