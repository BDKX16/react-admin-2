import RegisterForm from "../components/login/RegisterForm";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-screen-dvh w-full items-center justify-center px-4">
      <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
    </div>
  );
}
