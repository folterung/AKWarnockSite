import React, { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed w-full bg-white/90 backdrop-blur-sm z-[60] border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold">
              AK WARNOCK
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="nav-link">
              Home
            </Link>
            
            {/* Books Dropdown */}
            <div className="relative group">
              <button className="nav-link">
                <Link href="/books">
                  Books
                </Link>
              </button>
              <div className="nav-dropdown">
                <Link href="/books/spirit-blessed-chronicles" className="nav-dropdown-item">
                  Spirit Blessed Chronicles
                </Link>
              </div>
            </div>

            {/* Games Dropdown */}
            <div className="relative group">
              <Link 
                href="/games" 
                className="nav-link"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('showDifficultySelector', 'true');
                  }
                }}
              >
                Games
              </Link>
              <div className="nav-dropdown">
                <Link 
                  href="/games/axiomata" 
                  className="nav-dropdown-item"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('showDifficultySelector', 'true');
                    }
                  }}
                >
                  Axiomata
                </Link>
              </div>
            </div>

            {/* About Dropdown */}
            <div className="relative group">
              <button className="nav-link">
                <Link href="/about">
                  About
                </Link>
              </button>
            </div>

            <Link href="/contact" className="nav-link">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 nav-link">
              Home
            </Link>
            <Link href="/books" className="block px-3 py-2 nav-link">
              Books
            </Link>
            <Link 
              href="/games" 
              className="block px-3 py-2 nav-link"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('showDifficultySelector', 'true');
                }
              }}
            >
              Games
            </Link>
            <Link href="/about" className="block px-3 py-2 nav-link">
              About
            </Link>
            <Link href="/contact" className="block px-3 py-2 nav-link">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  )
} 