import { Button } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconPingPong, IconUserPlus } from "@tabler/icons-react";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { useQueue } from "../stores";
import { SocketContext } from "../utils";

function Games() {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);

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
        .emitWithAck("game:join")
        .then((data) => {
          if (!data.done) throw new Error("Could not find a game");
          return data;
        });
    } catch {
      createGame();
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0">Games</h1>
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
    </>
  );
}

export default Games;
