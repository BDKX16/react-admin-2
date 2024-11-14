import React from "react";
import { useContext } from "react";
import CalendarContext from "../providers/CalendarProvider";

const useCalendar = () => {
  return useContext(CalendarContext);
};

export default useCalendar;
