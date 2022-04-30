import axios from "axios";
import errorHandler from "../helpers/errorHandler";

async function getTags() {
  try {
    const { data } = await axios({ url: "/api/tags" });

    return data.tags;
  } catch (error) {
    errorHandler(error);
  }
}

export default getTags;
