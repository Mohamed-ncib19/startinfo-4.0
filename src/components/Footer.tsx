import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Github, Twitter, Youtube, Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary pt-16 pb-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-8 w-8 text-robotics-blue" />
              <h2 className="text-xl font-bold">
                Start<span className="text-robotics-orange">info</span>
              </h2>
            </div>
            <p className="text-foreground/80 mb-6">
              Making robotics education fun, accessible, and engaging for young minds aged 12-18.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground/70 hover:text-robotics-blue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-robotics-blue transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-robotics-blue transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/70 hover:text-robotics-blue transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Courses
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Certifications
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  For Teachers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/80 hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-foreground/80 mb-4">
              Stay updated with the latest in robotics education.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="flex-grow" />
              <Button type="submit">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-foreground/70 mb-4 md:mb-0">
            © 2025 Startinfo Robotics. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="text-foreground/80 hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-foreground/80 hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-foreground/80 hover:text-foreground">
              Cookies
            </a>
            <a href="#" className="text-foreground/80 hover:text-foreground">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
