import Chat from "../Chat"

const ChatPanel = ({socket,roomId,username}) => {

  return (
    <div className="w-[280px] bg-[#161b22] border-l border-[#30363d]">

      <Chat
        socket={socket}
        roomId={roomId}
        username={username}
      />

    </div>
  )

}

export default ChatPanel