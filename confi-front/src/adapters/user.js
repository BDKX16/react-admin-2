const createUserAdapter = (user) => ({
  name: user.data.userData.name,
  token: user.data.token,
  email: user.data.userData.email,
  confirmed: user.data.userData.confirmed,
  role: user.data.userData.role,
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
