import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Loader2, MapPin } from "lucide-react";

// API para búsqueda de ciudades (usando OpenStreetMap Nominatim)
const searchCities = async (query) => {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=10&` +
        `featuretype=city`
    );

    if (!response.ok) throw new Error("Error en la búsqueda");

    const data = await response.json();
    console.log("Raw API response:", data);

    if (!Array.isArray(data)) {
      console.error("API response is not an array:", data);
      return [];
    }

    const results = data
      .filter((item) => {
        // Filtrar por tipos de lugares que representan ciudades/localidades
        const validAddressTypes = [
          "city",
          "town",
          "village",
          "municipality",
          "administrative",
          "state",
        ];
        const isValidAddressType = validAddressTypes.includes(item.addresstype);
        const isPlace = item.class === "place";
        const hasCity =
          item.address &&
          (item.address.city || item.address.town || item.address.village);

        return isValidAddressType || isPlace || hasCity;
      })
      .map((item) => {
        const name = item.name || item.display_name.split(",")[0];
        const state =
          item.address?.state ||
          item.address?.province ||
          item.address?.state_district ||
          "";
        const country = item.address?.country || "";

        return {
          // Datos básicos
          name: name,
          state: state,
          country: country,
          displayName: `${name}${state ? ", " + state : ""}${
            country ? ", " + country : ""
          }`,

          // Coordenadas
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          lat: parseFloat(item.lat), // Mantener compatibilidad
          lon: parseFloat(item.lon), // Mantener compatibilidad

          // Datos adicionales de la API
          place_id: item.place_id,
          osm_type: item.osm_type,
          osm_id: item.osm_id,
          addresstype: item.addresstype,
          class: item.class,
          type: item.type,
          importance: item.importance,
          boundingbox: item.boundingbox,

          // Dirección completa
          full_address: item.display_name,
          address_details: item.address,

          // País código
          country_code: item.address?.country_code?.toUpperCase() || "",
        };
      });

    console.log("Filtered and mapped results:", results);
    console.log("Total results found:", results.length);
    return results;
  } catch (error) {
    console.error("Error searching cities:", error);
    return [];
  }
};

export function LocationConfigModal({ open, onClose, onSave, deviceName }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchCitiesDebounced = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const results = await searchCities(searchQuery);
          setSearchResults(Array.isArray(results) ? results : []);
          setShowResults(true);
        } catch (error) {
          console.error("Error in search effect:", error);
          setSearchResults([]);
          setShowResults(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(searchCitiesDebounced);
  }, [searchQuery]);

  const handleSave = () => {
    console.log("handleSave called, selectedLocation:", selectedLocation);
    if (selectedLocation) {
      onSave(selectedLocation);
    }
  };

  const handleLocationSelect = (location) => {
    console.log("Location selected:", location);
    setSelectedLocation(location);
    setSearchQuery(location.displayName);
    setShowResults(false);
    console.log("selectedLocation state after setting:", location);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedLocation(null);
    setSearchResults([]);
    setShowResults(false);
    onClose();
  };

  console.log("Render - selectedLocation:", selectedLocation);
  console.log("Render - button disabled:", !selectedLocation);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configurar Ubicación del Dispositivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Dispositivo</Label>
            <Input
              id="device-name"
              value={deviceName || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city-search">Ciudad *</Label>
            <div className="relative">
              <Input
                id="city-search"
                placeholder="Buscar ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0 && searchQuery.length >= 3) {
                    setShowResults(true);
                  }
                }}
                onBlur={() => {
                  // Delay para permitir que el click en las opciones funcione
                  setTimeout(() => setShowResults(false), 200);
                }}
                className="pr-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
              )}

              {/* Dropdown personalizado */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {searchQuery.length < 3 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      Escribe al menos 3 caracteres para buscar
                    </div>
                  ) : Array.isArray(searchResults) &&
                    searchResults.length > 0 ? (
                    <div className="py-1">
                      {searchResults.slice(0, 10).map((location, index) => (
                        <div
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            console.log("Location selected:", location);
                            handleLocationSelect(location);
                          }}
                          className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/50 last:border-b-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {location.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {location.state}
                              {location.state && location.country ? ", " : ""}
                              {location.country}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No se encontraron ciudades
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedLocation && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Ubicación seleccionada:</p>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.displayName}
              </p>
              {selectedLocation.country_code && (
                <p className="text-xs text-muted-foreground">
                  Código país: {selectedLocation.country_code}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedLocation}>
            Guardar Ubicación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

LocationConfigModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  deviceName: PropTypes.string,
};
