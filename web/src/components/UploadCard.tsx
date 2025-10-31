'use client';

import { CheckCircle, Upload, FileUp, Image as ImageIcon } from 'lucide-react';

interface UploadCardProps {
  type: 'gallery' | 'images360' | 'documents';
  title: string;
  description: string;
  requirements: string[];
  icon: React.ReactNode;
  headerColor: string;
  borderColor: string;
  hoverBgColor: string;
  onDrop?: (files: FileList) => void;
}

export default function UploadCard({
  type,
  title,
  description,
  requirements,
  icon,
  headerColor,
  borderColor,
  hoverBgColor,
  onDrop,
}: UploadCardProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-current');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-current');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-current');
    if (onDrop && e.dataTransfer.files) {
      onDrop(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onDrop && e.target.files) {
      onDrop(e.target.files);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
      <div className={`h-40 bg-gradient-to-br ${headerColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Upload size={24} className={`${type === 'gallery' ? 'text-[#F5A623]' : type === 'images360' ? 'text-blue-500' : 'text-purple-500'}`} />
          {title}
        </h3>
        <p className="text-slate-600 mb-6">
          {description}
        </p>
        <div className="space-y-3 mb-6">
          {requirements.map((req, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
              <span className="text-sm text-slate-700">{req}</span>
            </div>
          ))}
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed ${borderColor} rounded-lg p-6 text-center hover:${hoverBgColor} transition cursor-pointer`}
        >
          <input
            type="file"
            multiple
            accept={type === 'documents' ? '.pdf,.jpg,.jpeg,.png' : 'image/*'}
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${type}`}
          />
          <label htmlFor={`upload-${type}`} className="cursor-pointer block">
            {type === 'gallery' && (
              <>
                <ImageIcon size={40} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Drag & drop images here or click to browse</p>
              </>
            )}
            {type === 'images360' && (
              <>
                <div className="text-blue-400 mx-auto mb-2 text-3xl">⟲</div>
                <p className="text-sm text-slate-600">Drop 360 images here or click to browse</p>
              </>
            )}
            {type === 'documents' && (
              <>
                <FileUp size={40} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Upload documents here or click to browse</p>
              </>
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
