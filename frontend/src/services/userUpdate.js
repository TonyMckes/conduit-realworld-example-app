import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function userUpdate({ headers, bio, email, image, password, username }) {
  try {
    const { data } = await axios({
      data: { user: { bio, email, image, password, username } },
      headers,
      method: "PUT",
      url: "api/user",
    });

    const { user } = data;

    const loggedIn = { headers, isAuth: true, loggedUser: user };

    localStorage.setItem("loggedUser", JSON.stringify(loggedIn));

    return loggedIn;
  } catch (error) {
    errorHandler(error);
  }
}

export default userUpdate;
