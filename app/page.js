"use client"; // Mark this file as a client component

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons'; // Import the Facebook and Google icons
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import lettuceImage from "/public/bgcover.jpg"; // Adjust the path to your image
import Logo from "/public/logo.png";

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Initialize useRouter

  const handleLogin = (e) => {
    e.preventDefault();
    // Here, you would typically check the credentials
    console.log("Logging in with:", username, password);

    // After successful login, redirect to the dashboard
    router.push("/main/home/overview"); // Adjust the path to your dashboard
  };

  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Image Section */}
      <div className="flex-1 relative">
        <Image
          src={lettuceImage}
          alt="Lettuce Vertical Farming IOT"
          fill // Use fill instead of layout
          style={{ objectFit: 'cover' }} // Set the image to cover the container
        />
        <div className="absolute inset-0 bg-black opacity-30"></div> {/* Overlay for a modern look */}
      </div>

      {/* Right Side - Login Section */}
      <div className="flex items-center justify-center w-1/4 bg-gradient-to-b from-white shadow-md p-8 to-[rgba(45,188,45,0.5)]">
      <div className="w-full flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-6"> {/* Adjust the margin to control spacing */}
          <Image
            src={Logo}
            alt="Lettuce Logo"
            width={100} // Custom width
            height={100} // Custom height
            className="object-contain" // Ensure the image fits within the specified width and height
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-center text-green-900">
          LETTUCE MONITORING AND CROP YIELD ESTIMATION WEB APP
        </h2>


          <form onSubmit={handleLogin} className='w-full max-w-sm'>
            <div className='mb-4'>
              <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='username'>
                Username
              </label>
              <input
                type='text'
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                required
              />
            </div>

            <div className='mb-6'>
              <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='password'>
                Password
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                required
              />
            </div>

            <div className='flex items-center justify-between'>
              <button 
                type='submit' 
                className='bg-green-900 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              >
                Login
              </button>
              <Link 
                href="/forgot-password" 
                className='inline-block align-baseline font-bold text-sm text-green-500 hover:text-blue-800'
              >
                Forgot Password?
              </Link>
            </div>

            <div className='flex items-center mb-4 mt-4'>
              <hr className='flex-grow border-gray-300' />
              <span className='mx-2 text-gray-600'>or</span>
              <hr className='flex-grow border-gray-300' />
            </div>

            <div className='flex space-x-4 mb-4'>
              <button className='flex items-center bg-green-900 text-white px-4 py-2 rounded hover:bg-blue-700'>
                <FontAwesomeIcon icon={faFacebook} size="lg" />
                <span className='ml-2'>Login with Facebook</span>
              </button>
              <button className='flex items-center bg-green-900 text-white px-4 py-2 rounded hover:bg-red-700'>
                <FontAwesomeIcon icon={faGoogle} size="lg" />
                <span className='ml-2'>Login with Gmail</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
