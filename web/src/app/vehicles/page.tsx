'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import VehicleCard from '../../components/VehicleCard';
import BrandLogoMarquee from '../../components/BrandLogoMarquee';
import { VehicleCardData, VehicleBrand } from '@/lib/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleCardData[]>([]);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [countries, setCountries] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch vehicles from API
  const fetchVehicles = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsSearching(true);
      }
      
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedBrand) params.append('brand', selectedBrand);
      if (selectedFuelType) params.append('fuel', selectedFuelType);
      if (selectedTransmission) params.append('transmission', selectedTransmission);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vehicles');
      }
      
      const data = await response.json();
      setVehicles(data.vehicles || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Fetch error:', errorMessage);
      setVehicles([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setIsSearching(false);
      }
    }
  };

  // Debounced search function
  const debouncedSearch = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, 300);
  };

  // Fetch brands for filter dropdown
  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands?inventoryOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      
      const data = await response.json();
      setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  // Fetch countries for filter dropdown
  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries?inventoryOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      
      const data = await response.json();
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBrands();
    fetchCountries();
    fetchVehicles(true); // Pass true for initial load
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchVehicles();
  }, [selectedBrand, selectedFuelType, selectedTransmission, searchQuery, minPrice, maxPrice, selectedYear, selectedCountry]);

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
    setSelectedYear('');
    setSelectedCountry('');
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative h-[400px] flex items-end pb-16 justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/vehicle_page_hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
       
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-90">
            ALL VEHICLE
          </p>
          <h1 className="text-5xl font-semibold mb-4 tracking-tight">
            Punch Car Niwasa
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="font-normal">Vehicle Park ,</span>
            <span className="font-bold text-yellow-400">Malabe</span>
          </div>
          <p className="mt-6 text-base font-light">
            Now Available <span className="font-bold text-yellow-400">{vehicles.length} vehicles</span> in our vehicle park
          </p>
        </div>
      </section>

    
     

<div className='max-w-[1200px] mx-auto  border-b '>
{/* Brand Logo Marquee */}
      <BrandLogoMarquee />
