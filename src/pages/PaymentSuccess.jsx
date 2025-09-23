import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Sparkles,
  Crown,
  ArrowRight,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Ocultar confetti después de 3 segundos
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Datos simulados del pago (en una app real vendrían de la URL o contexto)
  const paymentData = {
    plan: "Plus",
    amount: 2600,
    currency: "ARS",
    transactionId:
      "MP-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toLocaleDateString("es-AR"),
    time: new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const successMessages = [
    "Tu suscripción financia el desarrollo continuo de nuevas funciones y actualizaciones.",
    "Con tu plan accedés a soporte prioritario, mejoras constantes y funcionalidades premium.",
    "Gracias a tu suscripción seguimos innovando y ofreciéndote lo último en control inteligente de cultivo.",
  ];

  const randomMessage =
    successMessages[Math.floor(Math.random() * successMessages.length)];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-lg w-full space-y-6 relative z-20">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Bienvenido al Plan {paymentData.plan}
          </p>
        </div>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {paymentData.plan === "Plus" ? (
                <Sparkles className="w-5 h-5 text-blue-500" />
              ) : (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
              Detalles de la Transacción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Plan:</span>
              <span className="font-medium">{paymentData.plan}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monto:</span>
              <span className="font-medium text-lg">
                ${paymentData.amount.toLocaleString()} {paymentData.currency}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                ID Transacción:
              </span>
              <span className="font-mono text-sm">
                {paymentData.transactionId}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
              <span>
                {paymentData.date} - {paymentData.time}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Pagado
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ¡Tu suscripción está activa!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {randomMessage}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Pasos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <div className="font-medium text-sm">
                  Explora tus nuevas funciones
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Accede a controles avanzados en el dashboard
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <div className="font-medium text-sm">
                  Configura tus dispositivos
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Usa los nuevos modos de control disponibles
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <div className="font-medium text-sm">Necesitas ayuda?</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Contacta nuestro soporte prioritario
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full"
            size="lg"
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Comprobante
          </Button>

          <div className="text-center text-xs text-gray-500">
            ¿Tienes preguntas? Contacta nuestro{" "}
            <button className="text-blue-600 hover:underline">
              soporte técnico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
