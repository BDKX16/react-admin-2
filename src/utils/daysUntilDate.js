export const daysUntilDate = (date) => {
  const today = new Date();
  const targetDate = new Date(date);
  const timeDifference = targetDate.getTime() - today.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  if (daysDifference == 0) return "Hoy";
  if (daysDifference == 1) return "Mañana";
  if (daysDifference == -1) return "Ayer";
  if (daysDifference < 0) return "Hace " + Math.abs(daysDifference) + " dias";
  return "En " + daysDifference + " dias";
};

export const daysUntilDateTime = (date) => {
  const today = new Date();
  const targetDate = new Date(date);
  const timeDifference = targetDate.getTime() - today.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  if (daysDifference == 0) {
    const hoursDifference = Math.ceil(timeDifference / (1000 * 3600));
    if (hoursDifference == 0) {
      const minutesDifference = Math.ceil(timeDifference / (1000 * 60));
      return "Hace " + Math.abs(minutesDifference) + " minutos";
    }
    return "Hace " + Math.abs(hoursDifference) + " horas";
  }
  if (daysDifference == 1) return "Mañana";
  if (daysDifference == -1) return "Ayer";
  if (daysDifference < 0) return "Hace " + Math.abs(daysDifference) + " dias";
  return "En " + daysDifference + " dias";
};
