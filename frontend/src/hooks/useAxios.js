import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../helpers/AuthContextProvider";

export default function useAxios({ url, method, dep }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { headerToken, isAuth } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios({
          url: url,
          method: method,
          // baseURL: ""
          headers: headerToken,
        });

        setData(res.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [headerToken, isAuth, url, method, dep]);

  return { data: data, error: error, loading: loading };
}
