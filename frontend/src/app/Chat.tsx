import {
  Box,
  Button,
  Card,
  Center,
  Modal,
  ScrollArea,
  SegmentedControl,
} from "@mantine/core";
import {
  IconCode,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMessagePlus,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";

function NewRoom() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create new room"
        centered
        overlayBlur={3}
      >
        <SegmentedControl
          data={[
            {
              value: "public",
              label: (
                <Center>
                  <IconUsers size={16} />
                  <Box ml={10}>Public</Box>
                </Center>
              ),
            },
            {
              value: "protected",
              label: (
                <Center>
                  <IconLock size={16} />
                  <Box ml={10}>Protected</Box>
                </Center>
              ),
            },
            {
              value: "private",
              label: (
                <Center>
                  <IconEyeOff size={16} />
                  <Box ml={10}>Private</Box>
                </Center>
              ),
            },
          ]}
        />
      </Modal>
      <Button
        leftIcon={<IconMessagePlus size={14} />}
        onClick={() => setOpened(true)}
      >
        New room
      </Button>
    </>
  );
}

function Chat() {
  let params = useParams();

  console.log(params);
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0">Chat</h1>
        <NewRoom />
      </div>
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
