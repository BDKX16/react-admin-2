const createUserAdapter = (user) => ({
  name: user.data.userData.name,
  token: user.data.token,
  email: user.data.userData.email,
  confirmed: user.data.userData.confirmed,
  id: user.data.userData._id,

  // Subscription data
  plan: user.data.userData.plan || "free",

  // Login method (normal, google, etc.)
  loginMethod: user.data.userData.loginMethod || "normal",

  // Google Auth data (if exists)
  googleAuth: user.data.userData.googleAuth || null,
});

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
