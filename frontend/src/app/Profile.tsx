import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PinField from "react-pin-field";
import { api } from "../utils";

function EnableTfa({ reload }: { reload: () => void }) {
  const [qr, setQr] = useState<string>();
  const [secret, setSecret] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("auth/qrcode")
      .json<any>()
      .then((data) => {
        setQr(data.qr);
        setSecret(data.secret);
        setLoading(false);
      });
  }, []);

  const validate = (code: string) => {
    toast.promise(
      api
        .post("auth/2fa/turn-on", {
          json: {
            twoFactorAuthenticationCode: code,
            secret,
          },
        })
        .then(() => {
          reload();
        }),
      {
        loading: "Enabling...",
        success: <b>Enabled successfully!</b>,
        error: <b>Enabling failed</b>,
      }
    );
  };

  return (
    <div className="shadow">
      <h2>Enable authenticator app</h2>
      <p>
        To enable 2FA, you will have to install an authenticator app on your
        phone. You can use Google Authenticator, Authy, or any other app that is
        compatible with the TOTP standard.
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Scan the QR code below with your authenticator app:</p>
          <img src={qr} />
          <p>Or enter the secret manually:</p>
          <p>{secret}</p>
          <PinField
            className="pin-field"
            validate="0123456789"
            inputMode="numeric"
            length={6}
            onComplete={validate}
          />
        </>
      )}
    </div>
  );
}

function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>();

  const load = () => {
    setLoading(true);
    api
      .get("user/profile")
      .json<any>()
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  };

  const disable2FA = () => {
    toast.promise(
      api.delete("auth/2fa/turn-off").then(() => {
        load();
      }),
      {
        loading: "Disabling...",
        success: <b>Disabled successfully!</b>,
        error: <b>Disabling failed</b>,
      }
    );
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1>Profile</h1>
      {loading ? (
        <p>Loading...</p>
      ) : user.tfa ? (
        <p>
          2FA is enabled
          <Button onClick={disable2FA}>Disable</Button>
        </p>
      ) : (
        <EnableTfa reload={load} />
      )}
    </div>
  );
}

export default Profile;
