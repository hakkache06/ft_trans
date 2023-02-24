import { Card, ScrollArea } from "@mantine/core";
import { Outlet, useParams } from "react-router-dom";

function Chat() {
  let params = useParams();

  console.log(params);
  return (
    <>
      <h1 className="mt-0">Chat</h1>
      <Card
        className="flex-grow flex flex-col"
        withBorder
        shadow="sm"
        radius="md"
        p={0}
      >
        <div className="flex flex-grow">
          <div
            className="min-w-[300px]"
            style={{
              borderRight: "1px solid #dee2e6",
            }}
          >
            <ScrollArea h="100%">test</ScrollArea>
          </div>
          <Outlet />
        </div>
      </Card>
    </>
  );
}

export default Chat;
