import {
  Card,
  Group,
  Text,
  Button,
  CopyButton,
  Input,
  SimpleGrid,
  FileInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PinField from "react-pin-field";
import { Loading } from "../components/Loading";
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

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col items-center text-center">
      <div>
        To enable 2FA, you will have to install an authenticator app on your
        phone. You can use Google Authenticator, Authy, or any other app that is
        compatible with the TOTP standard.
      </div>
      <div className="pt-2">
        Scan the QR code below with your authenticator app:
      </div>
      <img src={qr} />
      <div className="py-2">Or enter the secret manually:</div>
      <CopyButton value={secret as string}>
        {({ copied, copy }) => (
          <Input onClick={copy} component="button">
            {copied ? "Copied!" : secret}
          </Input>
        )}
      </CopyButton>
      <div className="pt-4 pb-2">
        Enter the code from your authenticator app:
      </div>
      <div>
        <PinField
          className="pin-field"
          validate="0123456789"
          inputMode="numeric"
          length={6}
          onComplete={validate}
        />
      </div>
    </div>
  );
}

function EditProfile({ user }: { user: any }) {
  const form = useForm({
    initialValues: {
      avatar: undefined,
      name: user.name,
    },
    validate: {
      name: (value) =>
        !value || value.length < 3
          ? "Name must be at least 3 characters"
          : null,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      (values.avatar
        ? api
            .post("user/upload", {
              body: (() => {
                const f = new FormData();
                f.append("image", values.avatar);
                return f;
              })(),
            })
            .json<{ url: string }>()
            .then((d) => ({
              ...values,
              avatar: d.url,
            }))
        : Promise.resolve(values)
      ).then((values) =>
        api
          .patch("user/profile", {
            json: values,
          })
          .then(() => {
            window.location.reload();
          })
      ),
      {
        loading: "Saving...",
        success: <b>Saved successfully!</b>,
        error: <b>Saving failed</b>,
      }
    );
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <FileInput
        label="Your avatar"
        placeholder="Select an image"
        accept="image/png,image/jpeg"
        icon={<IconUpload size={14} />}
        {...form.getInputProps("avatar")}
      />
      <TextInput
        mt="md"
        withAsterisk
        label="Display name"
        placeholder="Enter a name"
        {...form.getInputProps("name")}
      />
      <Group position="right" mt="md">
        <Button type="submit">Save</Button>
      </Group>
    </form>
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

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="mt-0">Profile</h1>
      <SimpleGrid
        cols={2}
        spacing="lg"
        breakpoints={[{ maxWidth: 980, cols: 1, spacing: "md" }]}
      >
        <Card withBorder shadow="sm" radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Text weight={500}>Two Factor Authentication</Text>
            </Group>
          </Card.Section>
          <Card.Section py="md" inheritPadding>
            {user.tfa ? (
              <div>
                <div className="mb-2">
                  Two factor auth is enabled. You can disable it below.
                </div>
                <Button color="red" onClick={disable2FA}>
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <EnableTfa reload={load} />
            )}
          </Card.Section>
        </Card>
        <Card withBorder shadow="sm" radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Text weight={500}>User Details</Text>
            </Group>
          </Card.Section>
          <Card.Section py="md" inheritPadding>
            <EditProfile user={user} />
          </Card.Section>
        </Card>
      </SimpleGrid>
    </div>
  );
}

export default Profile;
