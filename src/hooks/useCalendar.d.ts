declare module "@/hooks/useAuth" {
  export function useAuth(): {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    filters: {
      [key: string]: string[];
    };
    setFilters: (filters: { [key: string]: string[] }) => void;

    // Agrega otras propiedades y métodos según sea necesario
  };
}
