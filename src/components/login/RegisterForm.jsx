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
import { Loader2 } from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetchAndLoad from "../../hooks/useFetchAndLoad";
import useAuth from "../../hooks/useAuth";
import { register, loginWithGoogle } from "../../services/public";
import { createUserAdapter } from "../../adapters/user";
import { googleAuthService } from "../../services/googleAuth";

const RegisterForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { setUserData } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we're returning from Google OAuth redirect
    const handleGoogleCallback = async () => {
      const idToken = googleAuthService.handleRedirectCallback();
      if (idToken) {
        console.log("✅ Token de Google recibido desde redirect (registro)");
        setGoogleLoading(true);

        try {
          // Usar el mismo endpoint de login con Google
          // El backend creará automáticamente la cuenta si no existe
          const result = await callEndpoint(loginWithGoogle(idToken));
          if (result.error === true) {
            console.error("❌ Google registro falló:", result);
            setError("Error al registrarse con Google. Inténtalo de nuevo.");
            setGoogleLoading(false);
            return;
          }

          console.log("✅ Registro con Google exitoso");
          setUserData(createUserAdapter(result));

          // Verificar si necesita onboarding
          if (result.needsOnboarding) {
            console.log("🔄 Usuario necesita onboarding, redirigiendo...");
            navigate("/onboarding");
            return;
          }

          // Redirect to dashboard
          navigate("/dashboard");
        } catch (error) {
          console.error("❌ Error procesando registro de Google:", error);
          setError("Error al procesar el registro");
          setGoogleLoading(false);
        }
      }
    };

    handleGoogleCallback();

    // Inicializar Google Identity Services
    const initializeGoogle = async () => {
      try {
        await googleAuthService.initialize();
        console.log("✅ Google Identity Services inicializado");
      } catch (error) {
        console.error("❌ Error inicializando Google Auth:", error);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    }
  }, [callEndpoint, setUserData, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    const result = await callEndpoint(
      register(formData.name, formData.email.toLowerCase(), formData.password)
    );

    if (result.error === true) {
      // Los errores específicos ya son manejados por notifyError en el servicio
      // Pero podemos mostrar un mensaje genérico aquí también
      if (result.code === 1) {
        setError(
          "Ya existe una cuenta con este email pendiente de confirmación"
        );
      } else if (result.code === 2) {
        setError("Ya existe una cuenta con este email");
      } else {
        setError("Error al registrar. Por favor intenta nuevamente.");
      }
      return;
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleRegister = async () => {
    console.log("🔵 Iniciando registro con Google...");
    setGoogleLoading(true);

    try {
      await googleAuthService.signIn();
      // Si llegamos aquí, el popup funcionó y recibiremos el callback
    } catch (error) {
      console.error("❌ Error en Google Sign-In:", error);
      // No mostrar error - el servicio ya maneja el fallback automáticamente
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            ¡Registro exitoso!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Hemos enviado un correo de confirmación a{" "}
            <strong>{formData.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Por favor revisa tu bandeja de entrada y haz clic en el enlace de
              confirmación para activar tu cuenta.
            </AlertDescription>
          </Alert>
          <Button
            onClick={onSwitchToLogin}
            className="w-full"
            variant="default"
          >
            Ir al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>
          Ingresa tus datos para crear una nueva cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>

            {/* Botón de Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleRegister}
              disabled={googleLoading || loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Conectando..." : "Registrarse con Google"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="underline hover:text-primary"
              disabled={loading || googleLoading}
            >
              Inicia sesión
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
