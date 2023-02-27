import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Drawer,
  Group,
  Loader,
  MantineNumberSize,
  Menu,
  Modal,
  PasswordInput,
  ScrollArea,
  SegmentedControl,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconBan,
  IconCheck,
  IconCrown,
  IconCrownOff,
  IconDeviceGamepad2,
  IconDoorExit,
  IconEyeCheck,
  IconEyeOff,
  IconFriends,
  IconFriendsOff,
  IconHandOff,
  IconHandStop,
  IconListDetails,
  IconMessagePlus,
  IconSend,
  IconSettings,
  IconUserCircle,
  IconUserOff,
  IconUserPlus,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { addMinutes, format } from "date-fns";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading } from "../components/Loading";
import { types } from "../shared";
import { useAuth, useUsers } from "../stores";
import { api, SocketContext } from "../utils";

export function Welcome() {
  return (
    <div className="w-full flex flex-col text-center justify-center items-center">
      <h2 className="mt-0">Welcome to chat</h2>
      <div className="text-gray-500">Select a room to start chatting</div>
    </div>
  );
}

function EditRoom({ room }: { room: Room }) {
  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      name: room.name,
      type: room.type,
      password: "",
    },
    validate: {
      name: (value) => (!value ? "Room name is required" : null),
      password: (value, v) =>
        v.type == "protected" && (!value || value.length < 8)
          ? "Password must be at least 8 characters"
          : null,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      api
        .put(`rooms/${room.id}`, {
          json: values,
        })
        .then(() => {
          setOpened(false);
        }),
      {
        loading: "Updating...",
        success: <b>Updated successfully!</b>,
        error: <b>Updating failed</b>,
      }
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Update room"
        centered
        overlayBlur={3}
      >
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            withAsterisk
            label="Room name"
            placeholder="Enter a name"
            {...form.getInputProps("name")}
          />
          {form.values["type"] === "protected" && (
            <PasswordInput
              {...form.getInputProps("password")}
              mt="md"
              withAsterisk
              label="Room password"
              placeholder="Protect your room with a password"
              visibilityToggleIcon={({ reveal, size }) =>
                reveal ? (
                  <IconEyeOff size={size} />
                ) : (
                  <IconEyeCheck size={size} />
                )
              }
            />
          )}
          <SegmentedControl
            mt="md"
            {...form.getInputProps("type")}
            data={Object.entries(types)
              .filter((v) => v[1].label)
              .map(([value, { label, icon }]) => ({
                value,
                label: (
                  <Center>
                    {icon}
                    <Box ml={10}>{label}</Box>
                  </Center>
                ),
              }))}
          />
          <Group mt="md">
            <Button type="submit">Update room</Button>
          </Group>
        </form>
      </Modal>

      <ActionIcon onClick={() => setOpened(true)} variant="light">
        <IconSettings size={18} />
      </ActionIcon>
    </>
  );
}

function Messages({
  id,
  currentUser,
}: {
  id: string;
  currentUser: Room["RoomUser"][0];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const form = useForm({
    initialValues: {
      message: "",
    },
  });
  const socket = useContext(SocketContext);
  const viewport = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onNewMessage = useCallback((payload: Message) => {
    setMessages((messages) => [...messages, payload]);
  }, []);

  useEffect(() => {
    socket?.emit("room:join", id);
    socket?.on("room:message:new", onNewMessage);
    setLoading(true);
    api
      .get(`messages/${id}`)
      .json<Message[]>()
      .then((res) => {
        setMessages(res);
      })
      .catch((err) => {
        toast.error("Failed to load messages");
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      socket?.off("room:message:new", onNewMessage);
      socket?.emit("room:leave", id);
    };
  }, [id]);

  const onSubmit = (values: typeof form.values) => {
    if (!values.message) return;
    setSending(true);
    socket?.emit(
      "room:message:send",
      {
        content: values.message,
        room_id: id,
      },
      () => {
        setSending(false);
        form.reset();
      }
    );
  };

  const onRefChange = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
      });
    }
    viewport.current = node;
  }, []);

  if (loading) return <Loading className="flex-grow" />;

  const mutedUntil = currentUser.mute
    ? new Date(currentUser.mute) > new Date()
      ? new Date(currentUser.mute)
      : null
    : null;

  return (
    <>
      <ScrollArea
        viewportRef={onRefChange}
        style={{
          borderBottom: "1px solid #dee2e6",
          borderTop: "1px solid #dee2e6",
        }}
        className="flex-grow"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </ScrollArea>
      {mutedUntil ? (
        <div className="p-3">
          You have been muted by an admin. You can't send messages until{" "}
          {format(new Date(mutedUntil), "Pp")}
        </div>
      ) : (
        <div className="p-3">
          <form onSubmit={form.onSubmit(onSubmit)}>
            <TextInput
              {...form.getInputProps("message")}
              placeholder="Type your message..."
              rightSection={
                !sending ? (
                  <ActionIcon type="submit">
                    <IconSend size={18} />
                  </ActionIcon>
                ) : (
                  <Loader size="xs" />
                )
              }
            />
          </form>
        </div>
      )}
    </>
  );
}

