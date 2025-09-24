import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Crown,
  User,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import usePayments from "@/hooks/usePayments";
import useSubscription from "@/hooks/useSubscription";
import { PaymentDetailDialog } from "@/components/PaymentDetailDialog";

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { payments, loading, error, fetchPayments } = usePayments();
  const { isPro } = useSubscription();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const isProPlan = isPro();
  const currentPlanPrice = isProPlan ? 10.0 : 0.0;
  const currentPlanName = isProPlan ? "Pro" : "Free";

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Aprobado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Rechazado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Desconocido
          </Badge>
        );
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", {
        locale: es,
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Perfil
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando historial de pagos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Perfil
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error al cargar</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchPayments()}>Intentar de nuevo</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Perfil
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Pagos y Facturación
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu plan actual y revisa tu historial de pagos.
        </p>
      </div>

      {/* Current Plan Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Actual</CardTitle>
            {isProPlan ? (
              <Crown className="h-4 w-4 text-yellow-500" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Plan {currentPlanName}</div>
            <p className="text-xs text-muted-foreground">
              {isProPlan ? "Funciones premium activas" : "Funciones básicas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Mensual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(currentPlanPrice)}
            </div>
            <p className="text-xs text-muted-foreground">por mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isProPlan ? "Próximo Pago" : "Estado"}
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isProPlan ? "En 30 días" : "Gratuito"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isProPlan ? "Renovación automática" : "Sin cargo mensual"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History - Solo mostrar si es Plan Pro */}
      {isProPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
            <CardDescription>
              Historial de pagos de tu suscripción Pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Aún no hay pagos registrados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tu primer pago aparecerá aquí cuando se procese.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Pago Plan Pro</p>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                        {payment.externalPaymentId && (
                          <p className="text-xs text-muted-foreground">
                            ID: {payment.externalPaymentId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.method || "Tarjeta"}
                      </p>
                      <div className="mt-2">
                        <PaymentDetailDialog payment={payment} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Información para usuarios Free */}
      {!isProPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Plan Gratuito
            </CardTitle>
            <CardDescription>
              Estás usando el plan gratuito de Confiplant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Sin cargos mensuales
              </h3>
              <p className="text-muted-foreground mb-4">
                Tu plan actual no tiene costos. Mejora a Pro para acceder a
                funciones premium.
              </p>
              <Button onClick={() => navigate("/subscription")}>
                Ver Planes de Suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions - Solo para usuarios Pro con pagos */}
      {isProPlan && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Facturación</CardTitle>
            <CardDescription>
              Opciones para administrar tu facturación y descargar comprobantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" disabled>
              <Download className="h-4 w-4 mr-2" />
              Descargar comprobantes de pago
            </Button>
            <Button variant="outline" className="w-full" disabled>
              <CreditCard className="h-4 w-4 mr-2" />
              Cambiar método de pago
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
