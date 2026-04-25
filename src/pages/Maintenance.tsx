import logo from "@/assets/obsidian-logo.png";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <img src={logo} alt="Obsidian" className="w-24 h-24 rounded-full mx-auto mb-8 border-2 border-[#D4AF37]" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stranica je privremeno nedostupna
        </h1>
        <p className="text-gray-400 text-lg mb-6">
          Radimo na poboljšanjima. Vratićemo se uskoro!
        </p>
        <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full" />
        <p className="text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} Obsidian
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
