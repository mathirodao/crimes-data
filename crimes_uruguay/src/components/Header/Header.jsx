import React, { useEffect, useRef } from "react";
import { FaGithubSquare } from "react-icons/fa";


const Header = () => {
  const headerRef = useRef(null);

useEffect(() => {
  if (!headerRef.current) return; 

  if (typeof window !== "undefined" && typeof window.VANTA !== "undefined") {
    const vantaEffect = window.VANTA.GLOBE({
      el: headerRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 150.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x3c74c5,
      size: 1.5,
      backgroundColor: 0x0,
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }
}, []);

  return (
    <header ref={headerRef} className="relative h-[50vh] flex p-4 items-center text-white mb-8">
      <div className="text-left z-10">
        <h1 className="text-5xl font-bold mb-4">CRIMES DATA - URUGUAY</h1>
        <p className="text-xl mb-4">
          The data presented is hypothetical and generated for demonstration
          purposes.
        </p>
        <a
          href="https://github.com/mathirodao/crimes-data"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-white text-lg hover:underline pt-10 icon"
        >
          <span>Project repository</span> 
          <FaGithubSquare size={30} /> 
        </a>
      </div>
    </header>
  );
};

export default Header;
