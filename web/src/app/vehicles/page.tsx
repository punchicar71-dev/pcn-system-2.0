'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VehicleCard from '../../components/VehicleCard';
import { VehicleCardData, VehicleBrand } from '@/lib/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleCardData[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (selectedFuelType) params.append('fuel', selectedFuelType);
      if (selectedTransmission) params.append('transmission', selectedTransmission);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands for filter dropdown
  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      
      const data = await response.json();
      setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchBrands();
  }, [selectedBrand, selectedFuelType, selectedTransmission, searchQuery, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const resetFilters = () => {
    setSelectedBrand('');
    setSelectedFuelType('');
    setSelectedTransmission('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
  };

  // Sample vehicles as fallback - will be removed after testing
  const sampleVehicles = [
    {
      id: 1,
      name: 'Suzuki ALTO',
      year: 2017,
      price: 5490000,
      fuelType: 'Petrol',
      transmission: 'Auto',
      rating: 4,
      daysAgo: 2,
      imageUrl: '/placeholder-car.jpg', // This will be replaced with actual S3 URLs
      condition: 'Excellent'
    },
    {
      id: 2,
      name: 'Suzuki CELERIO',
      year: 2015,
      price: 4500000,
      fuelType: 'Petrol',
      transmission: 'Auto',
      rating: 4,
      daysAgo: 4,
      imageUrl: '/placeholder-car.jpg',
      condition: 'Good'
    },
    {
      id: 3,
      name: 'Suzuki WAGON R PREMIUM',
      year: 2018,
      price: 6490000,
      fuelType: 'Petrol',
      transmission: 'Auto',
      rating: 4,
      daysAgo: 6,
      imageUrl: '/placeholder-car.jpg',
      condition: 'Excellent'
    },
    {
      id: 4,
      name: 'Honda VEZEL HYBRID',
      year: 2014,
      price: 9600000,
      fuelType: 'Petrol',
      transmission: 'Auto',
      rating: 5,
      daysAgo: 2,
      imageUrl: '/placeholder-car.jpg',
      condition: 'Excellent'
    },
    // Generate more vehicles for demonstration
    ...Array.from({ length: 8 }, (_, i) => ({
      id: i + 5,
      name: `Toyota ${['Aqua', 'Prius', 'Vitz', 'Allion'][i % 4]}`,
      year: 2015 + (i % 7),
      price: 3500000 + (i * 400000),
      fuelType: ['Hybrid', 'Petrol', 'Diesel'][i % 3],
      transmission: i % 2 === 0 ? 'Auto' : 'Manual',
      rating: 3 + (i % 3),
      daysAgo: 1 + (i % 10),
      imageUrl: '/placeholder-car.jpg',
      condition: i % 2 === 0 ? 'Excellent' : 'Good'
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search and Filter Section */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Search Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Find the best vehicle for you</h2>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search vehicles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 pr-12 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button 
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-md transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort and Results */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600 text-sm">Sort by: </span>
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-yellow-500 outline-none">
                <option>5 per page</option>
                <option>10 per page</option>
                <option>20 per page</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Year: Newest First</option>
              </select>
            </div>
            <div className="text-gray-700 font-semibold">
              {vehicles.length} Results Available
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Advance filters</h2>

                <div className="space-y-8">
                  {/* Condition Filter */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Condition</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            defaultChecked
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Registered</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Brand New</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Unregistered</span>
                      </label>
                    </div>
                  </div>



                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Fuel Type */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Fuel Type</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            defaultChecked
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Petrol</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Diesel</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">EV</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            defaultChecked
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Petrol +Hybrid</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            defaultChecked
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Diesel + Hybrid</span>
                      </label>
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Transmission */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Transmission</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Auto</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                          />
                        </div>
                        <span className="text-gray-700 font-medium">Manual</span>
                      </label>
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Manufacture Year */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Manufacture Year</h3>
                    <select className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none bg-white text-gray-700">
                      <option>2016</option>
                      <option>2017</option>
                      <option>2018</option>
                      <option>2019</option>
                      <option>2020</option>
                      <option>2021</option>
                      <option>2022</option>
                      <option>2023</option>
                      <option>2024</option>
                      <option>2025</option>
                    </select>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Country of Origin */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">County of origin</h3>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        Japan
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        India
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        Korea
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        Malaysia
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        Malaysia
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        German
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </aside>

            {/* Vehicle Results */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading vehicles...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-red-500">Error: {error}</div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">No vehicles found matching your criteria.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-1">
                  <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition text-sm">
                    Previous
                  </button>
                  <button className="w-8 h-8 bg-yellow-500 text-black rounded font-semibold text-sm">
                    1
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded transition text-sm">
                    2
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded transition text-sm">
                    3
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded transition text-sm">
                    4
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded transition text-sm">
                    5
                  </button>
                  <span className="px-2 text-gray-500 text-sm">...</span>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded transition text-sm">
                    11
                  </button>
                  <button className="px-3 py-2 text-gray-500 hover:text-gray-700 transition text-sm">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
