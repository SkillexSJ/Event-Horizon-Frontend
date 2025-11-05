import { Link } from "react-router";
import {
  MapPin,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Sparkles,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-grid border-t border-white/10 overflow-hidden w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden="true" />

      {/* Gradient Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-accent rounded-full opacity-10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block group mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="mr-2 w-10 h-10 text-brand-accent" />
                <span className="text-2xl font-bold text-gradient">
                  Event Horizon
                </span>
              </div>
            </Link>
            <p className="text-brand-text-dim mb-6 leading-relaxed">
              Discover, book, and manage exclusive events. Your next adventure
              starts here with seamless event experiences.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-brand-accent border border-white/10 hover:border-brand-accent flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-brand-text-dim group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-brand-accent border border-white/10 hover:border-brand-accent flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-brand-text-dim group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-brand-accent border border-white/10 hover:border-brand-accent flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-brand-text-dim group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-brand-accent border border-white/10 hover:border-brand-accent flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-brand-text-dim group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-accent rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/home"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/discover"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Discover Events
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/dashboard"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/my-bookings"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/add-event"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-accent rounded-full" />
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-brand-accent transition-all duration-200" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-brand-text mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-accent rounded-full" />
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@eventhub.com"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-start gap-3 group"
                >
                  <Mail className="w-5 h-5 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="break-all">info@eventhub.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="text-brand-text-dim hover:text-brand-accent transition-colors duration-200 flex items-start gap-3 group"
                >
                  <Phone className="w-5 h-5 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+1 (234) 567-890</span>
                </a>
              </li>
              <li className="text-brand-text-dim flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-brand-accent" />
                <span>
                  123 Event Street
                  <br />
                  New York, NY 10001
                  <br />
                  United States
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-white/20 to-transparent mb-8" />
      </div>
    </footer>
  );
};

export default Footer;
