export const createTemplateAdapter = (template) => ({
  id: template._id,
  name: template.name,
  createdAt: template.createdAt,
  validityFrom: template.validityFrom,
  validityTo: template.validityTo,
  active: template.active,
  components: template.components.map((component) => ({ ...component })),
});
