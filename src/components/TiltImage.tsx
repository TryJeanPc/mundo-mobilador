import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export function TiltImage() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to rotation angles
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to values between -0.5 and 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Reset image to center when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center perspective-[1000px] z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d" 
        }}
        className="relative w-full h-full max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl"
      >
        {/* Placeholder image mimicking a character/robot */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] pointer-events-none"
          style={{ 
            backgroundImage: "url('/images/hero.png')",
            maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)"
          }} 
        />
        {/* Floating text/decorations for the 3D effect */}
        <motion.div 
          style={{ translateZ: "50px" }}
          className="absolute -right-4 top-1/4 bg-cyan-500/10 border border-cyan-400 text-cyan-400 px-3 py-1 text-xs font-mono backdrop-blur-sm"
        >
          SYS.READY
        </motion.div>
        <motion.div 
          style={{ translateZ: "80px" }}
          className="absolute -left-4 bottom-1/3 bg-cyan-500/10 border border-cyan-400 text-cyan-400 px-3 py-1 text-xs font-mono backdrop-blur-sm"
        >
          TRY JEAN PC
        </motion.div>
      </motion.div>
    </div>
  );
}
