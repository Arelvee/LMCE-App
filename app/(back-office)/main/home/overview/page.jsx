import React from 'react';
import { FaMicrochip, FaReact, FaWater, FaTemperatureHigh, FaLeaf } from 'react-icons/fa';
import { SiFlask, SiSqlite, SiEspressif, SiPython, SiTensorflow, SiMongodb, SiDwavesystems, SiStatista } from 'react-icons/si';

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12 p-4 sm:p-6 ml-0 md:ml-20">
      <header className="text-center mb-12">
        <h2 className="text-2x1 md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-950 to-slate-800">
          Crop Yield Prediction Model for Indoor Lettuce Vertical Farm
        </h2>
        <p className="text-gray-600 mt-4 text-base md:text-lg">
          An advanced IoT-driven application leveraging AI and ML for crop monitoring in vertical farms.
        </p>
      </header>

      {/* Feature Section Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Project Background"
          description="An overview of challenges in agriculture and the importance of vertical farming to meet rising food demand."
          image="https://modernfarmer.com/wp-content/uploads/2018/07/aeroponics-768x512.jpg"
        />
        <FeatureCard
          title="Vertical Farming & Aeroponics"
          description="Using stacked layers and aeroponics to maximize crop yield, reduce resource usage, and support urban farming."
          image="https://kj1bcdn.b-cdn.net/media/40852/vertical-4.png"
        />
        <FeatureCard
          title="Tech Advancements in Aeroponics"
          description="Machine learning and AI enhance real-time growth monitoring, enabling predictive modeling with data like pH and temperature."
          image="https://wallpaperaccess.com/full/1426962.jpg"
        />
        <FeatureCard
          title="Wavelet Transform"
          description="Daubechies wavelet transforms outperform existing methods in predicting crop yield by offering better noise reduction and multi-resolution analysis, which improves the quality of sensor data readings. "
          image="https://www.researchgate.net/profile/Ramachandran_K_I2/publication/220218205/figure/fig4/AS:568882848952320@1512643648146/a-Daubechies-wavelet-functions-of-db1-db15.png"
        />
        <FeatureCard
          title="Neural Networks"
          description="Combining Daubechies wavelets and LSTM models for accurate crop growth predictions in vertical farms."
          image="https://th.bing.com/th/id/OIP.BvDsl3vUV0nCcCn1eFzphQHaFy?rs=1&pid=ImgDetMain"
        />
        <FeatureCard
          title="Internet of Things"
          description="The desired output of this system is the prediction of lettuce crop yield with sensor monitoring in a web application."
          image="https://gecdesigns.com/img/blog/iot/iot-02.jpg"
        />
      </section>

      {/* Objectives Section */}
      <section className="bg-gradient-to-r from-blue-50 to-green-50 p-6 md:p-8 rounded-lg shadow-lg">
        <h3 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Project Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ObjectiveCard
            title="Wireless Sensor Network"
            description="Creating a real-time monitoring network using ESP32 for environmental data tracking."
            icon={<SiEspressif className="text-green-600 text-3xl md:text-4xl" />}
          />
          <ObjectiveCard
            title="Automated Irrigation Control"
            description="Implementing a smart spray system to control water usage and optimize irrigation."
            icon={<FaWater className="text-blue-600 text-3xl md:text-4xl" />}
          />
          <ObjectiveCard
            title="Web App Development"
            description="Developing a web-based interface using Flask, React, and SQLite for data visualization and control."
            icon={<FaReact className="text-cyan-600 text-3xl md:text-4xl" />}
          />
          <ObjectiveCard
            title="Data Processing & Prediction"
            description="Using Daubechies wavelets for sensor data processing and crop yield predictions."
            icon={<FaTemperatureHigh className="text-red-600 text-3xl md:text-4xl" />}
          />
          <ObjectiveCard
            title="Advanced Neural Network Models"
            description="Building LSTM and XGBoost models for yield prediction in vertical farms."
            icon={<SiPython className="text-yellow-500 text-3xl md:text-4xl" />}
          />
          <ObjectiveCard
            title="Metrics and ISO/IEC 25010"
            description="Evaluate using ML Metrics, Functionality, Reliability and Portability."
            icon={<SiStatista className="text-red-800 text-3xl md:text-4xl" />}
          />
        </div>
      </section>

      {/* Challenges Section */}
      <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-4">
        <h3 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Challenges in Vertical Farming</h3>
        <p className="text-gray-700 leading-relaxed text-base md:text-lg">
          Despite the potential of vertical farming, it faces challenges such as high setup costs, energy demands for lighting and climate control, and technological
          requirements for efficient monitoring. Effective implementation requires robust systems for real-time data collection and automated control to manage resources sustainably.
        </p>
        <p className="text-gray-700 leading-relaxed text-base md:text-lg">
          Our project addresses these challenges by integrating IoT, AI, and ML to create an intelligent ecosystem that automates crop monitoring and yield prediction.
        </p>
      </section>

      {/* Advantages Section */}
      <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-4">
        <h3 className="text-xl md:text-2xl font-semibold text-green-700 mb-4">Advantages of IoT-Based Vertical Farming</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-base md:text-lg">
          <li>Increases crop yield with optimized space and resources.</li>
          <li>Enables year-round production independent of climate conditions.</li>
          <li>Minimizes water and nutrient use with precise monitoring and control.</li>
          <li>Reduces labor needs through automated systems for irrigation and lighting.</li>
          <li>Enhances food security and quality control by reducing dependence on imports.</li>
        </ul>
      </section>

      {/* Technologies Used Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 md:p-8 space-y-6">
        <h3 className="text-xl md:text-2xl font-semibold text-green-700">Technologies Used</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TechCard
            title="ESP32 Microcontroller"
            description="Used for data collection from sensors and wireless communication."
            icon={<SiEspressif className="text-green-600 text-3xl md:text-4xl" />}
          />
          <TechCard
            title="Flask & React"
            description="Flask for backend API, React for a responsive and interactive frontend."
            icon={<FaReact className="text-cyan-600 text-3xl md:text-4xl" />}
          />
          <TechCard
            title="SQLite Database"
            description="A lightweight, embedded database for data storage and retrieval."
            icon={<SiSqlite className="text-blue-700 text-3xl md:text-4xl" />}
          />
          <TechCard
            title="TensorFlow & Python"
            description="Used for implementing neural networks and machine learning models."
            icon={<SiPython className="text-yellow-500 text-3xl md:text-4xl" />}
          />
          <TechCard
            title="Daubechies Wavelet"
            description="Transforms sensor data for noise reduction and feature extraction."
            icon={<FaLeaf className="text-green-700 text-3xl md:text-4xl" />}
          />
          <TechCard
            title="PyWavelet"
            description="PyWavelets is open source wavelet transform software for Python."
            icon={<SiDwavesystems className="text-red-900 text-3xl md:text-4xl" />}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, image }) {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <img src={image} alt={title} className="w-full h-40 md:h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-lg md:text-xl font-semibold text-green-800 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm md:text-base mb-4">{description}</p>
        <button className="mt-auto self-start text-green-700 font-semibold hover:underline">Read More</button>
      </div>
    </div>
  );
}

function ObjectiveCard({ title, description, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex items-start space-x-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h5 className="text-lg md:text-xl font-semibold text-green-700">{title}</h5>
        <p className="text-gray-600 text-sm md:text-base mt-2">{description}</p>
      </div>
    </div>
  );
}

function TechCard({ title, description, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex items-start space-x-4">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h5 className="text-lg md:text-xl font-semibold text-green-800">{title}</h5>
        <p className="text-gray-600 text-sm md:text-base mt-2">{description}</p>
      </div>
    </div>
  );
}
