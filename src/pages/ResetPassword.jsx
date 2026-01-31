import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { resetPassword } from "../services/public";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, callEndpoint } = useFetchAndLoad();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("peticion");
    if (!tokenParam) {
      setError("Token de recuperación no válido o expirado");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (pwd) => {
    // Debe tener al menos 5 caracteres, 1 mayúscula y 1 número
    const hasMinLength = pwd.length >= 5;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    
    return hasMinLength && hasUpperCase && hasNumber;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Token de recuperación no válido");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener al menos 5 caracteres, 1 mayúscula y 1 número"
      );
      return;
    }

    const result = await callEndpoint(resetPassword(token, password));

    if (result.error === true) {
      setError(
        "Hubo un problema al cambiar la contraseña. El enlace puede haber expirado."
      );
      return;
    }

    if (result.data?.status === "success") {
      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  if (!token && !success) {
    return (
      <div className="flex h-screen-dvh w-full items-center justify-center px-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Token inválido
            </CardTitle>
            <CardDescription className="text-base mt-2">
              El enlace de recuperación no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              Solicitar nuevo enlace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex h-screen-dvh w-full items-center justify-center px-4">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              ¡Contraseña actualizada!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Tu contraseña ha sido cambiada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Serás redirigido al inicio de sesión en 3 segundos...
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/login")} className="w-full">
              Ir al inicio de sesión ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen-dvh w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Mínimo 5 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  Debe contener al menos 5 caracteres, 1 mayúscula y 1 número
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={5}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cambiando contraseña..." : "Cambiar contraseña"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
