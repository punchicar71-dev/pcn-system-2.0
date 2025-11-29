import { Skeleton } from "@/components/ui/skeleton";

export default function VehicleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white bg-gray-50">
      {/* Hero Section Skeleton */}
      <div 
        className="relative bg-cover h-96 bg-center pt-16 bg-no-repeat"
        style={{ backgroundImage: "url('/detail_bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative max-w-7xl mx-auto pt-16">
          {/* Two Column Flex Layout */}
          <div className="flex bg-white border flex-col max-w-7xl lg:flex-row gap-2">
            {/* Left Column - Gallery Skeleton */}
            <div className="flex-1 p-4">
              <div className="relative">
                {/* Main Image Skeleton */}
                <Skeleton className="w-full h-[400px] rounded-lg" />
                
                {/* Overlay Buttons Skeleton */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-25 rounded p-1 flex gap-2">
                  <Skeleton className="w-20 h-10 rounded" />
                  <Skeleton className="w-24 h-10 rounded" />
                </div>
              </div>

              {/* Thumbnails Skeleton */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-24 h-20 rounded flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Right Column - Details Skeleton */}
            <div className="lg:w-96 p-6 bg-white space-y-4">
              {/* Brand Logo */}
              <Skeleton className="w-20 h-20 rounded" />
              
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>

              {/* Price */}
              <Skeleton className="h-10 w-1/2" />

              {/* Specs */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded" />
                <Skeleton className="h-12 w-full rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Options Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Options Section */}
            <div className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid md:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            </div>

            {/* Custom Options Section */}
            <div className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded" />
                ))}
              </div>
            </div>

            {/* Seller Info Section */}
            <div className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Leasing Calculator Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ))}
                <Skeleton className="h-12 w-full rounded mt-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Vehicles Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
