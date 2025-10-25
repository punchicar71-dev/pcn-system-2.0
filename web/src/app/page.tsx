export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Punchi Car Niwasa</h1>
          <p className="text-xl mb-2">Vehicle Park, Malabe</p>
          <p className="text-lg mb-8">
            When choosing a vehicle from a dealership with 400 options
          </p>
          <a
            href="/vehicles"
            className="inline-block bg-yellow-500 text-black px-8 py-3 rounded-md font-semibold hover:bg-yellow-600 transition"
          >
            All Vehicles
          </a>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 -mt-10">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Find the best vehicle for you</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search vehicles"
                className="border rounded-md px-4 py-2"
              />
              <select className="border rounded-md px-4 py-2">
                <option>Select Brands</option>
              </select>
              <select className="border rounded-md px-4 py-2">
                <option>Select Model</option>
              </select>
              <button className="bg-yellow-500 text-black px-6 py-2 rounded-md font-semibold hover:bg-yellow-600 transition">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Vehicles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Latest vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Vehicle cards will go here */}
            <div className="border rounded-lg p-4">
              <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
              <h3 className="font-bold text-lg">Vehicle Name</h3>
              <p className="text-sm text-gray-600">2014</p>
              <p className="font-bold text-green-600 mt-2">Rs. 9,890,000</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
