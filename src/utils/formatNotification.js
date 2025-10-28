export const formatNotification = (notif) => {
  let fullName = notif.variableFullName;
  if (notif.variableFullName === "Hum") {
    fullName = "humedad ambiente";
  } else if (notif.variableFullName === "Hum suelo") {
    fullName = "humedad del suelo";
  } else if (notif.variableFullName === "Temp") {
    fullName = "temperatura";
  }
  let condicion = notif.condition;
  if (notif.condition === "<") {
    condicion = "menor";
  } else if (notif.condition === ">") {
    condicion = "mayor";
  } else if (notif.condition === "=>" || notif.condition === ">=") {
    condicion = "mayor o igual";
  } else if (notif.condition === "=<" || notif.condition === "<=") {
    condicion = "menor o igual";
  } else if (notif.condition === "=") {
    condicion = "igual";
  } else if (notif.condition === "!=") {
    condicion = "distinto";
  }

  return "La " + fullName + " es " + condicion + " que " + notif.value;
};
