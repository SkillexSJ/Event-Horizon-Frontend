import { Outlet } from "react-router";
import Navbar from "../Components/Navbar.tsx";
import { Toaster } from "react-hot-toast";

const DashboardLayout = () => {
  return (
    <main className="bg-brand-bg min-h-screen text-brand-text font-sans">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#101014",
            color: "#333",
          },
        }}
      />
      {/*NAVBAR*/}
      <Navbar />
      <Outlet></Outlet>
    </main>
  );
};

export default DashboardLayout;
