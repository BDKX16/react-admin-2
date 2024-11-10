export function formatDateToString(dateString) {
  if (!dateString) {
    return "Sin fecha";
  }
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let dayString = day.toString();
  if (day === 1) {
    dayString += "ro";
  }

  return `${dayString} de ${month} ${year}`;
}
