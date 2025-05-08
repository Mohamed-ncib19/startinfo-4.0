tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  return (
    <Button onClick={handleLogout}>Logout</Button>
  );
}