function Message({ message }: { message: Message }) {
  const [blocklist] = useUsers((state) => [state.blocklist]);

  if (blocklist.includes(message.user.id)) return null;

  return (
    <div
      key={message.id}
      className="p-3 flex gap-3 hover:bg-slate-50 transition-colors"
    >
      <UserAvatar user={message.user} size="md" />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{message.user.name}</span>{" "}
          <small>{format(new Date(message.created_at), "Pp")}</small>
        </div>
        <div>{message.content}</div>
      </div>
    </div>
  );
}

function RoomUsers({
  room,
  currentUser,
}: {
  room: Room;
  currentUser: Room["RoomUser"][0];
}) {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  const kick = (id: string) => {
    toast.promise(
      api.delete(`rooms/${room.id}/users/${id}`, { json: { user_id: id } }),
      {
        loading: "Kicking user...",
        success: "User kicked",
        error: "Failed to kick user",
      }
    );
  };

  const mute = (id: string, minutes: number = 0) => {
    toast.promise(
      api.patch(`rooms/${room.id}/users/${id}`, {
        json: {
          mute: minutes ? addMinutes(new Date(), minutes).toISOString() : null,
        },
      }),
      {
        loading: "Muting user...",
        success: minutes ? "User muted" : "User unmuted",
        error: "Failed to mute user",
      }
    );
  };

  const toggleAdmin = (id: string, admin: boolean) => {
    toast.promise(
      api.patch(`rooms/${room.id}/users/${id}`, {
        json: {
          admin: !admin,
        },
      }),
      {
        loading: "Updating user...",
        success: "User updated",
        error: "Failed to update user",
      }
    );
  };

  const toggleBan = (id: string, banned: boolean) => {
    toast.promise(
      api.patch(`rooms/${room.id}/users/${id}`, {
        json: {
          ban: !banned,
        },
      }),
      {
        loading: "Updating user...",
        success: "User updated",
        error: "Failed to update user",
      }
    );
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        overlayBlur={3}
        title="Room members"
        padding="xl"
        size="xl"
        position="right"
      >
        {room.RoomUser.map(({ user, mute: m, admin, owner, ban }) => (
          <Box
            key={user.id}
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
              <UserAvatar user={user} />
              <Box sx={{ flex: 1 }}>
                <Text size="sm" weight={500}>
                  {user.name}{" "}
                  {ban ? (
                    <Badge color="red">Banned</Badge>
                  ) : owner ? (
                    <Badge color="teal">Owner</Badge>
                  ) : admin ? (
                    <Badge color="yellow">Admin</Badge>
                  ) : null}
                </Text>
              </Box>
              {currentUser.admin &&
                currentUser.user.id != user.id &&
                !owner && (
                  <div className="flex gap-2">
                    {currentUser.admin && (
                      <ActionIcon
                        variant="light"
                        onClick={() => toggleAdmin(user.id, admin)}
                      >
                        {admin ? (
                          <IconCrownOff size={18} />
                        ) : (
                          <IconCrown size={18} />
                        )}
                      </ActionIcon>
                    )}
                    {m ? (
                      <ActionIcon
                        onClick={() => mute(user.id, 0)}
                        variant="light"
                      >
                        <IconVolume size={18} />
                      </ActionIcon>
                    ) : (
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light">
                            <IconVolumeOff size={18} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item onClick={() => mute(user.id, 15)}>
                            15 Minutes
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 30)}>
                            30 Minutes
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 60)}>
                            1 Hour
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 60 * 24)}>
                            1 Day
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 60 * 24 * 7)}>
                            1 Week
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                    <ActionIcon onClick={() => kick(user.id)} variant="light">
                      <IconUserOff size={18} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => toggleBan(user.id, ban)}
                      variant="light"
                      color={ban ? "green" : "red"}
                    >
                      {ban ? <IconCheck size={18} /> : <IconBan size={18} />}
                    </ActionIcon>
                  </div>
                )}
            </Group>
          </Box>
        ))}
      </Drawer>

      <ActionIcon onClick={() => setOpened(true)} variant="light">
        <IconListDetails size={18} />
      </ActionIcon>
    </>
  );
}

