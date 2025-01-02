import client from "./client";

const endpoint = "/authenticate";

const login = (email, password) =>
  client.post(endpoint, { login: email, password });

export default {
  login,
};
