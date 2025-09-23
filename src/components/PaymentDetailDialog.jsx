import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  CreditCard,
  Hash,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function PaymentDetailDialog({ payment, trigger }) {
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
      return format(new Date(dateString), "dd 'de' MMMM, yyyy 'a las' HH:mm", {
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

  if (!payment) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver detalles
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(payment.status)}
            Detalles del Pago
          </DialogTitle>
          <DialogDescription>
            Información completa de la transacción
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y Monto Principal */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">
                  {formatPrice(payment.amount)}
                </h3>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Suscripción Plan Pro
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {formatDate(payment.createdAt)}
              </p>
            </div>
          </div>

          {/* Información de la Transacción */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ID de Transacción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {payment._id}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {payment.method || "Tarjeta de crédito/débito"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ID Externo si existe */}
          {payment.externalPaymentId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ID de MercadoPago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {payment.externalPaymentId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Información de Fechas */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Creación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{formatDate(payment.createdAt)}</p>
              </CardContent>
            </Card>

            {payment.updatedAt !== payment.createdAt && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Última Actualización
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(payment.updatedAt)}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Estado Detallado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estado del Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payment.status === "approved" && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Pago aprobado y procesado exitosamente
                    </span>
                  </div>
                )}
                {payment.status === "pending" && (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      Pago pendiente de aprobación
                    </span>
                  </div>
                )}
                {payment.status === "rejected" && (
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Pago rechazado o cancelado</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de la Suscripción */}
          {payment.subscriptionId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Suscripción Asociada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Plan Pro - Acceso completo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {payment.subscriptionId}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
