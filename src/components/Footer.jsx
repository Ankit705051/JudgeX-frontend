import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-[#050B14] border-t border-slate-800">

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">

        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Your next offer starts with one problem.
        </h2>

        <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto">
          Join 1.2M+ developers leveling up daily.
          Free forever — premium tracks when you're ready.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

          <button className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition">
            Create your free account
          </button>

          <button className="px-8 py-4 border border-slate-700 hover:bg-slate-900 text-white rounded-xl transition">
            See Pricing
          </button>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
              <span className="font-bold text-black">{`{}`}</span>
            </div>

            <h3 className="text-2xl font-bold text-white">
              Judge<span className="text-yellow-500">X</span>
            </h3>
          </div>

          {/* Copyright */}
          <p className="text-slate-500 text-sm">
            © 2026 JudgeX. Built for engineers, by engineers.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-5 text-slate-400 text-xl">
            <a href="#" className="hover:text-white transition">
              <FaXTwitter />
            </a>

            <a href="#" className="hover:text-white transition">
              <FaGithub />
            </a>

            <a href="#" className="hover:text-white transition">
              <FaLinkedin />
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;