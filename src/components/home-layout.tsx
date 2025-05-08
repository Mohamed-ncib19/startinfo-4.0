import { Button } from '@/components/ui/button';
import { Link, Outlet } from 'react-router-dom';
import Footer from '@/components/Footer';

export function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header with login/signup buttons */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">
            ArduinoHub
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
} 