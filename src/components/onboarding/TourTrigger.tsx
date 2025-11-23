import * as React from "react";
import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Home,
  BarChart3,
  Smartphone,
  User,
  TrendingUp,
  GitBranch,
  Network,
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
import {
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useLocation } from "react-router-dom";
import type { OnboardingType } from "@/types/onboarding";
import {
  initialTour,
  settingsTour,
  analyticsTour,
  rulesTour,
  automationEditorTour,
} from "@/config/tours";
import { generateDeviceTour } from "@/utils/deviceTourGenerator";
import useDevices from "@/hooks/useDevices";

interface TourOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  tourType: OnboardingType;
  routes?: string[]; // Routes where this tour is available
}

// Hook to get tour configuration and handlers
export const useTourConfig = () => {
  const { startTour, hasCompletedOnboarding } = useOnboarding();
  const location = useLocation();
  const { selectedDevice } = useDevices();

  // Map tour types to their steps
  const getTourSteps = (tourType: OnboardingType) => {
    switch (tourType) {
      case "initial":
      case "dashboard":
        return initialTour;
      case "device-model":
        if (selectedDevice?.template) {
          return generateDeviceTour(
            selectedDevice.template,
            selectedDevice.name,
            selectedDevice.modelId
          );
        }
        return [];
      case "settings":
        return settingsTour;
      case "analytics":
        return analyticsTour;
      case "rules":
        return rulesTour;
      case "automation-editor":
        return automationEditorTour;
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
    {
      id: "rules",
      label: "Motor de Reglas",
      icon: <GitBranch className="h-4 w-4" />,
      tourType: "rules",
      routes: ["/rule-engine"],
    },
    {
      id: "automation-editor",
      label: "Editor de Automatizaciones",
      icon: <Network className="h-4 w-4" />,
      tourType: "automation-editor",
      routes: ["/automation-editor"],
    },
  ];

  // Filter tours based on current route
  const availableTours = tours.filter((tour) => {
    if (!tour.routes) return true;
    return tour.routes.some((route) => location.pathname.includes(route));
  });

  const handleTourStart = (tourType: OnboardingType, onClose?: () => void) => {
    const steps = getTourSteps(tourType);
    if (steps.length > 0) {
      startTour(tourType, steps, {
        allowClose: true,
      });
    }
    onClose?.();
  };

  return {
    tours,
    availableTours,
    handleTourStart,
    hasCompletedOnboarding,
  };
};

// Dropdown menu content component for tours
export const TourMenuContent: React.FC<{
  onTourStart: (tourType: OnboardingType) => void;
}> = ({ onTourStart }) => {
  const { tours, availableTours, hasCompletedOnboarding } = useTourConfig();

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Tours y Tutoriales
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {!hasCompletedOnboarding("inicio") && (
        <>
          <DropdownMenuItem
            onClick={() => onTourStart("initial")}
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
            onClick={() => onTourStart(tour.tourType)}
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
    </>
  );
};

// Menubar content component for tours (for use in Menubar)
export const TourMenubarContent: React.FC = () => {
  const { handleTourStart, availableTours, hasCompletedOnboarding } =
    useTourConfig();

  return (
    <MenubarContent>
      <MenubarLabel className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Tours y Tutoriales
      </MenubarLabel>
      <MenubarSeparator />

      {!hasCompletedOnboarding("inicio") && (
        <>
          <MenubarItem
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
          </MenubarItem>
          <MenubarSeparator />
        </>
      )}

      {availableTours.length > 0 ? (
        availableTours.map((tour) => (
          <MenubarItem
            key={tour.id}
            onClick={() => handleTourStart(tour.tourType)}
            className="cursor-pointer"
          >
            <span className="mr-2">{tour.icon}</span>
            <span>{tour.label}</span>
          </MenubarItem>
        ))
      ) : (
        <MenubarItem disabled>
          <span className="text-muted-foreground text-sm">
            No hay tours disponibles en esta página
          </span>
        </MenubarItem>
      )}
    </MenubarContent>
  );
};

// Floating button trigger component
export const TourTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleTourStart } = useTourConfig();

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
          <TourMenuContent
            onTourStart={(type) =>
              handleTourStart(type, () => setIsOpen(false))
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
