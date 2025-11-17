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

import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useFetchAndLoad from "../../hooks/useFetchAndLoad";
import { login, loginWithGoogle } from "../../services/public";
import { createUserAdapter } from "../../adapters/user";
import { googleAuthService } from "../../services/googleAuth";

const LoginFormulario = () => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setUserData } = useAuth();

  useEffect(() => {
    // Check if we're returning from Google OAuth redirect
    const handleGoogleCallback = async () => {
      const idToken = googleAuthService.handleRedirectCallback();
      if (idToken) {
        console.log("✅ Token de Google recibido desde redirect");
        setGoogleLoading(true);

        try {
          const result = await callEndpoint(loginWithGoogle(idToken));
          if (result.error === true) {
            console.error("❌ Google login falló:", result);
            alert("Error al iniciar sesión con Google. Inténtalo de nuevo.");
            setGoogleLoading(false);
            return;
          }

          console.log("✅ Login con Google exitoso");
          setUserData(createUserAdapter(result));

          // Redirect to saved location or dashboard
          const redirectPath =
            sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
          sessionStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectPath;
        } catch (error) {
          console.error("❌ Error procesando login de Google:", error);
          alert("Error al procesar el inicio de sesión");
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
  }, [callEndpoint, setUserData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const result = await callEndpoint(
      login(data.get("email").toLowerCase(), data.get("password"))
    );

    if (result.error === true) {
      return;
    } else {
      setUserData(createUserAdapter(result));

      // Redirect to saved location or dashboard
      const redirectPath =
        sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      console.log("✅ Login exitoso, redirigiendo a:", redirectPath);
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPath;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      console.log("🔄 Iniciando login con Google...");

      // Obtener token de Google usando la nueva API
      const idToken = await googleAuthService.signIn();
      console.log("✅ Token de Google recibido");

      // Enviar token al backend
      const result = await callEndpoint(loginWithGoogle(idToken));
      console.log(result);
      if (result.error === true) {
        console.error("❌ Google login falló:", result);
        alert("Error al iniciar sesión con Google. Inténtalo de nuevo.");
        return;
      }

      console.log("✅ Login con Google exitoso");
      setUserData(createUserAdapter(result));

      // Redirect to saved location or dashboard
      const redirectPath =
        sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPath;
    } catch (error) {
      console.error("❌ Error en Google login:", error);

      // Mensaje de error más específico
      let errorMessage = "Error al conectar con Google.";

      if (
        error.message?.includes("origin") ||
        error.message?.includes("not allowed")
      ) {
        errorMessage =
          "⚠️ Configuración de Google incorrecta:\n\n" +
          "1. Ve a https://console.cloud.google.com/apis/credentials\n" +
          "2. Edita tu OAuth Client ID\n" +
          "3. Agrega 'http://localhost:5173' en 'Authorized JavaScript origins'\n" +
          "4. Guarda y espera 1-2 minutos\n" +
          "5. Recarga la página (Ctrl+Shift+R)";
      } else if (
        error.message?.includes("popup") ||
        error.message?.includes("not displayed")
      ) {
        errorMessage =
          "El popup de Google fue bloqueado. Verifica:\n" +
          "1. Que tu navegador permita popups\n" +
          "2. Que http://localhost:5173 esté autorizado en Google Cloud Console";
      }

      alert(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || googleLoading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Botón de Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
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
              {googleLoading ? "Conectando..." : "Acceder con Google"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline">
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginFormulario;
