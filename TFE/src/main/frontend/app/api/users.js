import client from "./client";

const endpoint = "/v1/users";

const getUsers = () => client.get(endpoint);

const register = (userInfo) => client.post(endpoint + "/register", userInfo);

const updateUser = (userInfo) => client.put(endpoint, userInfo);

export default {
  getUsers,
  register,
  updateUser,
};
