import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function userLogin({ email, password }) {
  try {
    const { data } = await axios({
      data: { user: { email, password } },
      method: "POST",
      url: "api/users/login",
    });

    const { user } = data;
    const headers = { Authorization: `Token ${user.token}` };

    const loggedIn = { headers, isAuth: true, loggedUser: user };

    localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

    return loggedIn;
  } catch (error) {
    errorHandler(error);
  }
}

export default userLogin;
