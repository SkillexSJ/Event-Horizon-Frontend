import { Outlet } from "react-router";
import Navbar from "../Components/Navbar.tsx";
import Footer from "../Components/Footer.tsx";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  return (
    <>
      <main className="min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden">
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
      </main>
    </>
  );
};

export default MainLayout;
