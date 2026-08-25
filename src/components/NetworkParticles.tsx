import React, { useEffect, useRef } from 'react';

export function NetworkParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const targetParticleCount = 45; // Moderado: ni muy pocos, ni demasiados
    const maxParticles = 75; // Límite máximo para que no se sature la pantalla
    const connectionDistance = 150;
    const mouseGrabDistance = 200;
    const speedMultiplier = 1.2; // Un poco más suave para que no maree

    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x?: number, y?: number) => ({
      x: x !== undefined ? x : Math.random() * canvas.width,
      y: y !== undefined ? y : Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2 * speedMultiplier,
      vy: (Math.random() - 0.5) * 2 * speedMultiplier,
      radius: Math.random() * 2.5 + 1 // Tamaño más moderado
    });

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < targetParticleCount; i++) {
        particles.push(createParticle());
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Color #00f3ff in RGB
      const colorRGB = '0, 243, 255';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRGB}, 0.9)`;
        ctx.fill();

        // Connect particles to each other
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            const opacity = (1 - (dist / connectionDistance)) * 0.9;
            ctx.strokeStyle = `rgba(${colorRGB}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect particle to mouse (Grab mode)
        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseGrabDistance) {
          ctx.beginPath();
          const opacity = (1 - (distMouse / mouseGrabDistance)) * 0.8;
          ctx.strokeStyle = `rgba(${colorRGB}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();
    
    const handleResize = () => resize();
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    
    const handleClick = (e: MouseEvent) => {
      // Push mode: add 2 particles at mouse location (menos exagerado)
      for (let i = 0; i < 2; i++) {
        particles.push(createParticle(e.clientX, e.clientY));
      }
      
      // Eliminar las partículas más antiguas si superamos el límite máximo
      while (particles.length > maxParticles) {
        particles.shift();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 1 }} />;
}
