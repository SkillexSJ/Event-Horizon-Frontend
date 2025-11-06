import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

// Layouts - Not lazy loaded (needed immediately for routing)
import MainLayout from "../Layout/MainLayout.tsx";
import DashboardLayout from "../Layout/DashboardLayout.tsx";
import AuthLayout from "../Layout/AuthLayout.tsx";
import WelcomePage from "../Layout/WelcomeLayout.tsx";

// Route Guards - Not lazy loaded
import { PrivateRoute, HostRoute, PublicRoute } from "../Provider/PrivateRoute";

// Error Page & Loading - Not lazy loaded
import ErrorPage from "../Page/Error/ErrorPage.tsx";
import LoadingFallback from "../Components/LoadingFallback.tsx";

// Lazy loaded pages
const Home = lazy(() => import("../Page/Home/Home.tsx"));
const DiscoverPage = lazy(() => import("../Page/Discover/DiscoverPage.tsx"));
const EventDetailsPage = lazy(() => import("../Page/EventDetailsPage.tsx"));
const MyBookingsPage = lazy(() => import("../Page/Booking/MyBookingsPage.tsx"));
const DashboardPage = lazy(() => import("../Page/DashBoardPage.tsx"));
const AddEventPage = lazy(() => import("../Page/AddEventPage.tsx"));
const Signup = lazy(() => import("../Page/Auth/Signup.tsx"));
const Login = lazy(() => import("../Page/Auth/Login.tsx"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomePage />,
  },
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        path: "home",
        element: (
          <PrivateRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "discover",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DiscoverPage />
          </Suspense>
        ),
      },
      {
        path: "event/:id",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EventDetailsPage />
          </Suspense>
        ),
      },
      {
        path: "my-bookings",
        element: (
          <PrivateRoute>
            <Suspense fallback={<LoadingFallback />}>
              <MyBookingsPage />
            </Suspense>
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "admin/",
    element: (
      <HostRoute>
        <DashboardLayout />
      </HostRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "add-event",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AddEventPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "auth/",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: "signup",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage></ErrorPage>,
  },
]);
