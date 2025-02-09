declare module "@/hooks/useCalendar" {
  export function useCalendar(): {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    filters: {
      [key: string]: string[];
    };
    setFilters: (filters: { [key: string]: string[] }) => void;

    // Agrega otras propiedades y métodos según sea necesario
  };
}
