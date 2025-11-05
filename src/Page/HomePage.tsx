import { useAuth } from "../Provider/AuthProvider";
import Home from "./Home/Home";
import WelcomePage from "../Layout/WelcomeLayout";

// Component to conditionally render Home or WelcomePage based on auth status
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Home /> : <WelcomePage />;
}
