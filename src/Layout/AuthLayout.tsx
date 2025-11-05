import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="relative bg-grid  bg-brand-bg  min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <main className=" min-h-screen overflow-x-hidden flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
