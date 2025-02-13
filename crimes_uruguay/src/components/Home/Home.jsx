import React, { useEffect, useRef, useState } from "react";
import LineChart from "../CrimesCharts/LineChart";
import BarChart from "../CrimesCharts/BarChart";
import HistogramChart from "../CrimesCharts/HistogramChart";
import Map from "../CrimesCharts/Map";
import CrimeSearch from "../CrimeSearch/CrimeSearch";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const Home = () => {
  const sectionRefs = useRef([]);
  const [isInView, setIsInView] = useState([false, false, false, false, false]); 

  const handleScrollFallback = () => {
    sectionRefs.current.forEach((ref, index) => {
      if (ref && !isInView[index]) {
        const rect = ref.getBoundingClientRect();
        const elementInView = rect.top < window.innerHeight && rect.bottom >= 0; 
        if (elementInView) {
          setIsInView((prev) => {
            const newState = [...prev];
            newState[index] = true; 
            return newState;
          });
        }
      }
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollFallback);
    handleScrollFallback(); 
    return () => {
      window.removeEventListener("scroll", handleScrollFallback);
    };
  }, []);

  return (
    <div className={`w-full justify-center items-center bg-black transition-opacity duration-500 ${
            isInView[0] ? "animate-fadeIn" : "opacity-0"
          }`}>
      {/* Contenedor principal */}
      <Header />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 px-7 ">
        {/* Columna 1 */}
        <div
          className={`text-black p-4 flex justify-center items-center card icon`}
          ref={(el) => (sectionRefs.current[0] = el)}
        >
          <LineChart />
        </div>
        {/* Columna 2 */}
        <div
          className={`text-black p-4 flex justify-center items-center card icon`}
          ref={(el) => (sectionRefs.current[1] = el)}
        >
          <BarChart />
        </div>
        {/* Columna 3 */}
        <div
          className={`text-black p-4 flex justify-center items-center card icon`}
          ref={(el) => (sectionRefs.current[2] = el)}
        >
          <HistogramChart />
        </div>
      </div>
      <div className="w-full grid grid-cols-1 p-4 gap-4 px-7 flex">
        <div
          className={`w-full h-full card gap-4 transition-opacity duration-500 ${
            isInView[3] ? "animate-fadeIn" : "opacity-0"
          }`}
          ref={(el) => (sectionRefs.current[3] = el)}
        >
          <Map />
        </div>
        <div
          className={`text-black p-4 flex justify-center items-center card transition-opacity duration-500 ${
            isInView[4] ? "animate-fadeIn" : "opacity-0"
          }`}
          ref={(el) => (sectionRefs.current[4] = el)}
        >
          <CrimeSearch />
        </div>
      </div>
      <div className={"px-7"}>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
