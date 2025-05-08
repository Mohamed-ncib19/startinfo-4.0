import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, BookOpen, Trophy, Users, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
// Add any dropdown UI components you use, or use a simple menu

const Header = React.memo(function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const { user, logout } = useAuth(); // Ensure logout is available

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-robotics-blue" />
          <h1 className="text-xl font-bold text-foreground">
            Start<span className="text-robotics-orange">info</span>
          </h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/courses"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Courses</span>
          </Link>
          <Link
            to="/projects"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            <span>Projects</span>
          </Link>
          <Link
            to="/certifications"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            <span>Certifications</span>
          </Link>
          <Link
            to="/community"
            className="text-foreground/80 hover:text-foreground flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Community</span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          ) : (
            <div className="relative group">
              <Button className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.name?.[0] || 'U'}
                  </span>
                )}
                <span>{user.name || user.email}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-b border-border">
            <Link
              to="/courses"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground"
            >
              Courses
            </Link>
            <Link
              to="/projects"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground"
            >
              Projects
            </Link>
            <Link
              to="/certifications"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground"
            >
              Certifications
            </Link>
            <Link
              to="/community"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground"
            >
              Community
            </Link>
            <div className="pt-2 space-y-2">
              {!user && (
                <>
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" className="block w-full">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
})

export default Header;
