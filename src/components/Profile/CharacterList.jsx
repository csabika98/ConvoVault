import CharacterCard from "./CharacterCard";

function CharacterList() {
 
  return (
    <>
      <div>
        <CharacterCard
          character={{
            name: "Mira",
            description: "Calm, analytical, and slightly sarcastic. Speaks concisely and notices details.",
            avatarUrl: "",
            initials: "M",
          }}
          selected={true}
          onSelect={() => console.log("select character")}
          onDelete={() => console.log("delete character")}
        />
      </div>
    </>
  )
}

export default CharacterList;
