import { Link } from "react-router";
import LightRays from "../Components/LightRays";
import { Sparkles, ArrowRight } from "lucide-react";
import RotatingText from "../Components/RotatingText";
import { useEffect, useState } from "react";
import LogoLoop from "../Components/LogoLoop";
import { SiReact, SiTypescript, SiTailwindcss } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },

  { node: <FaGolang />, title: "Golang", href: "https://golang.org" },

  {
    node: <SiTypescript />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },

  {
    node: <SiTailwindcss />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
];

export default function WelcomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-brand-bg overflow-hidden">
      {/* Light Rays Background - Fixed */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF6FD8"
          raysSpeed={1.0}
          lightSpread={1.8}
          rayLength={3.5}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0.12}
          distortion={0.02}
          className="custom-rays"
        />
      </div>

      {/* Main Content Sections - Scrollable */}
      <div className="relative z-10 w-full">
        {/* Hero Section - Centered Content */}
        <section className="min-h-screen w-full flex items-center justify-center py-20 px-4">
          <div className="w-full max-w-[1400px] mx-auto text-center">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8 transition-all duration-1000 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
              </span>
              <span className="text-sm text-brand-text-dim font-medium">
                Your Event Journey Starts Here
              </span>
            </div>

            {/* Main Heading with Rotating Text */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 transition-all duration-1000 delay-200 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <RotatingText
                texts={[
                  "WELCOME TO",
                  "EVENT HORIZON",
                  "YOUR NEXT TICKET",
                  "GRAB IT NOW!",
                ]}
                mainClassName="px-3 sm:px-4 md:px-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white overflow-hidden py-1 sm:py-2 md:py-2 justify-center rounded-xl shadow-custom-glow"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.03}
                auto={true}
                elementLevelClassName="inline-block"
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                rotationInterval={5000}
              />
            </div>

            {/* Subtitle */}
            <p
              className={`text-md md:text-xl lg:text-2xl text-brand-text-dim max-w-4xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-400 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Discover exclusive events, book experiences, and create
              unforgettable moments in just a few clicks.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col items-center justify-center gap-4 mb-24 transition-all duration-1000 delay-600 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Link
                to="/home"
                className="group inline-flex items-center justify-center gap-2 bg-brand-accent text-white py-3 px-8 rounded-full font-semibold text-base hover:bg-brand-accent-dark transition-all duration-300 shadow-custom-glow hover:shadow-xl hover:scale-105"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-brand-text-dim text-sm">
                <span>Already a user?</span>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-accent-dark font-semibold transition-colors underline-offset-4 hover:underline"
                >
                  Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Stats/Features - Wider */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto transition-all duration-1000 delay-800 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="glass-effect border border-white/10 rounded-2xl p-8 hover:border-brand-accent/50 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-brand-accent mb-2">
                  1000+
                </div>
                <div className="text-base text-brand-text-dim">
                  Events Listed
                </div>
              </div>
              <div className="glass-effect border border-white/10 rounded-2xl p-8 hover:border-brand-accent/50 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-brand-accent mb-2">
                  50K+
                </div>
                <div className="text-base text-brand-text-dim">
                  Happy Attendees
                </div>
              </div>
              <div className="glass-effect border border-white/10 rounded-2xl p-8 hover:border-brand-accent/50 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-brand-accent mb-2">
                  24/7
                </div>
                <div className="text-base text-brand-text-dim">
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Marquee Section - Full Width */}
        <section
          className={`w-full py-16 border-t border-white/5 transition-all duration-1000 delay-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-full max-w-[1400px] mx-auto px-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
              Built with Modern Technology
            </h2>
            <p className="text-center text-brand-text-dim text-sm md:text-base">
              Powered by cutting-edge frameworks and tools
            </p>
          </div>
          <div
            className="w-full"
            style={{ height: "120px", overflow: "hidden" }}
          >
            <LogoLoop
              logos={techLogos}
              speed={80}
              direction="left"
              logoHeight={64}
              gap={60}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="transparent"
              ariaLabel="Technology partners"
              className="text-white"
            />
          </div>
        </section>

        {/* Placeholder for Future Sections */}
        {/* 
        <section className="w-full py-20 px-4">
          <div className="w-full max-w-[1400px] mx-auto">
            Future Section Content Here
          </div>
        </section>
        */}
      </div>
    </main>
  );
}
