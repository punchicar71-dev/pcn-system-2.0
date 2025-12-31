'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import VehicleCard from '../../components/VehicleCard';
import BrandLogoMarquee from '../../components/BrandLogoMarquee';
import { VehicleCardData, VehicleBrand } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Vehicle Card Skeleton Component
const VehicleCardSkeleton = () => (
  <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden">
    <div className="flex flex-col lg:flex-row">
      {/* Image Skeleton */}
      <Skeleton className="w-full lg:w-[340px] h-[250px] lg:h-[240px] flex-shrink-0" />
      
      {/* Content Skeleton */}
      <div className="flex-1 p-5 lg:p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-3 lg:mb-3">
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-7 lg:h-9 w-3/4" />
            <Skeleton className="h-5 lg:h-7 w-1/4" />
          </div>
          <Skeleton className="h-4 lg:h-5 w-16 ml-3" />
        </div>
        
        <Skeleton className="h-8 lg:h-10 w-2/5 mb-5 lg:mb-6" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6 mt-auto">
          <div className="flex items-center gap-6 lg:gap-8">
            <div className="space-y-1.5">
              <Skeleton className="h-4 lg:h-5 w-16" />
              <Skeleton className="h-6 lg:h-7 w-20" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 lg:h-5 w-20" />
              <Skeleton className="h-6 lg:h-7 w-16" />
            </div>
          </div>
          
          <Skeleton className="h-12 lg:h-[50px] w-full lg:w-40 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Filter Section Skeleton Component
const FilterSkeleton = () => (
  <div className="space-y-6 p-6">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        {item < 4 && <hr className="border-gray-200 mt-6" />}
      </div>
    ))}
  </div>
);

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
  const [sortBy, setSortBy] = useState<string>('default');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Mobile filter dropdown state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sort vehicles function
  const sortVehicles = (vehicleList: VehicleCardData[], sortOption: string) => {
    const sorted = [...vehicleList];
    
    switch (sortOption) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'year-desc':
        return sorted.sort((a, b) => b.year - a.year);
      case 'year-asc':
        return sorted.sort((a, b) => a.year - b.year);
      case 'default':
      default:
        return sorted;
    }
  };

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
      if (selectedBrand) params.append('brand', selectedBrand); // Now sending brand ID
      if (selectedFuelType) params.append('fuel', selectedFuelType);
      if (selectedTransmission) params.append('transmission', selectedTransmission);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      
      // Add cache-busting timestamp
      params.append('_t', Date.now().toString());
      
      const response = await fetch(`/api/vehicles?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vehicles');
      }
      
      const data = await response.json();
      let fetchedVehicles = data.vehicles || [];
      
      // Apply sorting
      fetchedVehicles = sortVehicles(fetchedVehicles, sortBy);
      
      setVehicles(fetchedVehicles);
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
      const response = await fetch('/api/brands?inventoryOnly=true', {
        cache: 'no-store',
      });
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
      const response = await fetch('/api/countries?inventoryOnly=true', {
        cache: 'no-store',
      });
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

  // Apply sorting when sortBy changes
  useEffect(() => {
    setVehicles((prevVehicles) => sortVehicles(prevVehicles, sortBy));
  }, [sortBy]);

  // Reset to page 1 when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedFuelType, selectedTransmission, searchQuery, minPrice, maxPrice, selectedYear, selectedCountry, itemsPerPage]);

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

  // Pagination calculations
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = vehicles.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = maxVisiblePages;
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of vehicle list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative h-[320px] sm:h-[380px] md:h-[400px] lg:h-[450px] flex items-center overflow-hidden"
        style={{
          backgroundImage: "url('/vehicle_hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Content - Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-4 xl:px-0">
          <div className="text-left text-black max-w-xl mt-12 sm:mt-16 md:mt-20 lg:mt-[100px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl mb-3 lg:text-[40px] font-bold tracking-tight font-sinhala">
              මාලඹේ පුංචි කාර් නිවස
            </h1>
            {/* Subheading - Red */}
              <h2 className="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold mb-4 sm:mb-6 lg:mb-8 text-[#E4002B] font-sinhala">
                වාහන උද්‍යානය
              </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 font-sinhala leading-relaxed">
              වාහන ප්‍රදර්ශනාගාරයේ විකිණීමට ඇති සියලුම<br className="hidden sm:block" />
              වාහන මෙතනින් බලාගත හැක
            </p>
            <p className="text-[16px] md:text-[18px] mb-2 text-gray-700">
                  Open Everyday! <span className="font-semibold text-black ml-2">09:00AM – 06:00PM</span>
                </p>
            <p className="text-xs sm:text-sm md:text-base font-normal">
              Now Available <span className="font-bold text-red-600">{vehicles.length} Vehicles</span> in our vehicle park
            </p>
            
          </div>
        </div>
      </section>

    
     

<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
{/* Brand Logo Marquee */}
      <BrandLogoMarquee />
</div>
      

      {/* Main Content */}
      <div className="max-w-7xl border rounded-[12px] mx-auto mb-12 px-3 sm:px-4 lg:px-0">
        <div className="flex flex-col lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-[300px] flex-shrink-0">
            <div className="h-auto">
              {/* Filter Header with Toggle Button (Mobile/Tablet only) */}
              <div className="flex items-center justify-between p-4 sm:p-4 lg:block">
                <h2 className="text-sm sm:text-base lg:text-[16px] font-semibold text-gray-800">Advance filters</h2>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                  </span>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

                <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
 <hr className="border-gray-200" />
                  {/* Vehicle Brand */}
                  <div className='p-4 sm:p-4 space-y-3 sm:space-y-4'>
                    <h3 className="text-sm sm:text-base lg:text-[16px] font-normal text-gray-500">Vehicle Brand</h3>
                    <div className="flex flex-wrap gap-2">
                      {brands.map((brand) => (
                        <button 
                          key={brand.id}
                          onClick={() => setSelectedBrand(selectedBrand === brand.id.toString() ? '' : brand.id.toString())}
                          className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm lg:text-[14px] font-semibold transition-colors ${
                            selectedBrand === brand.id.toString()
                              ? 'bg-gray-800 text-white'
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
                  <div className='p-4 sm:p-4'>
                    <h3 className="text-sm sm:text-base lg:text-[16px] font-normal text-gray-500 mb-4 sm:mb-6">Fuel Type</h3>
                    <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
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
                          <span className="text-gray-900 text-sm sm:text-base lg:text-[16px] pb-1 item-center font-medium">{fuel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Transmission */}
                  <div className='p-4 sm:p-4'>
                    <h3 className="text-sm sm:text-base lg:text-[16px] font-normal text-gray-500 mb-4 sm:mb-6">Transmission</h3>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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
                          <span className="text-gray-900 text-sm sm:text-base lg:text-[16px] pb-1 item-center font-medium">{trans}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Separator */}
                  <hr className="border-gray-200" />

                  {/* Price Range */}
                  <div className='p-4 sm:p-4'>
                    <h3 className="text-sm sm:text-base lg:text-[16px] font-normal text-gray-500 mb-4 sm:mb-6">Price Range</h3>
                    <div className="space-y-4">
                      {/* Price Input Fields */}
                      <div className="flex w-[280px] items-center gap-3">
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
                          className="flex border w-[100px] border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
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
                  <div className='p-4 sm:p-4'> 
                    <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 mb-3 sm:mb-4">County of origin</h3>
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

            <div className="flex-1 lg:border-l">
              <div className="max-w-auto mx-auto p-4 sm:p-4">
          {/* Search Header */}
          <div className="text-start mb-4 sm:mb-4">
            <h2 className="text-sm sm:text-base lg:text-[16px] font-semibold text-gray-900 mb-2">Find the best vehicle for you</h2>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search vehicles..."
                onChange={(e) => debouncedSearch(e.target.value)}
                defaultValue={searchQuery}
                className="w-full border border-gray-300 bg-gray-50 rounded-[8px] px-3 sm:px-4 py-2.5 sm:py-2 pr-10 sm:pr-12 text-sm sm:text-base focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
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
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {(searchQuery || selectedBrand || selectedFuelType || selectedTransmission || minPrice || maxPrice || selectedYear || selectedCountry) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </form>

          {/* Sort and Results */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 sm:items-center">
            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center'>
              
              <div className='flex gap-0 items-center'>
                <span className="text-gray-600 text-xs sm:text-sm">Show: </span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-auto py-0 font-semibold border-none text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Per Page</SelectItem>
                    <SelectItem value="10">10 Per Page</SelectItem>
                    <SelectItem value="25">25 Per Page</SelectItem>
                    <SelectItem value="50">50 Per Page</SelectItem>
                    <SelectItem value="100">100 Per Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-gray-600 text-xs sm:text-[12px] lg:text-[14px] font-semibold">
              {isSearching ? (
                <span className="text-yellow-600">Searching...</span>
              ) : (
                <span>
                  Showing {startIndex + 1}-{Math.min(endIndex, vehicles.length)} of {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                </span>
              )}
            </div>
          </div>
        </div>
             
             
          {/* Separator */}
                  <hr className="border-gray-200" />

          {/* vehicle data */}
             
             <div className='p-4 sm:p-4'>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <VehicleCardSkeleton key={index} />
                  ))}
                </div>
              ) : isSearching ? (
                <div className="space-y-4">
                  {[...Array(itemsPerPage)].map((_, index) => (
                    <VehicleCardSkeleton key={index} />
                  ))}
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
                  {currentVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !isSearching && vehicles.length > 0 && totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 hover:text-gray-700 transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => {
                      if (page === -1 || page === -2) {
                        return (
                          <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-semibold text-xs sm:text-sm transition ${
                            currentPage === page
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 hover:text-gray-700 transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }
