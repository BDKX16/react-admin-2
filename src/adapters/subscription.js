// Adaptadores para subscripciones
export const createSubscriptionAdapter = (subscriptionData) => ({
  id: subscriptionData._id || subscriptionData.id,
  userId: subscriptionData.userId,
  plan: subscriptionData.plan,
  status: subscriptionData.status,
  startDate: new Date(subscriptionData.startDate),
  endDate: subscriptionData.endDate
    ? new Date(subscriptionData.endDate)
    : undefined,
  cancelledAt: subscriptionData.cancelledAt
    ? new Date(subscriptionData.cancelledAt)
    : undefined,
  createdAt: new Date(subscriptionData.createdAt),
  updatedAt: new Date(subscriptionData.updatedAt),
});

export const createSubscriptionsListAdapter = (subscriptionsData) => {
  return subscriptionsData.map(createSubscriptionAdapter);
};

// Función helper para determinar si el usuario tiene plan pro activo
export const hasActivePro = (subscription) => {
  if (!subscription) return false;

  return (
    subscription.plan === "pro" &&
    subscription.status === "active" &&
    (!subscription.endDate || subscription.endDate > new Date())
  );
};

// Función helper para obtener el estado del plan del usuario
export const getUserPlan = (subscription) => {
  return hasActivePro(subscription) ? "pro" : "free";
};
