// kanzi.js - the secret guardian of chat wisdom 🐒🍌

const lexigram = {
  banana: "🍌",
  hello: "👋",
  fire: "🔥",
  hug: "🤗",
  chat: "💬",
  kanzi: "🦍",
};

function summonKanzi() {
  console.log("🔮 Summoning Kanzi...");
  console.log("🗿 Ancient Lexigram Activated:");

  for (const word in lexigram) {
    console.log(`${word.toUpperCase()} ➡️ ${lexigram[word]}`);
  }

  console.log("✨ Kanzi whispers: 'Security and bananas are the keys to happiness.'");
}

// Hidden message if this file is run directly
if (require.main === module) {
  summonKanzi();
}

module.exports = {
  summonKanzi,
  lexigram,
};
