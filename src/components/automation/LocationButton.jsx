import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";
import PropTypes from "prop-types";

export function LocationButton({ location, onClick, className = "" }) {
  const locationText = location
    ? `${location.name}, ${location.state}, ${location.country}`
    : "No hay ubicación configurada";

  return (
    <TooltipProvider delayDuration={500}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={`p-2 h-8 w-8 ${className}`}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <p className="max-w-xs text-sm">{locationText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

LocationButton.propTypes = {
  location: PropTypes.object,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};