export function UserAvatar({
  user,
  size,
}: {
  user: Room["RoomUser"][0]["user"];
  size?: MantineNumberSize;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [friends, blocklist] = useUsers((state) => [
    state.friends,
    state.blocklist,
  ]);

  const dm = () => {
    toast.promise(
      api
        .post(`rooms/dm/${user.id}`)
        .json<{ id: string }>()
        .then(({ id }) => {
          navigate(`/chat/${id}`);
        }),
      {
        loading: "Retrieving direct messages...",
        success: "Direct messages retrieved",
        error: "Failed to retrieve direct messages",
      }
    );
  };

  const addFriend = () => {
    toast.promise(
      api.post(`friends/${user.id}`).catch(async (e) => {
        throw (await e.response.json()).message;
      }),
      {
        loading: "Adding friend...",
        success: "Friend request sent",
        error: (e) => e,
      }
    );
  };

  const removeFriend = () => {
    toast.promise(api.delete(`friends/${user.id}`), {
      loading: "Removing friend",
      success: "Friend removed",
      error: "Failed to remove friend",
    });
  };

  const block = () => {
    toast.promise(api.post(`blocklist/${user.id}`), {
      loading: "Blocking user...",
      success: "User blocked",
      error: "Failed to block user",
    });
  };

  const unblock = () => {
    toast.promise(api.delete(`blocklist/${user.id}`), {
      loading: "Unblocking user...",
      success: "User unblocked",
      error: "Failed to unblock user",
    });
  };

  return (
    <Menu shadow="md" withArrow>
      <Menu.Target>
        <Avatar
          sx={{
            cursor: "pointer",
          }}
          src={user.avatar}
          radius="xl"
          size={size || "sm"}
        />
      </Menu.Target>

      <Menu.Dropdown>
        <Link to={`/users/${user.id}`}>
          <Menu.Item icon={<IconUserCircle size={14} />}>Profile</Menu.Item>
        </Link>
        {user.id !== auth.id && (
          <>
            {friends.find((f) => f.id === user.id) ? (
              <Menu.Item
                onClick={removeFriend}
                icon={<IconFriendsOff size={14} />}
              >
                Remove friend
              </Menu.Item>
            ) : (
              <Menu.Item onClick={addFriend} icon={<IconFriends size={14} />}>
                Add friend
              </Menu.Item>
            )}
            <Menu.Item onClick={dm} icon={<IconMessagePlus size={14} />}>
              Private message
            </Menu.Item>
            <Menu.Item icon={<IconDeviceGamepad2 size={14} />}>
              Invite to game
            </Menu.Item>
            {blocklist.includes(user.id) ? (
              <Menu.Item onClick={unblock} icon={<IconHandOff size={14} />}>
                Unblock user
              </Menu.Item>
            ) : (
              <Menu.Item onClick={block} icon={<IconHandStop size={14} />}>
                Block user
              </Menu.Item>
            )}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

function Room() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room>();
  const [passwordRequired, setPasswordRequired] = useState(false);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { id: user_id } = useAuth();
  const form = useForm({
    initialValues: {
      password: "",
    },
  });

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      api
        .post(`rooms/${id}/users`, {
          json: values,
        })
        .then(() => loadRoom())
        .catch(async (e) => {
          throw (await e.response.json()).message;
        }),
      {
        loading: "Joining...",
        success: <b>Joined successfully!</b>,
        error: (e) => <b>{e}</b>,
      }
    );
  };

  const loadRoom = useCallback(() => {
    setLoading(true);
    setRoom(undefined);
    api
      .get(`rooms/${id}`)
      .json<Room>()
      .then((res) => {
        setRoom(res);
      })
      .catch(async (err) => {
        if (err.response.status === 403) {
          setPasswordRequired((await err.response.json()).password);
        } else {
          toast.error("Failed to load room");
          navigate("/chat");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const leave = () => {
    toast.promise(
      api
        .delete(`rooms/${id}/users`)
        .then(() => {
          navigate("/chat");
        })
        .catch(async (e) => {
          throw (await e.response.json()).message;
        }),
      {
        loading: "Leaving...",
        success: <b>Left successfully!</b>,
        error: (e) => <b>{e}</b>,
      }
    );
  };

  useEffect(() => {
    loadRoom();
    socket?.on("room:updated", loadRoom);
    return () => {
      socket?.off("room:updated", loadRoom);
    };
  }, [id]);

  if (loading) return <Loading className="w-full !h-auto" />;

  if (!room)
    return (
      <div className="w-full flex flex-col text-center justify-center items-center">
        <div>
          <h2 className="mt-0">You are not a member</h2>
          <div className="text-gray-500">
            Join to start chatting in this room
          </div>
          <form onSubmit={form.onSubmit(onSubmit)}>
            {passwordRequired && (
              <PasswordInput
                {...form.getInputProps("password")}
                mt="md"
                placeholder="Enter the room password"
                visibilityToggleIcon={({ reveal, size }) =>
                  reveal ? (
                    <IconEyeOff size={size} />
                  ) : (
                    <IconEyeCheck size={size} />
                  )
                }
              />
            )}
            <Button type="submit" mt="md" leftIcon={<IconUserPlus size={14} />}>
              Join room
            </Button>
          </form>
        </div>
      </div>
    );

  const currentUser = room.RoomUser.find((u) => u.user.id === user_id)!;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full p-3 flex justify-between">
        <span className="font-bold text-lg">{room.name}</span>
        <div className="flex gap-3">
          {currentUser?.owner && <EditRoom room={room} />}
          <RoomUsers room={room} currentUser={currentUser} />
          {room.type !== "dm" && (
            <ActionIcon onClick={leave} variant="light" color="red">
              <IconDoorExit size={18} />
            </ActionIcon>
          )}
        </div>
      </div>
      <Messages id={room.id} currentUser={currentUser} />
    </div>
  );
}

export default Room;
