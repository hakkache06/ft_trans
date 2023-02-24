import toast from "react-hot-toast";
import PinField from "react-pin-field";
import { Navigate, useNavigate } from "react-router-dom";
import { api, useAuth } from "../utils";

function Tfa() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.token) return <Navigate to="/login" />;
  if (!auth.tfa_required) return <Navigate to="/" />;

  const validate = (code: string) => {
    toast.promise(
      api
        .post("auth/2fa/authenticate", {
          json: {
            twoFactorAuthenticationCode: code,
          },
        })
        .json<any>()
        .then((data) => {
          auth.login(data.access_token);
          navigate("/");
        }),
      {
        loading: "Verifying...",
        success: <b>Verified successfully!</b>,
        error: <b>Verification failed</b>,
      }
    );
  };

  return (
    <div>
      <PinField
        className="pin-field"
        validate="0123456789"
        inputMode="numeric"
        length={6}
        onComplete={validate}
      />
    </div>
  );
}

export default Tfa;
