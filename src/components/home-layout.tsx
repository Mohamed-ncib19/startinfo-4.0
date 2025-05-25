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

        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
} 