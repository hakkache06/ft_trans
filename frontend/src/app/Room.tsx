export function Welcome() {
  return (
    <div className="w-full border-l flex flex-col text-center justify-center items-center">
      <h2 className="mt-0">Welcome to chat</h2>
      <div className="text-gray-500">Select a room to start chatting</div>
    </div>
  );
}

function Room() {
  return <div>room</div>;
}

export default Room;
