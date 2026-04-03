import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import Logo from "./Logo";
import { useAuth } from "../lib/AuthContext";
import { logOut } from "../lib/firebase";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Loan Options", path: "/loan-options" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  const isAdmin = user?.email === "lesegokwamongwe@gmail.com";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Logo className="w-10 h-10" />
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Smooth Operations
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-emerald-600",
                    location.pathname === link.path
                      ? "text-emerald-600"
                      : "text-slate-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-emerald-600",
                    location.pathname === "/admin"
                      ? "text-emerald-600"
                      : "text-slate-600"
                  )}
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-8 ml-2">
                {user && (
                  <button
                    onClick={logOut}
                    className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                )}
                <Link
                  to="/apply"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-1"
                >
                  Apply Now <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium",
                    location.pathname === link.path
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium",
                    location.pathname === "/admin"
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-4 px-3 space-y-3">
                {user && (
                  <button
                    onClick={() => {
                      logOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                )}
                <Link
                  to="/apply"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Apply Now <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <span className="font-bold text-lg text-white">
                  Smooth Operations
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Providing quick, reliable, and flexible personal loans to South Africans when they need it most.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
                <li><Link to="/loan-options" className="hover:text-emerald-400 transition-colors">Loan Options</Link></li>
                <li><Link to="/apply" className="hover:text-emerald-400 transition-colors">Apply Now</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-emerald-400 transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                <li><a href="https://www.SmoothOperations.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="https://www.SmoothOperations.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📞 082 642 3178</li>
                <li>✉️ lesegokwamongwe@gmail.com</li>
                <li>🌐 <a href="https://www.SmoothOperations.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">www.SmoothOperations.com</a></li>
                <li>🏢 123 Financial District, Sandton, Johannesburg, 2196</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Smooth Operations. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Registered Credit Provider (NCRCP12345)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
