import { useState } from "react";
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  ArrowLeft,
  Building2,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSubscription from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const [billingPeriod, setBillingPeriod] = useState("personal");
  const [currency, setCurrency] = useState("ARS"); // Por defecto pesos argentinos
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  // Configuración de monedas
  const currencyConfig = {
    USD: { symbol: "$", name: "Dólares", rate: 1 },
    ARS: { symbol: "$", name: "Pesos Argentinos", rate: 1300 }, // Aproximadamente 1000 ARS = 1 USD
  };

  // Función para convertir precios
  const convertPrice = (priceUSD) => {
    if (currency === "ARS") {
      return priceUSD * currencyConfig.ARS.rate;
    }
    return priceUSD;
  };

  // Estado para el formulario de empresa
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    employees: "",
    requirements: "",
  });

  const personalPlans = [
    {
      id: "free",
      name: "Gratis",
      price: 0,
      currency: "USD",
      period: "mes",
      description: "Control total y autonomo basico",
      buttonText: "Tu plan actual",
      buttonVariant: "outline",
      disabled: true,
      features: [
        "Acceso a controles básicos",
        "Control On/Off ilimitado",
        "Configuración de horarios básica",
        "Control por ciclos simples",
        "Alertas y notificaciones a en todo momento",
        "Automatizaciones en la nube",
        "Calendario de seguimiento con eventos",
      ],
      icon: Check,
      color: "text-gray-500",
    },
    {
      id: "plus",
      name: "Plus",
      price: 2,
      currency: "USD",
      period: "mes",
      description: "Mayor acceso a control de avanzada",
      buttonText: "Obtener Plus",
      buttonVariant: "default",
      popular: true,
      features: [
        "Controles avanzados de nivel industrial",
        "PID, PWD, PI y más",
        "Creación de automatizaciones expandida y más rápida",
        "Memoria y contexto expandidos",
        "Automatizaciones offline",
        "Calendario de seguimiento con eventos",
        "Gráficos avanzados de análisis",
      ],
      benefits: [
        "Reducción de errores hasta 40%",
        "Ahorro energético del 30%",
        "Conta con datos claros y precisos",
        "Detección temprana de problemas",
      ],
      icon: Sparkles,
      color: "text-blue-500",
    },
    {
      id: "pro",
      name: "Pro",
      price: 10,
      currency: "USD",
      period: "mes",
      description: "Acceso total a lo mejor de Confi",
      buttonText: "Obtener Pro",
      buttonVariant: "default",
      features: [
        "Controles avanzados de nivel industrial",
        "PID, PWD, PI y más",
        "Creación de automatizaciones expandida y más rápida",
        "Gráficos de análisis de las automatizaciones",
        "Calendario de seguimiento con eventos",
        "Gráficos de análisis avanzados",
        "Vista previa de investigación de nuevas características",
      ],
      benefits: [
        "Incremento del rendimiento hasta 60%",
        "Reducción de pérdidas del 50%",
        "Prevención proactiva de problemas",
        "Dispositivos completamente autónomos",
      ],
      icon: Crown,
      color: "text-yellow-500",
    },
  ];

  const enterpriseFeatures = [
    "Infraestructura dedicada para tu empresa",
    "Integración completa con sistemas existentes",
    "Soporte técnico 24/7 especializado",
    "Configuración personalizada de dispositivos IoT",
    "Dashboard empresarial con métricas avanzadas",
    "API personalizada para integraciones",
    "Gestión de usuarios y permisos granular",
    "Backup y redundancia garantizada",
    "Cumplimiento con estándares de seguridad empresarial",
    "Capacitación del equipo incluida",
    "Consultoría en automatización IoT",
    "Escalabilidad ilimitada de dispositivos",
  ];

  const handlePlanSelect = (planId) => {
    if (planId === "free") {
      return; // No hacer nada para el plan gratuito
    }

    // Redirigir al checkout con el plan seleccionado
    navigate(`/checkout?plan=${planId}&currency=${currency}`);
  };

  const handleCompanySubmit = () => {
    console.log("Formulario empresa enviado:", companyForm);
    // Aquí iría la lógica para enviar la cotización
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header con botón de regreso */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>

            {/* Selector de moneda */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Moneda:
              </span>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">
                    <div className="flex items-center gap-2">
                      <span>🇦🇷</span>
                      <span>ARS</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="USD">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>USD</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Mejora tu plan
          </h1>

          {/* Billing Period Tabs */}
          <Tabs
            value={billingPeriod}
            onValueChange={setBillingPeriod}
            className="w-fit mx-auto"
          >
            <TabsList className="grid w-full mt-8 max-w-xs mx-auto grid-cols-2">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="empresa">Empresa</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-12">
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {personalPlans.map((plan) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = subscription?.plan === plan.id;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative transition-all duration-300 hover:shadow-xl ${
                        plan.popular
                          ? "ring-2 ring-blue-500 scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white px-4 py-1">
                            POPULAR
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                          <Icon className={`w-8 h-8 ${plan.color}`} />
                        </div>

                        <CardTitle className="text-2xl font-bold mb-2">
                          {plan.name}
                        </CardTitle>

                        <div className="mb-4">
                          <span className="text-4xl font-bold">
                            {currencyConfig[currency].symbol}
                            {convertPrice(plan.price).toLocaleString()}
                          </span>
                          <span className="text-gray-500 ml-1">
                            {currency} / {plan.period}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {plan.description}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <Button
                          className={`w-full ${
                            plan.popular
                              ? "bg-blue-600 hover:bg-blue-700"
                              : plan.id === "pro"
                              ? "bg-black hover:bg-gray-800 text-white"
                              : ""
                          }`}
                          variant={plan.buttonVariant}
                          disabled={plan.disabled || isCurrentPlan}
                          onClick={() => handlePlanSelect(plan.id)}
                        >
                          {isCurrentPlan ? "Tu plan actual" : plan.buttonText}
                        </Button>

                        <div className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <Check className="w-4 h-4 text-green-500" />
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300 text-left">
                                {feature}
                              </span>
                            </div>
                          ))}

                          {plan.benefits && (
                            <>
                              <div className="border-t pt-3 mt-4">
                                <div className="space-y-2">
                                  {plan.benefits.map((benefit, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-3"
                                    >
                                      <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      </div>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {benefit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="empresa" className="mt-8">
              {/* Enterprise Card */}
              <div className="max-w-4xl mx-auto">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-12">
                    <div className="flex justify-center mb-6">
                      <Building2 className="w-16 h-16" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-4">
                      Confi Enterprise
                    </CardTitle>
                    <p className="text-xl opacity-90">
                      Soluciones IoT personalizadas para tu empresa
                    </p>
                    <div className="mt-6">
                      <span className="text-2xl font-light">
                        Precio personalizado
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Features */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Todo lo que necesitas para empresas
                        </h3>
                        <div className="space-y-3">
                          {enterpriseFeatures.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <Check className="w-4 h-4 text-green-500" />
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Form */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Solicita tu cotización
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="companyName">
                              Nombre de la empresa
                            </Label>
                            <Input
                              id="companyName"
                              placeholder="Mi Empresa S.A."
                              value={companyForm.companyName}
                              onChange={(e) =>
                                setCompanyForm((prev) => ({
                                  ...prev,
                                  companyName: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="contactName">
                              Nombre del contacto
                            </Label>
                            <Input
                              id="contactName"
                              placeholder="Juan Pérez"
                              value={companyForm.contactName}
                              onChange={(e) =>
                                setCompanyForm((prev) => ({
                                  ...prev,
                                  contactName: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email corporativo</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="contacto@miempresa.com"
                              value={companyForm.email}
                              onChange={(e) =>
                                setCompanyForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                              id="phone"
                              placeholder="+1 (555) 123-4567"
                              value={companyForm.phone}
                              onChange={(e) =>
                                setCompanyForm((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="employees">
                              Número de empleados
                            </Label>
                            <Input
                              id="employees"
                              placeholder="50-100"
                              value={companyForm.employees}
                              onChange={(e) =>
                                setCompanyForm((prev) => ({
                                  ...prev,
                                  employees: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="requirements">
                              Requerimientos específicos
                            </Label>
                            <Textarea
                              id="requirements"
                              placeholder="Describe tus necesidades de IoT..."
                              value={companyForm.requirements}
                              onChange={(e) =>
                                setCompanyForm((prev) => ({
                                  ...prev,
                                  requirements: e.target.value,
                                }))
                              }
                              rows={4}
                            />
                          </div>
                          <Button
                            onClick={handleCompanySubmit}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Solicitar Cotización
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* FAQ Section - Solo para personal */}
        {billingPeriod === "personal" && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              ¿Ya tienes un plan?
              <button className="text-blue-600 hover:text-blue-800 ml-1 underline">
                Consultar ayuda de facturación
              </button>
            </p>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              <span>¿Necesitas más funcionalidades para tu empresa?</span>
              <button
                onClick={() => setBillingPeriod("empresa")}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Consulta Confi Enterprise
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
