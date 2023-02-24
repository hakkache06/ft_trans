import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api, useAuth, useQuery } from "../utils";

function Login() {
  const params = useQuery();
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("code")) {
      setLoading(true);
      const code = params.get("code");
      toast.promise(
        api
          .get(`auth?code=${code}`)
          .json<any>()
          .then((data) => {
            auth.login(data.access_token);
            navigate("/");
          })
          .catch((e) => {
            setLoading(false);
            throw e;
          }),
        {
          loading: "Logging in...",
          success: <b>Logged in successfully!</b>,
          error: <b>Login failed</b>,
        }
      );
    }
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome to Trandandan</h1>
      <p>Sign in with your 42 account to continue</p>
      <a href={`${import.meta.env.VITE_BACKEND_URL}/auth/redirect`}>
        <Button color="dark">Sign in with 42</Button>
      </a>
    </div>
  );
}

export default Login;
