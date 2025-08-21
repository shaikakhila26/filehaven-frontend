const Home = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🏠 Welcome to FileHaven</h1>
      <p className="text-gray-600 mb-6">Your personal cloud storage solution.</p>

      <h2 className="text-lg font-semibold mb-2">Suggested Files & Folders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Example placeholders */}
        <div className="p-4 bg-white shadow rounded">📄 Report.pdf</div>
        <div className="p-4 bg-white shadow rounded">📂 Projects</div>
        <div className="p-4 bg-white shadow rounded">📄 Resume.docx</div>
        <div className="p-4 bg-white shadow rounded">📂 Photos</div>
      </div>
    </div>
  );
};

export default Home;