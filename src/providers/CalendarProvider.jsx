import React, { createContext, useState, useEffect } from "react";

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState([]);
  //const [loading, setLoading] = useState(true);

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        filters,
        setFilters,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarContext;
