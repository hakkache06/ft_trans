import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import logo from "./assets/logo.png";
import { api, SocketContext } from "./utils";
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
  ActionIcon,
  Badge,
  Modal,
  Loader,
  Button,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconHeartHandshake,
  IconHome2,
  IconHourglass,
  IconLogout,
  IconMessages,
  IconPingPong,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { io, Socket } from "socket.io-client";
import { Loading } from "./components/Loading";
import { toast } from "react-hot-toast";
import { UserAvatar } from "./app/Room";
import { useUsers, useAuth, useQueue } from "./stores";
import { ModalsProvider, openContextModal } from "@mantine/modals";
import { NewGame } from "./components/Games/New";

const routes = [
  { icon: IconHome2, label: "Home", to: "/" },
  // {
  //   icon: IconPingPong,
  //   label: "New Game",
  //   onClick: () =>
  //     openContextModal({
  //       modal: "NewGame",
  //       title: "Start a New Game",
  //       centered: true,
  //       transitionDuration: 200,
  //       innerProps: {},
  //     }),
  // },
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
  const [friends, pending, online] = useUsers((state) => [
    state.friends,
    state.pending,
    state.online,
  ]);

  useEffect(() => {}, []);

  const remove = (id: string) => {
    toast.promise(api.delete(`friends/${id}`), {
      loading: "Removing friend",
      success: "Friend removed",
      error: "Failed to remove friend",
    });
  };

  const accept = (id: string) => {
    toast.promise(api.post(`friends/accept/${id}`), {
      loading: "Accepting friend request",
      success: "Friend request accepted",
      error: "Failed to accept friend request",
    });
  };

  return (
    <>
      <Divider
        my="xs"
        variant="dotted"
        labelPosition="center"
        label={
          <>
            <IconHourglass size={12} />
            <Box ml={5}>Pending requests</Box>
          </>
        }
      />
      {pending.length ? (
        pending.map((user) => (
          <div
            className="hover:bg-[#f8f9fa] p-2.5 rounded-[4px] select-none"
            key={user.id}
          >
            <div className="flex gap-4 items-center">
              <UserAvatar user={user} />
              <div className="flex-grow truncate font-medium text-sm">
                {user.name}
              </div>
              <div className="flex gap-2">
                <ActionIcon
                  onClick={() => accept(user.id)}
                  variant="light"
                  color="green"
                >
                  <IconCheck size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => remove(user.id)}
                  variant="light"
                  color="red"
                >
                  <IconX size={18} />
                </ActionIcon>
              </div>
            </div>
          </div>
        ))
      ) : (
        <small className="text-center my-6">No pending requests</small>
      )}
      <Divider
        my="xs"
        variant="dotted"
        labelPosition="center"
        label={
          <>
            <IconHeartHandshake size={12} />
            <Box ml={5}>Your friends</Box>
          </>
        }
      />
      {friends.length ? (
        friends.map((user) => (
          <div
            className="hover:bg-[#f8f9fa] p-2.5 rounded-[4px] select-none"
            key={user.id}
          >
            <div className="flex gap-4 items-center">
              <UserAvatar user={user} />
              <div className="flex-grow truncate font-medium text-sm">
                {user.name}
              </div>
              <div className="flex gap-2">
                {online.includes(user.id) ? (
                  <Badge color="teal" variant="dot">
                    Online
                  </Badge>
                ) : (
                  <Badge color="gray" variant="dot">
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <small className="text-center my-6">No friends yet :(</small>
      )}
    </>
  );
};

function Layout({ user }: { user: any }) {
  const theme = useMantineTheme();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const socket = useContext(SocketContext);
  const [fetchFriends, fetchBlocklist] = useUsers((state) => [
    state.fetchFriends,
    state.fetchBlocklist,
  ]);
  const queue = useQueue((state) => state.queue);
  const navigate = useNavigate();

  const currentRoute = "/" + (pathname + "/").split("/")[1];

  useEffect(() => {
    fetchFriends();
    fetchBlocklist();
    if (!socket) return;
    const old = socket
      .on("users:friends", () => fetchFriends())
      .on("users:blocklist", () => fetchBlocklist())
      .on("game:matched", (id) => {
        navigate(`/game/${id}`);
      });
    return () => {
      old.off("users:friends").off("users:blocklist");
    };
  }, [socket]);

  const cancel = () => {
    if (!socket) return;
    socket.emit("game:cancel");
  };

  const matchmaking = queue.includes(socket?.id || "");

  return (
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
                  onClick={link.onClick}
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

            <Friends />
          </Aside>
        </div>
      }
    >
      <div className="container mx-auto min-h-full flex flex-col">
        <Outlet />
      </div>
      <Modal
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        opened={matchmaking}
        overlayBlur={3}
        onClose={() => {}}
      >
        <div className="flex flex-col items-center justify-center text-center py-5">
          <Loader mt="sm" variant="bars" />
          <h3>Matchmaking in progress</h3>
          <p className="m-0">
            We are searching for another player. You will be redirected to the
            game once a match is found.
          </p>
          <Button mt="lg" color="red" variant="light" onClick={cancel}>
            Cancel search
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default function App() {
  const { token, tfa_required } = useAuth();
  const [socket, setSocket] = useState<Socket>();
  const [user, setUser] = useState<any>();
  const setOnline = useUsers((state) => state.setOnline);
  const setQueue = useQueue((state) => state.setQueue);

  useEffect(() => {
    if (!token || tfa_required) return;
    api
      .get("user/profile")
      .json<any>()
      .then((data) => setUser(data));
  }, []);

  useEffect(() => {
    if (!user) return;
    const s = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });
    s.on("connect", () => {
      toast.success("Connected to server");
    })
      .on("disconnect", () => {
        toast.error("Disconnected from server, please refresh the page");
      })
      .on("users:online", (data: string[]) => setOnline(data))
      .on("game:queue", (data: string[]) => setQueue(data));
    setSocket(s);
    return () => {
      s.disconnect();
      s.removeAllListeners();
    };
  }, [user]);

  if (!token) return <Navigate to="/login" />;
  if (tfa_required) return <Navigate to="/tfa" />;
  if (!user || !socket) return <Loading className="h-screen" />;

  return (
    <SocketContext.Provider value={socket}>
      <ModalsProvider modals={{ NewGame }}>
        <Layout user={user} />
      </ModalsProvider>
    </SocketContext.Provider>
  );
}
