import {
  ActionIcon,
  Avatar,
  Button,
  Loader,
  PasswordInput,
  ScrollArea,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconEyeCheck,
  IconEyeOff,
  IconInfoSquareRounded,
  IconSend,
  IconUserPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Loading } from "../components/Loading";
import { api, SocketContext } from "../utils";

export function Welcome() {
  return (
    <div className="w-full flex flex-col text-center justify-center items-center">
      <h2 className="mt-0">Welcome to chat</h2>
      <div className="text-gray-500">Select a room to start chatting</div>
    </div>
  );
}

interface Message {
  id: 2;
  content: string;
  created_at: string;
  room_id: string;
  from_id: string;
  user: {
    avatar: string;
    name: string;
    id: string;
  };
}

interface Room {
  RoomUser: [
    {
      user: {
        avatar: string;
      };
      admin: boolean;
      mute: string | null;
    }
  ];
  id: string;
  name: string;
  password: string | null;
  id_user_owner: string;
  type: "public" | "private" | "protected";
}

function Messages({ id }: { id: string }) {
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

  return (
    <>
      <ScrollArea
        viewportRef={onRefChange}
        style={{
          borderBottom: "1px solid #dee2e6",
          borderTop: "1px solid #dee2e6",
        }}
        className="flex-grow max-h-[calc(100vh-212px)]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className="p-3 flex gap-3 hover:bg-slate-50 transition-colors"
          >
            <Avatar src={message.user.avatar} radius="xl" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{message.user.name}</span>{" "}
                <small>{format(new Date(message.created_at), "Pp")}</small>
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
      </ScrollArea>
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
    </>
  );
}

function Room() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room>();
  const [passwordRequired, setPasswordRequired] = useState(false);
  const navigate = useNavigate();
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

  const loadRoom = () => {
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
  };

  useEffect(() => {
    loadRoom();
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

  return (
    <div className="w-full flex flex-col">
      <div className="w-full p-3 flex justify-between">
        <span className="font-bold text-lg">{room.name}</span>
        <ActionIcon>
          <IconInfoSquareRounded size={18} />
        </ActionIcon>
      </div>
      <Messages id={room.id} />
    </div>
  );
}

export default Room;
