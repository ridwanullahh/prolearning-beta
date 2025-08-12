import { GraduationCap, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-50/50 text-gray-800 dark:bg-gray-900 dark:text-gray-300 overflow-x-hidden">
      <div className="container mx-auto px-4 py-16 md:px-6 max-w-7xl">
        {/* Modern 2-column responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 min-w-0">
          {/* Brand and summary */}
          <div>
            <Link to="/" className="mb-6 flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ProLearning
              </span>
            </Link>
            <p className="max-w-md text-gray-600 dark:text-gray-400">
              The future of personalized education, powered by AI.
            </p>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 min-w-0">
            <div className="min-w-0">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Platform</h4>
              <ul className="space-y-3">
                <li><FooterLink href="/marketplace">Marketplace</FooterLink></li>
                <li><FooterLink href="/features">Features</FooterLink></li>
                <li><FooterLink href="/blog">Blog</FooterLink></li>
                <li><FooterLink href="/contact">Contact</FooterLink></li>
                <li><FooterLink href="/become-instructor">Become an Instructor</FooterLink></li>
              </ul>
            </div>
            <div className="min-w-0">
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Company</h4>
              <ul className="space-y-3">
                <li><FooterLink href="/about">About Us</FooterLink></li>
                <li><FooterLink href="/careers">Careers</FooterLink></li>
                <li><FooterLink href="/press">Press</FooterLink></li>
                <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
                <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              &copy; {new Date().getFullYear()} ProLearning. All rights reserved.
            </p>
            <div className="flex gap-6 flex-shrink-0">
              <SocialLink href="#"><Facebook className="h-6 w-6" /></SocialLink>
              <SocialLink href="#"><Twitter className="h-6 w-6" /></SocialLink>
              <SocialLink href="#"><Instagram className="h-6 w-6" /></SocialLink>
              <SocialLink href="#"><Linkedin className="h-6 w-6" /></SocialLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          scrollTo(href.substring(1));
        }}
        className="text-gray-600 transition-colors hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={href}
      className="text-gray-600 transition-colors hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
    >
      {children}
    </Link>
  );
};

const SocialLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-500 transition-colors hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
  >
    {children}
  </a>
);

export default Footer;