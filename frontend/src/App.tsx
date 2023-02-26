import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import logo from "./assets/logo.png";
import { api, SocketContext, useAuth } from "./utils";
import { useContext, useEffect, useState } from "react";
import {
  AppShell,
  Aside,
  Avatar,
  Box,
  Center,
  createStyles,
  Group,
  Navbar,
  Stack,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
  Text,
  Divider,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHeartHandshake,
  IconHome2,
  IconLogout,
  IconMessages,
  IconPingPong,
  IconUserCircle,
} from "@tabler/icons-react";
import { io, Socket } from "socket.io-client";
import { Loading } from "./components/Loading";
import { toast } from "react-hot-toast";

const routes: any[] = [
  { icon: IconHome2, label: "Home", to: "/" },
  { icon: IconPingPong, label: "Games", to: "/games" },
  { icon: IconMessages, label: "Chat", to: "/chat" },
];

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  active: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface NavbarLinkProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?(): void;
  to?: string;
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
  to,
}: NavbarLinkProps) {
  const { classes, cx } = useStyles();

  return (
    <Tooltip label={label} position="right" transitionDuration={100}>
      {to ? (
        <Link to={to}>
          <UnstyledButton
            onClick={onClick}
            className={cx(classes.link, { [classes.active]: active }, "mt-1")}
          >
            <Icon stroke={1.5} />
          </UnstyledButton>
        </Link>
      ) : (
        <UnstyledButton
          onClick={onClick}
          className={cx(classes.link, { [classes.active]: active }, "mt-1")}
        >
          <Icon stroke={1.5} />
        </UnstyledButton>
      )}
    </Tooltip>
  );
}

const Friends = () => {
  const socket = useContext(SocketContext);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("users:online", (data: any) => {
      setOnline(data);
    });
    return () => {
      socket.off("users:online");
    };
  }, [socket]);

  return <>online: {JSON.stringify(online, null, 4)}</>;
};

export default function App() {
  const theme = useMantineTheme();
  const { token, tfa_required, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket>();
  const { pathname } = useLocation();

  const currentRoute = "/" + (pathname + "/").split("/")[1];

  const connect = () => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });
    socket.on("connect", () => {
      toast.success("Connected to server");
    });
    socket.on("disconnect", () => {
      toast.error("Disconnected from server, please refresh the page");
    });
    socket.on("connect_error", (error) => {
      toast.error("Couldn't connect, please refresh the page");
    });
    setSocket(socket);
  };

  useEffect(() => {
    if (!token || tfa_required) return;
    api
      .get("user/profile")
      .json<any>()
      .then((data) => {
        setUser(data);
        connect();
      });
    return () => {
      if (socket) {
        socket.disconnect();
        socket.removeAllListeners();
      }
    };
  }, []);

  if (!token) return <Navigate to="/login" />;
  if (tfa_required) return <Navigate to="/tfa" />;
  if (!socket) return <Loading className="h-screen" />;

  return (
    <SocketContext.Provider value={socket}>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={
          <Navbar width={{ base: 80 }} p="md">
            <Center>
              <img src={logo} className="h-8" alt="Logo" />
            </Center>
            <Navbar.Section grow mt={12}>
              <Stack justify="center" spacing={0}>
                {routes.map((link) => (
                  <NavbarLink
                    {...link}
                    key={link.label}
                    active={link.to === currentRoute}
                    to={link.to}
                  />
                ))}
              </Stack>
            </Navbar.Section>
            <Navbar.Section>
              <Stack justify="center" spacing={0}>
                <NavbarLink
                  active={currentRoute === "/profile"}
                  to="/profile"
                  icon={IconUserCircle}
                  label="Profile"
                />
                <NavbarLink onClick={logout} icon={IconLogout} label="Logout" />
              </Stack>
            </Navbar.Section>
          </Navbar>
        }
        aside={
          <div className="hidden lg:block">
            <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
              {user && (
                <Link to={`/users/${user.id}`}>
                  <UnstyledButton
                    sx={{
                      display: "block",
                      width: "100%",
                      padding: theme.spacing.xs,
                      borderRadius: theme.radius.sm,
                      color:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[0]
                          : theme.black,

                      "&:hover": {
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : theme.colors.gray[0],
                      },
                    }}
                  >
                    <Group>
                      <Avatar src={user.avatar} radius="xl" size="sm" />
                      <Box sx={{ flex: 1 }}>
                        <Text size="sm" weight={500}>
                          {user.name}
                        </Text>
                      </Box>

                      {theme.dir === "ltr" ? (
                        <IconChevronRight size={18} />
                      ) : (
                        <IconChevronLeft size={18} />
                      )}
                    </Group>
                  </UnstyledButton>
                </Link>
              )}
              <Divider
                my="xs"
                variant="dotted"
                labelPosition="center"
                label={
                  <>
                    <IconHeartHandshake size={12} />
                    <Box ml={5}>Your friends:</Box>
                  </>
                }
              />
              <Friends />
            </Aside>
          </div>
        }
      >
        <div className="container mx-auto min-h-full flex flex-col">
          <Outlet />
        </div>
      </AppShell>
    </SocketContext.Provider>
  );
}
