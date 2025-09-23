import { UserProfileSettings } from "@/components/UserProfileSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, User, CreditCard, History, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSubscription from "@/hooks/useSubscription";

export default function UserProfile() {
  const navigate = useNavigate();
  const { isPro, loading: subscriptionLoading } = useSubscription();

  const isProPlan = isPro();

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal, suscripción y configuración de
          cuenta.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Información Personal - Ocupa 2 columnas */}
        <div className="lg:col-span-2">
          <UserProfileSettings />
        </div>

        {/* Suscripción y Planes - Ocupa 1 columna */}
        <div className="space-y-6">
          {/* Plan Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isProPlan ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
                Plan Actual
              </CardTitle>
              <CardDescription>
                Información sobre tu suscripción actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      Plan {isProPlan ? "Pro" : "Free"}
                    </span>
                    <Badge variant={isProPlan ? "default" : "secondary"}>
                      {isProPlan ? "Activo" : "Básico"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isProPlan
                      ? "Acceso completo a todas las funciones premium"
                      : "Funciones básicas de la aplicación"}
                  </p>
                </div>
              </div>

              {isProPlan ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ✨ Tienes acceso a todas las funciones premium
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/subscription")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ver Planes y Facturación
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      🚀 Mejora a Pro para desbloquear todas las funciones
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/subscription")}
                    disabled={subscriptionLoading}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ver Planes y Precios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funciones del Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Funciones Incluidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">
                    Control básico de dispositivos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Dashboard principal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isProPlan ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      !isProPlan ? "text-muted-foreground" : ""
                    }`}
                  >
                    Gráficos avanzados con eventos
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isProPlan ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      !isProPlan ? "text-muted-foreground" : ""
                    }`}
                  >
                    Automatizaciones avanzadas (PID, PI, Proporcional)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isProPlan ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`text-sm ${
                      !isProPlan ? "text-muted-foreground" : ""
                    }`}
                  >
                    Soporte prioritario
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/payment-history")}
              >
                <History className="h-4 w-4 mr-2" />
                Ver historial de pagos
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Descargar facturas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
