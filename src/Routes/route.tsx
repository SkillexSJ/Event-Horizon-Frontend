import { createBrowserRouter } from "react-router";
import MainLayout from "../Layout/MainLayout.tsx";
import DiscoverPage from "../Page/Discover/DiscoverPage.tsx";
import EventDetailsPage from "../Page/EventDetailsPage.tsx";
import MyBookingsPage from "../Page/Booking/MyBookingsPage.tsx";
import DashboardLayout from "../Layout/DashboardLayout.tsx";
import DashboardPage from "../Page/DashBoardPage.tsx";
import AddEventPage from "../Page/AddEventPage.tsx";
import AuthLayout from "../Layout/AuthLayout.tsx";
import Signup from "../Page/Auth/Signup.tsx";
import Login from "../Page/Auth/Login.tsx";
import { PrivateRoute, HostRoute, PublicRoute } from "../Provider/PrivateRoute";
import Home from "../Page/Home/Home.tsx";
import WelcomePage from "../Layout/WelcomeLayout.tsx";
import ErrorPage from "../Page/Error/ErrorPage.tsx";

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
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "discover",
        element: <DiscoverPage />,
      },
      {
        path: "event/:id",
        element: <EventDetailsPage />,
      },
      {
        path: "my-bookings",
        element: (
          <PrivateRoute>
            <MyBookingsPage />
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
        element: <DashboardPage />,
      },
      {
        path: "add-event",
        element: <AddEventPage />,
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
        element: <Signup />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage></ErrorPage>,
  },
]);
