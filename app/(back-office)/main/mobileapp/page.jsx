"use client";
import React from "react";

export default function MobileApp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
      <div className="text-center">
        {/* Animated icon (phone / app) */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto animate-bounce">
            📱
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-green-700 mb-4">
          Mobile App
        </h1>

        {/* Animated Coming Soon */}
        <p className="text-xl font-semibold text-gray-700 animate-pulse">
          🚧 Coming Soon...
        </p>

        {/* Optional Subtext */}
        <p className="text-sm text-gray-500 mt-2">
          We're building a better mobile experience. Stay tuned!
        </p>
      </div>
    </div>
  );
}
