import { Button } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconPingPong } from "@tabler/icons-react";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Game from "../components/Game";
import { Loading } from "../components/Loading";
import { api, SocketContext } from "../utils";

function Games() {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);

  const createGame = () =>
    openContextModal({
      modal: "NewGame",
      title: "Start a New Game",
      centered: true,
      transitionDuration: 200,
      overlayBlur: 3,
      innerProps: {},
    });

  const join = async () => {
    if (!socket) return;
    setLoading(true);
    try {
      await socket
        .timeout(10000)
        .emitWithAck("game:queue")
        .then((data) => {
          if (!data.done) throw new Error("Could not find a game");
          return data;
        });
    } catch {
      createGame();
    }
    setLoading(false);
  };

  const loadGames = useCallback(() => {
    setLoading(true);
    api
      .get("games")
      .json<Game[]>()
      .then((res) => setGames(res))
      .catch(() => toast.error("Failed to load games"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    loadGames();
    socket.on("games:updated", loadGames);
    return () => {
      socket.off("games:updated");
    };
  }, [socket]);

  if (loading && !games.length) return <Loading className="w-full h-screen" />;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0">Live Games</h1>
        <div className="flex gap-2">
          <Button
            loading={loading}
            leftIcon={<IconPingPong size={14} />}
            onClick={join}
          >
            New Game
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {games.map((game) => (
          <Game game={game} />
        ))}
      </div>
    </>
  );
}

export default Games;
