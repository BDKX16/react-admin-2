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
  FileText,
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
import { useLocation, useNavigate } from "react-router-dom";
import type { OnboardingType } from "@/types/onboarding";
import {
  initialTour,
  otaTour,
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
  const navigate = useNavigate();
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
      case "ota":
        return otaTour;
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
      routes: ["/dashboard"],
    },
    {
      id: "device-model",
      label: "Tour de dispositivo",
      icon: <Smartphone className="h-4 w-4" />,
      tourType: "device-model",
      routes: ["/device"],
    },
    {
      id: "ota",
      label: "¿Cómo actualizo?",
      icon: <Download className="h-4 w-4" />,
      tourType: "ota",
      routes: ["/device-config"],
    },
    {
      id: "analytics",
      label: "Gráficos",
      icon: <TrendingUp className="h-4 w-4" />,
      tourType: "analytics",
      routes: ["/charts"],
    },
    {
      id: "rules",
      label: "Automatizaciones",
      icon: <GitBranch className="h-4 w-4" />,
      tourType: "rules",
      routes: ["/rule-engine"],
    },
    {
      id: "automation-editor",
      label: "Editor de automatizaciones",
      icon: <Network className="h-4 w-4" />,
      tourType: "automation-editor",
      routes: ["/automation-editor"],
    },
  ];

  // All tours are now available regardless of route
  const availableTours = tours;

  const handleTourStart = (tourType: OnboardingType, onClose?: () => void) => {
    const tour = tours.find((t) => t.tourType === tourType);

    // Check if tour requires a specific route
    if (tour?.routes && tour.routes.length > 0) {
      const currentPath = location.pathname;
      const isOnCorrectRoute = tour.routes.some(
        (route) => currentPath === route || currentPath.startsWith(route)
      );

      // If not on correct route, navigate first, then start tour after delay
      if (!isOnCorrectRoute) {
        const targetRoute = tour.routes[0];
        navigate(targetRoute);

        // Wait for navigation and component mount before starting tour
        setTimeout(() => {
          const steps = getTourSteps(tourType);
          if (steps.length > 0) {
            startTour(tourType, steps, {
              allowClose: true,
            });
          }
        }, 500);

        onClose?.();
        return;
      }
    }

    // If on correct route or no specific route required, start immediately
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
    location,
  };
};

// Dropdown menu content component for tours
export const TourMenuContent: React.FC<{
  onTourStart: (tourType: OnboardingType) => void;
}> = ({ onTourStart }) => {
  const { tours, availableTours, hasCompletedOnboarding, location } =
    useTourConfig();

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

      {availableTours.map((tour) => {
        // Check if tour requires navigation
        const needsNavigation =
          tour.routes &&
          !tour.routes.some(
            (route) =>
              location.pathname === route || location.pathname.startsWith(route)
          );

        return (
          <DropdownMenuItem
            key={tour.id}
            onClick={() => onTourStart(tour.tourType)}
            className="cursor-pointer"
          >
            <span className="mr-2">{tour.icon}</span>
            <div className="flex flex-col">
              <span>{tour.label}</span>
            </div>
          </DropdownMenuItem>
        );
      })}
    </>
  );
};

// Menubar content component for tours (for use in Menubar)
export const TourMenubarContent: React.FC<{
  onOpenWelcomeModal?: () => void;
}> = ({ onOpenWelcomeModal }) => {
  const { handleTourStart, availableTours, hasCompletedOnboarding, location } =
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
            onClick={() => {
              if (onOpenWelcomeModal) {
                onOpenWelcomeModal();
              } else {
                handleTourStart("initial");
              }
            }}
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

      {availableTours.map((tour) => {
        // Check if tour requires navigation
        const needsNavigation =
          tour.routes &&
          !tour.routes.some(
            (route) =>
              location.pathname === route || location.pathname.startsWith(route)
          );

        return (
          <MenubarItem
            key={tour.id}
            onClick={() => handleTourStart(tour.tourType)}
            className="cursor-pointer"
          >
            <span className="mr-2">{tour.icon}</span>
            <div className="flex flex-col">
              <span>{tour.label}</span>
            </div>
          </MenubarItem>
        );
      })}

      <MenubarSeparator />
      <MenubarItem asChild className="cursor-pointer">
        <a
          href="https://www.confi.com.ar/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>Documentación</span>
        </a>
      </MenubarItem>
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
            data-tour="tour-menu-button"
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
