import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Shield,
  Check,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import useSubscription from "@/hooks/useSubscription";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSubscription();

  const planId = searchParams.get("plan");
  const currency = searchParams.get("currency") || "USD";

  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuración de planes
  const plans = {
    plus: {
      name: "Plus",
      price: { USD: 2, ARS: 2600 },
      description: "Control inteligente para optimizar tu cultivo",
      features: [
        "Control PID avanzado",
        "Automatizaciones offline",
        "Calendario de seguimiento con eventos",
        "Análisis de datos básico",
        "Gráficos avanzados de análisis",
        "Soporte prioritario",
      ],
    },
    pro: {
      name: "Pro",
      price: { USD: 10, ARS: 13000 },
      description: "Control profesional para máximo rendimiento",
      features: [
        "Controles avanzados de nivel industrial",
        "PID, PWD, PI y más",
        "Creación de automatizaciones expandida y más rápida",
        "Gráficos de análisis de las automatizaciones",
        "Calendario de seguimiento con eventos",
        "Gráficos de análisis avanzados",
        "Vista previa de investigación de nuevas características",
      ],
    },
  };

  const selectedPlan = plans[planId];

  useEffect(() => {
    if (!selectedPlan) {
      navigate("/subscription");
    }
  }, [selectedPlan, navigate]);

  if (!selectedPlan) {
    return null;
  }

  const price = selectedPlan.price[currency];
  const currencySymbol = currency === "USD" ? "$" : "$";
  const currencyName = currency === "USD" ? "USD" : "ARS";

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (paymentMethod === "mercadopago") {
        // Simular redirección a MercadoPago
        await new Promise((resolve) => setTimeout(resolve, 1000));
        window.open(
          "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=demo",
          "_blank"
        );
        navigate("/payment/pending");
      } else if (paymentMethod === "transfer") {
        // Mostrar información de transferencia
        navigate("/payment/transfer-info", {
          state: {
            plan: selectedPlan.name,
            price,
            currency: currencyName,
          },
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      navigate("/payment/error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/subscription")}
              className="flex items-center gap-2 text-gray-900 border-white shadow-none bg-white hover:bg-gray-50 hover:text-gray-900 hover:border-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Planes
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Métodos de Pago - IZQUIERDA */}
          <div className="space-y-6">
            {/* Lo que incluye el Plan */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Plan {selectedPlan.name} - Funciones Incluidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métodos de Pago */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="space-y-4">
                    {/* MercadoPago */}
                    <div
                      className={`flex items-center space-x-2 p-4 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "mercadopago"
                          ? "border-2 border-blue-500 bg-blue-50"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem
                        value="mercadopago"
                        id="mercadopago"
                        className="border-gray-400 text-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                      />
                      <Label
                        htmlFor="mercadopago"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                              <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-left">
                                MercadoPago
                              </div>
                              <div className="text-xs text-gray-600 text-left">
                                Tarjetas, débito, crédito, efectivo
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs border-blue-200 text-blue-700"
                          >
                            Recomendado
                          </Badge>
                        </div>
                      </Label>
                    </div>

                    {/* Transferencia */}
                    <div
                      className={`flex items-center space-x-2 p-4 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "transfer"
                          ? "border-2 border-green-500 bg-green-50"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem
                        value="transfer"
                        id="transfer"
                        className="border-gray-400 text-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                      />
                      <Label
                        htmlFor="transfer"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-left">
                                Transferencia Bancaria
                              </div>
                              <div className="text-xs text-gray-600 text-left">
                                Procesamiento manual - 24/48hs
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            Manual
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="mt-6 text-center text-xs text-gray-500">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Pago seguro encriptado SSL. Cancela cuando quieras.
                </div>
              </CardContent>
            </Card>

            {/* Garantía */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-800">
                      Garantía de 30 días
                    </div>
                    <div className="text-green-700 mt-1">
                      Si no estás satisfecho con tu plan, te devolvemos el 100%
                      de tu dinero.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del Plan - DERECHA */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 self-center">
                  <Check className="w-5 h-5 text-green-500 text-center" />
                  Resumen de tu Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 text-left">
                      Plan {selectedPlan.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-left">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {currencySymbol}
                      {price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currencyName}/mes
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">
                    {currencySymbol}
                    {price.toLocaleString()} {currencyName}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    {currencySymbol}
                    {price.toLocaleString()} {currencyName}
                  </span>
                </div>

                <Separator />

                {/* Botón de Pago */}
                <Button
                  onClick={handlePayment}
                  className={
                    "w-full hover:border-gray-300 transition duration-200  " +
                    (paymentMethod === "mercadopago"
                      ? " bg-blue-500 hover:bg-blue-600 text-white border-blue-400 hover:border-blue-600"
                      : " bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700")
                  }
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </div>
                  ) : (
                    <>
                      Pagar {currencySymbol}
                      {price.toLocaleString()} {currencyName}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Información del Usuario */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm text-gray-900">
                  Facturar a:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {user?.name || "Usuario no disponible"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user?.email || "email@ejemplo.com"}
                  </div>
                  {user?.company && (
                    <div className="text-sm text-gray-600">{user.company}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