</div>
      

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto ">
        <div className="flex border-b mb-10">
          {/* Filters Sidebar */}
          <aside className="w-[300px] flex-shrink-0">
            <div className=" border-r py-6 ">
              <h2 className="text-[16px] font-semibold text-gray-800 mb-6">Advance filters</h2>

                <div className="space-y-8">
 <hr className="border-gray-200" />
                  {/* Vehicle Brand */}
                  <div>
                    <h3 className="text-[16px] font-normal text-gray-500 mb-6">Vehicle Brand</h3>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
                        <button 
                          key={brand.id}
                          onClick={() => setSelectedBrand(selectedBrand === brand.name ? '' : brand.name)}
                          className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors ${
                            selectedBrand === brand.name
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Fuel Type */}
                  <div>
                    <h3 className="text-[16px] font-normal text-gray-500 mb-6">Fuel Type</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 ">
                      {['Petrol', 'Diesel', 'EV', 'Petrol + Hybrid', 'Diesel + Hybrid'].map((fuel) => (
                        <label key={fuel} className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={selectedFuelType === fuel}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFuelType(fuel)
                                } else {
                                  setSelectedFuelType('')
                                }
                              }}
                              className="w-4 h-4 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                            />
                          </div>
                          <span className="text-gray-900 text-[16px] pb-1 item-center font-medium">{fuel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Transmission */}
                  <div>
                    <h3 className="text-[16px] font-normal text-gray-500 mb-6">Transmission</h3>
                    <div className=" flex flex-wrap items-center gap-6">
                      {['Automatic', 'Manual', 'Auto'].map((trans) => (
                        <label key={trans} className="flex items-center gap-3 cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              checked={selectedTransmission === trans}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTransmission(trans)
                                } else {
                                  setSelectedTransmission('')
                                }
                              }}
                              className="w-4 h-4 rounded border-2 border-gray-300 text-black focus:ring-0 focus:ring-offset-0 checked:bg-black checked:border-black"
                            />
                          </div>
                          <span className="text-gray-900 text-[16px] pb-1 font-medium">{trans}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Price Range */}
                  <div className='max-w-[280px]'>
                    <h3 className="text-[16px]  font-normal text-gray-500 mb-6">Price Range</h3>
                    <div className="space-y-4">
                      {/* Price Input Fields */}
                      <div className="flex  items-center gap-3">
                        <input
                          type="number"
                          placeholder="500000"
                          value={minPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!maxPrice || !val || parseInt(val) <= parseInt(maxPrice)) {
                              setMinPrice(val);
                            }
                          }}
                          className="flex border max-w-[120px] border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="100000000"
                          value={maxPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!minPrice || !val || parseInt(val) >= parseInt(minPrice)) {
                              setMaxPrice(val);
                            }
                          }}
                          className="flex border max-w-[120px] border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                        />
                      </div>
                      
                      {/* Dual Range Slider */}
                      <div className="relative h-2 pt-6 pb-6">
                        {/* Track Background */}
                        <div className="absolute w-full h-2 bg-gray-200 rounded-full top-6"></div>
                        
                        {/* Active Range */}
                        <div 
                          className="absolute h-2 bg-gradient-to-r from-teal-400 to-green-600 rounded-full top-6"
                          style={{
                            left: `${((parseInt(minPrice || '500000') - 500000) / (100000000 - 500000)) * 100}%`,
                            right: `${100 - ((parseInt(maxPrice || '100000000') - 500000) / (100000000 - 500000)) * 100}%`
                          }}
                        ></div>
                        
                        {/* Min Price Slider */}
                        <input
                          type="range"
                          min="500000"
                          max="100000000"
                          step="100000"
                          value={minPrice || '500000'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!maxPrice || parseInt(val) <= parseInt(maxPrice)) {
                              setMinPrice(val);
                            }
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto top-6"
                          style={{
                            zIndex: minPrice && maxPrice && (parseInt(maxPrice) - parseInt(minPrice)) < 5000000 ? 5 : 3
                          }}
                        />
                        
                        {/* Max Price Slider */}
                        <input
                          type="range"
                          min="500000"
                          max="100000000"
                          step="100000"
                          value={maxPrice || '100000000'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!minPrice || parseInt(val) >= parseInt(minPrice)) {
                              setMaxPrice(val);
                            }
                          }}
                          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-auto top-6"
                          style={{
                            zIndex: 4
                          }}
                        />
                      </div>
                      
                      {/* Price Labels */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Rs. {parseInt(minPrice || '500000').toLocaleString()}</span>
                        <span>Rs. {parseInt(maxPrice || '100000000').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add custom styles for the range slider */}
                  <style jsx>{`
                    input[type="range"] {
                      -webkit-appearance: none;
                      appearance: none;
                      background: transparent;
                      pointer-events: none;
                    }
                    
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background: white;
                      border: 2px solid #02050aff;
                      cursor: pointer;
                      pointer-events: auto;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    input[type="range"]::-moz-range-thumb {
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background: white;
                      border: 2px solid #000000ff;
                      cursor: pointer;
                      pointer-events: auto;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    
                    input[type="range"]::-webkit-slider-thumb:hover {
                      background: #eff6ff;
                    }
                    
                    input[type="range"]::-moz-range-thumb:hover {
                      background: #eff6ff;
                    }
                  `}</style>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  

                  {/* Country of Origin */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">County of origin</h3>
                    <div className="flex flex-wrap gap-2">
                      {countries.map((country) => (
                        <button 
                          key={country.id}
                          onClick={() => setSelectedCountry(selectedCountry === country.name ? '' : country.name)}
                          className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors ${
                            selectedCountry === country.name
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {country.name}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </aside>

            {/* Vehicle Results */}

            <div className="flex-1 pt-6 ">
              <div className="max-w-auto mx-auto pl-6 ">
          {/* Search Header */}
          <div className="text-start mb-6">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-2">Find the best vehicle for you</h2>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search vehicles by brand or model..."
                onChange={(e) => debouncedSearch(e.target.value)}
                defaultValue={searchQuery}
                className="w-full border border-gray-300 rounded-full px-4 py-2 pr-12 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    debouncedSearch('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-700"
                  title="Clear search"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {isSearching && !searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin">
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              )}
              {!isSearching && !searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {(searchQuery || selectedBrand || selectedFuelType || selectedTransmission || minPrice || maxPrice || selectedYear || selectedCountry) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </form>

          {/* Sort and Results */}
          <div className="flex justify-between  items-center pb-4">
            <div className='flex gap-4 items-center'>
              <span className="text-gray-600 text-sm">Sort by: </span>
              <select className=" text-sm  ">
                <option>5 per page</option>
                <option>10 per page</option>
                <option>20 per page</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Year: Newest First</option>
              </select>
            </div>
            <div className="text-gray-600 text-[14px] font-semibold">
              {isSearching ? (
                <span className="text-yellow-600">Searching...</span>
              ) : (
                <span>
                  {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Available
                </span>
              )}
            </div>
          </div>
        </div>
             
             
          {/* Separator */}
                  <hr className="border-gray-200 py-4" />

          {/* vehicle data */}
             
             <div className='pl-6'>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                      <svg className="w-6 h-6 animate-spin text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="text-gray-500">Loading vehicles...</div>
                  </div>
                </div>
              ) : isSearching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                      <svg className="w-6 h-6 animate-spin text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="text-gray-500">Searching vehicles...</div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-red-500 font-medium">Error loading vehicles</div>
                    <div className="text-gray-500 text-sm mt-2">{error}</div>
                    <button
                      onClick={() => fetchVehicles(false)}
                      className="mt-3 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-gray-600 font-medium">No vehicles found</div>
                    <div className="text-gray-500 text-sm mt-2">
                      {searchQuery 
                        ? `Try adjusting your search criteria`
                        : `No vehicles available at the moment`
                      }
                    </div>
                  </div>
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
                  <button className="w-8 h-8 bg-gray-900 text-white rounded-full font-semibold text-sm">
                    1
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full transition text-sm">
                    2
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full transition text-sm">
                    3
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full transition text-sm">
                    4
                  </button>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full transition text-sm">
                    5
                  </button>
                  <span className="px-2 text-gray-500 text-sm">...</span>
                  <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-full transition text-sm">
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
      </div>
    );
  }
