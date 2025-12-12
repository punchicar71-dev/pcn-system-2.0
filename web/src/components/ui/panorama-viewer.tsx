'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    pannellum: any;
  }
}

interface PanoramaViewerProps {
  imageUrl: string;
  width?: string;
  height?: string;
  className?: string;
}

export default function PanoramaViewer({ 
  imageUrl, 
  width = '100%', 
  height = '500px',
  className = ''
}: PanoramaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !viewerRef.current || !imageUrl) return;

    // Clean up existing viewer
    if (pannellumInstance.current) {
      try {
        pannellumInstance.current.destroy();
      } catch (e) {
        console.error('Error destroying viewer:', e);
      }
      pannellumInstance.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Initializing Pannellum with image:', imageUrl);

      pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: imageUrl,
        autoLoad: true,
        showControls: true,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        mouseZoom: true,
        draggable: true,
        autoRotate: 0,
        compass: false,
        hotSpotDebug: false,
        yaw: 0,
        pitch: 0,
        hfov: 100,
        minHfov: 50,
        maxHfov: 120,
      });

      // Handle load event
      pannellumInstance.current.on('load', () => {
        console.log('360 image loaded successfully');
        setIsLoading(false);
      });

      // Handle error event
      pannellumInstance.current.on('error', (err: any) => {
        console.error('Pannellum error:', err);
        setError('Failed to load 360° image');
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Error initializing panorama viewer:', err);
      setError('Failed to initialize 360° viewer');
      setIsLoading(false);
    }

    return () => {
      if (pannellumInstance.current) {
        try {
          pannellumInstance.current.destroy();
        } catch (e) {
          console.error('Error destroying viewer:', e);
        }
        pannellumInstance.current = null;
      }
    };
  }, [scriptLoaded, imageUrl]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
        onLoad={() => {
          console.log('Pannellum script loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Pannellum script');
          setError('Failed to load 360° viewer library');
        }}
      />
      
      <div style={{ width, height }} className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 rounded-lg">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading 360° view...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 z-10 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        <div 
          ref={viewerRef} 
          style={{ width: '100%', height: '100%' }} 
          className="rounded-lg overflow-hidden bg-black"
        />
      </div>
    </>
  );
}
