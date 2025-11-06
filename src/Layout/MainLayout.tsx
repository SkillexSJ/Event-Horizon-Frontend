import { Outlet } from "react-router";
import Navbar from "../Components/Navbar.tsx";
import Footer from "../Components/Footer.tsx";
import { Toaster } from "react-hot-toast";
import LightRays from "../Components/LightRays.tsx";

const MainLayout = () => {
  return (
    <main className="relative min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden">
      {/* Light Rays Background - Fixed Position */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
        }}
      >
        <LightRays
          raysOrigin="bottom-center"
          raysColor="#FF6FD8"
          raysSpeed={1.0}
          lightSpread={1.2}
          rayLength={3.0}
          followMouse={false}
          mouseInfluence={0.05}
          noiseAmount={0.09}
          distortion={0.04}
          className="custom-rays"
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#333",
            },
          }}
        />

        {/*NAVBAR*/}
        <Navbar />
        <div className="w-full">
          <Outlet />
        </div>
        {/*FOOTER*/}
        <div className="mt-20">
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default MainLayout;
