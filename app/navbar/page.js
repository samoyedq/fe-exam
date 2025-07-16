"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NavbarPage() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-7">
            {/* Logo */}
            <div>
              <h1 className="text-2xl font-bold text-white">
                Exam <span className="text-teal-400">track</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <button className="text-gray-300 hover:text-white text-sm transition-colors">
                  My Request
                </button>
                <button className="text-gray-300 hover:text-white text-sm transition-colors">
                  Administration Tools
                </button>
              </div>
              
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.employee?.firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">My Account</span>
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white focus:outline-none focus:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 pt-4 pb-3">
              <div className="flex flex-col space-y-3">
                <button className="text-gray-300 hover:text-white text-sm text-left px-3 py-2 transition-colors">
                  My Request
                </button>
                <button className="text-gray-300 hover:text-white text-sm text-left px-3 py-2 transition-colors">
                  Administration Tools
                </button>
                
                {user && (
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.employee?.firstName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">My Account</span>
                      <svg
                        className="w-4 h-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors mx-3"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>


    </div>
  );
}