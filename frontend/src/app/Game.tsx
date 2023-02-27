import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Table from "../components/Game/Table";
import { Loading } from "../components/Loading";
import { UserAvatar } from "../components/UserAvatar";
import { api, SocketContext } from "../utils";

function Game() {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<Game>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const loadGame = useCallback(() => {
    setLoading(true);
    api
      .get(`games/${id}`)
      .json<Game>()
      .then((res) => setGame(res))
      .catch(() => {
        toast.error("Failed to load game");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setGame(undefined);
    loadGame();
  }, [id]);

  if (loading || !game) return <Loading className="w-full !h-auto" />;

  return (
    <>
      <div className="flex items-center gap-10 mb-4">
        <div className="flex flex-col items-end flex-grow">
          <UserAvatar user={game.player1} size="lg" />
          <div className="flex-grow truncate font-medium text-lg mt-2">
            {game.player1.name}
          </div>
        </div>
        <div className="font-bold text-xl">VS</div>
        <div className="flex flex-col flex-grow">
          <UserAvatar user={game.player2} size="lg" />
          <div className="flex-grow truncate font-medium text-lg mt-2">
            {game.player2.name}
          </div>
        </div>
      </div>
      <Table />
      <div className="flex justify-between items-center mb-4"></div>
    </>
  );
}

export default Game;
