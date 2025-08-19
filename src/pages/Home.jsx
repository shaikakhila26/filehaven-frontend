const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 to-white-100 flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white">
        

        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="FileHaven Logo" className="h-8 rounded-lg" />
          <h1 className="text-2xl font-bold text-blue-700">FileHaven</h1>
        </div>
        
        <nav className="flex gap-6 text-gray-800 font-medium">
          
          <a href="/login" className="hover:text-blue-600">Login</a>
          <a href="/register" className="hover:text-blue-600">Register</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 leading-tight">
          Secure & Simple <span className="text-blue-600">Cloud Storage</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-10">
          Store, share, and access your files from anywhere.  
          FileHaven makes file management as easy as possible, powered by modern security.
        </p>

        <div className="flex gap-6">
          <a
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Get Started
          </a>
          
        </div>
      </main>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 px-10 py-16 bg-white">
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2 text-blue-700">📂 Easy File Management</h3>
          <p className="text-gray-600">
            Upload, organize, and manage your files with a clean and intuitive interface.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2 text-blue-700">🔒 Secure Sharing</h3>
          <p className="text-gray-600">
            Share files safely with links and permission controls tailored to your needs.
          </p>
        </div>
        <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-2 text-blue-700">⚡ Fast Access</h3>
          <p className="text-gray-600">
            Access your files from anywhere with blazing-fast load times and real-time sync.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 border-t mt-auto">
        © {new Date().getFullYear()} FileHaven. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
