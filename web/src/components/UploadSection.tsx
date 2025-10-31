'use client';

import Link from 'next/link';
import { Upload, Image as ImageIcon, FileUp } from 'lucide-react';
import UploadCard from './UploadCard';

export default function UploadSection() {
  const handleUpload = (type: string) => (files: FileList) => {
    console.log(`${type} files:`, files);
    // Handle upload logic here
  };

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Want to Sell Your Vehicle?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your vehicle images and documents to get started with our hassle-free selling process
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Gallery Images Upload */}
          <UploadCard
            type="gallery"
            title="Vehicle Images"
            description="Upload clear photos of your vehicle from multiple angles. Include exterior, interior, dashboard, and engine bay."
            requirements={[
              'High-quality photos recommended',
              'Min 6-10 images',
              'JPG, PNG format'
            ]}
            icon={<ImageIcon size={64} className="text-white opacity-80" />}
            headerColor="from-[#F5A623] to-[#E09615]"
            borderColor="border-slate-300"
            hoverBgColor="bg-orange-50"
            onDrop={handleUpload('gallery')}
          />

          {/* 360 Images Upload */}
          <UploadCard
            type="images360"
            title="360° View Images"
            description="Upload 12-24 sequential images for an interactive 360-degree vehicle view experience."
            requirements={[
              'Sequential photos',
              '12-24 images optimal',
              'Same dimensions preferred'
            ]}
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white opacity-80">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0" />
                <path d="M12 6v-2m0 16v-2m-6-6h-2m16 0h-2" />
              </svg>
            }
            headerColor="from-blue-500 to-blue-600"
            borderColor="border-blue-300"
            hoverBgColor="bg-blue-50"
            onDrop={handleUpload('images360')}
          />

          {/* Documents Upload */}
          <UploadCard
            type="documents"
            title="Registration & Documents"
            description="Upload vehicle registration, CR book, emission tests, and other important documents."
            requirements={[
              'CR book required',
              'Clear, legible copies',
              'PDF or image formats'
            ]}
            icon={<FileUp size={64} className="text-white opacity-80" />}
            headerColor="from-purple-500 to-purple-600"
            borderColor="border-purple-300"
            hoverBgColor="bg-purple-50"
            onDrop={handleUpload('documents')}
          />
        </div>

        {/* Upload Process Flow */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Simple 3-Step Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Upload Images & Documents',
                description: 'Start by uploading your vehicle photos and registration documents'
              },
              {
                step: 2,
                title: 'Quick Verification',
                description: 'Our team reviews your submission and verifies the information'
              },
              {
                step: 3,
                title: 'Get Listed',
                description: 'Your vehicle appears on our marketplace for potential buyers'
              }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#F5A623] text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-slate-600">{item.description}</p>
                  </div>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-6 -right-12 text-3xl text-slate-300">→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#F5A623] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#E09615] transition shadow-lg hover:shadow-xl"
          >
            <Upload size={20} />
            Start Selling Your Vehicle
          </Link>
          <p className="mt-4 text-slate-600">
            Questions? <Link href="/help-guide" className="text-[#F5A623] hover:text-[#E09615] font-semibold">View our Help Guide</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
