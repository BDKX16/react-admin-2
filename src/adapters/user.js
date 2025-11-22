const createUserAdapter = (user) => {
  // Manejar tanto la estructura de login como de verify-email
  const userData = user.data?.userData || user.userData;
  const token = user.data?.token || user.token;

  return {
    name: userData.name,
    token: token,
    email: userData.email,
    confirmed: userData.confirmed,
    id: userData._id,

    // Subscription data
    plan: userData.plan || "free",

    // Login method (normal, google, etc.)
    loginMethod: userData.loginMethod || "normal",

    // Google Auth data (if exists)
    googleAuth: userData.googleAuth || null,

    // Onboarding flag
    needsOnboarding:
      user.data?.needsOnboarding !== undefined
        ? user.data.needsOnboarding
        : userData.needsOnboarding,
  };
};

const createUserManagmentAdapter = (user) => ({
  id: user._id,
  confirmed: user.confirmed,
  email: user.email,
  name: user.name,
  role: user.role,
  nullDate: user.nullDate,
  createdAt: user.createdAt,
});

export { createUserAdapter, createUserManagmentAdapter };
