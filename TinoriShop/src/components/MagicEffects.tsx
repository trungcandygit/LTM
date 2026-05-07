"use client";
import React, { useEffect, useState } from "react";

const MagicEffects = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setTimeout(() => {
        setDotPos({ x: e.clientX, y: e.clientY });
      }, 50);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Tạo mảng các vị trí ngẫu nhiên để dàn đều icon
  const icons = [
    { top: '10%', left: '5%', size: '80px', delay: '0s', duration: '6s', pos: '0% 0%' },
    { top: '25%', left: '80%', size: '70px', delay: '2s', duration: '8s', pos: '50% 10%' },
    { top: '60%', left: '15%', size: '90px', delay: '1s', duration: '10s', pos: '10% 50%' },
    { top: '45%', left: '50%', size: '60px', delay: '3s', duration: '7s', pos: '90% 90%' },
    { top: '80%', left: '70%', size: '75px', delay: '0.5s', duration: '9s', pos: '20% 80%' },
    { top: '15%', left: '40%', size: '65px', delay: '4s', duration: '11s', pos: '80% 20%' },
    { top: '70%', left: '90%', size: '85px', delay: '1.5s', duration: '8.5s', pos: '40% 40%' },
    { top: '5%', left: '60%', size: '70px', delay: '2.5s', duration: '7.5s', pos: '70% 70%' },
  ];

  return (
    <>
      {/* Custom Cursor */}
      <div 
        className="custom-cursor hidden lg:block"
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />
      <div 
        className="custom-cursor-dot hidden lg:block"
        style={{ 
          left: `${dotPos.x}px`, 
          top: `${dotPos.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Floating Icons from User Image */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {icons.map((icon, index) => (
          <div
            key={index}
            className="absolute animate-float opacity-40"
            style={{
              top: icon.top,
              left: icon.left,
              width: icon.size,
              height: icon.size,
              backgroundImage: 'url("/brand/floating-icons.png")',
              backgroundSize: '300%', // Phóng to để lấy từng icon đơn lẻ
              backgroundPosition: icon.pos,
              backgroundRepeat: 'no-repeat',
              animationDelay: icon.delay,
              animationDuration: icon.duration,
            }}
          />
        ))}
      </div>
    </>
  );

};

export default MagicEffects;
