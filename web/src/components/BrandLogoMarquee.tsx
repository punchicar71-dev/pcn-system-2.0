'use client';

import Image from 'next/image';

const brandLogos = [
  'Audi.png',
  'BMW.png',
  'Bentley.png',
  'Chery.png',
  'Chevrolet.png',
  'Honda.png',
  'Isuzu.png',
  'Jaguar.png',
  'Jeep.png',
  'Land Rover.png',
  'Lexus.png',
  'Maybach.png',
  'Mazda.png',
  'Mercedes Benz.png',
  'Mini.png',
  'Mitsubishi.png',
  'Nissan.png',
  'Peugeot.png',
  'Renault.png',
  'Subaru.png',
  'Suzuki.png',
  'Tata.png',
  'Toyota.png',
  'Volkswagen.png',
  'Volvo.png',
];

export default function BrandLogoMarquee() {
  return (
    <div className="w-full bg-white py-4 overflow-hidden">
      <div className="relative">
        {/* Gradient overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

        {/* Marquee Container */}
        <div className="flex animate-marquee hover:pause-marquee">
          {/* First set of logos */}
          <div className="flex items-center gap-6 px-6">
            {brandLogos.map((logo, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0  transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <Image
                  src={`/brand_logo/${logo}`}
                  alt={logo.replace('.png', '')}
                  width={120}
                  height={60}
                  className="object-contain h-20 w-auto px-6"
                />
              </div>
            ))}
          </div>

          {/* Duplicate set for seamless loop */}
          <div className="flex items-center gap-12 px-6">
            {brandLogos.map((logo, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <Image
                  src={`/brand_logo/${logo}`}
                  alt={logo.replace('.png', '')}
                  width={120}
                  height={60}
                  className="object-contain h-16 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS for animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 60s linear infinite;
        }

        .pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
