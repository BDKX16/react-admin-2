import * as React from "react";
import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Home,
  BarChart3,
  Smartphone,
  Download,
  User,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useLocation } from "react-router-dom";
import type { OnboardingType } from "@/types/onboarding";
import {
  initialTour,
  dashboardTour,
  deviceTour,
  otaTour,
  settingsTour,
  analyticsTour,
} from "@/config/tours";

interface TourOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  tourType: OnboardingType;
  routes?: string[]; // Routes where this tour is available
}

export const TourTrigger: React.FC = () => {
  const { startTour, hasCompletedOnboarding } = useOnboarding();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Map tour types to their steps
  const getTourSteps = (tourType: OnboardingType) => {
    switch (tourType) {
      case "initial":
        return initialTour;
      case "dashboard":
        return dashboardTour;
      case "device":
        return deviceTour;
      case "ota":
        return otaTour;
      case "settings":
        return settingsTour;
      case "analytics":
        return analyticsTour;
      default:
        return [];
    }
  };

  // Define available tours
  const tours: TourOption[] = [
    {
      id: "initial",
      label: "Bienvenida y primeros pasos",
      icon: <Home className="h-4 w-4" />,
      tourType: "initial",
    },
    {
      id: "dashboard",
      label: "Tour del Dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
      tourType: "dashboard",
      routes: ["/dashboard", "/"],
    },
    {
      id: "device",
      label: "Tour de dispositivo",
      icon: <Smartphone className="h-4 w-4" />,
      tourType: "device",
      routes: ["/dashboard", "/"],
    },
    {
      id: "ota",
      label: "Actualizaciones OTA",
      icon: <Download className="h-4 w-4" />,
      tourType: "ota",
      routes: ["/dashboard", "/"],
    },
    {
      id: "settings",
      label: "Configuración de perfil",
      icon: <User className="h-4 w-4" />,
      tourType: "settings",
      routes: ["/settings", "/profile"],
    },
    {
      id: "analytics",
      label: "Analíticas y gráficos",
      icon: <TrendingUp className="h-4 w-4" />,
      tourType: "analytics",
      routes: ["/analytics", "/charts"],
    },
  ];

  // Filter tours based on current route
  const availableTours = tours.filter((tour) => {
    if (!tour.routes) return true; // Available on all routes
    return tour.routes.some((route) => location.pathname.includes(route));
  });

  const handleTourStart = (tourType: OnboardingType) => {
    const steps = getTourSteps(tourType);
    if (steps.length > 0) {
      startTour(tourType, steps, {
        allowClose: true,
      });
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            data-tour="help-button"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Tours y Tutoriales
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {!hasCompletedOnboarding("inicio") && (
            <>
              <DropdownMenuItem
                onClick={() => handleTourStart("initial")}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">Comenzar tour inicial</span>
                  <span className="text-xs text-muted-foreground">
                    Primera vez en la plataforma
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {availableTours.length > 0 ? (
            availableTours.map((tour) => (
              <DropdownMenuItem
                key={tour.id}
                onClick={() => handleTourStart(tour.tourType)}
                className="cursor-pointer"
              >
                <span className="mr-2">{tour.icon}</span>
                <span>{tour.label}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground text-sm">
                No hay tours disponibles en esta página
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
