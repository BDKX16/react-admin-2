const createChartDataAdapter = (data) => ({
  time: data.time,
  value: data.value,
  variable: data.variable,
});

const createChartDateTimeAdapter = (data) => ({
  time: new Date(data.time),
  value: data.value,
  variable: data.variable,
});

const createChartDateTimeAdapterActuator = (data) => ({
  time: new Date(data.time),
  value: data.value == 1 || data.value == 3 ? 100 : 0,
  variable: data.variable,
});

export {
  createChartDataAdapter,
  createChartDateTimeAdapter,
  createChartDateTimeAdapterActuator,
};
