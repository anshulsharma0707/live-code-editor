const ParticipantsPanel = ({ participants }) => {

  return (
    <div className="w-[220px] bg-[#161b22] border-r border-[#30363d] p-4">

      <h2 className="text-gray-200 font-semibold mb-4">
        Participants
      </h2>

      {participants.map((user,index)=>(
        <div
          key={index}
          className="bg-[#0d1117] p-2 rounded mb-2 text-sm"
        >
          👤 {user}
        </div>
      ))}

    </div>
  )

}

export default ParticipantsPanel