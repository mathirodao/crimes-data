import React from "react";
import { FaGithubSquare, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="w-full md:w-1/2 sm:pb-10 flex justify-center md:justify-start">
          <p className="text-sm md:text-base text-center md:text-left">
            This dashboard, developed by Mathias Rodao, showcases skills in data
            visualization and web development using fictional data. It features
            GeoJSON integration, API calls, chart rendering, filtering, and
            search.<br/> A custom API built with Python and Flask retrieves data from
            a MongoDB collection, powering the dashboard's dynamic visuals and
            functionalities, demonstrating full-stack integration.
          </p>
        </div>

        <div className="w-full md:w-1/2 sm:pt-10 flex justify-end">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <a
                href="mailto:mathirodao@gmail.com"
                className="flex items-center space-x-2 text-lg hover:underline"
              >
                <span>mathirodao@gmail.com</span>
                <FaEnvelope size={30} />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-lg hover:underline"
              >
                <span>Project repository</span>
                <FaGithubSquare size={30} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <p className="text-xs md:text-sm text-gray-400">
          Made with React and ❤️ by Mathias Rodao
        </p>
      </div>
    </footer>
  );
};

export default Footer;
