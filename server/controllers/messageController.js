const Messages = require("../models/messageModel");
const { encrypt, decrypt } = require("../utils/CryptoUtils"); // Make sure path and filename case match

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: { $all: [from, to] },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      let decrypted = "Could not decrypt";

      try {
        decrypted = decrypt(msg.message.text);
      } catch (err) {
        console.error("❌ Decryption failed:", err.message);
      }

      return {
        fromSelf: msg.sender.toString() === from,
        message: decrypted,
      };
    });

    res.json(projectedMessages);
  } catch (ex) {
    console.error("❌ getMessages error:", ex);
    res.status(500).json({ msg: "Error retrieving messages" });
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    if (!message || !from || !to) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const encryptedMessage = encrypt(message);
    console.log("📦 Encrypted message to store:", encryptedMessage);

    const data = await Messages.create({
      message: { text: encryptedMessage },
      users: [from, to],
      sender: from,
    });

    if (data) {
      return res.json({ msg: "Message added successfully." });
    } else {
      return res.status(500).json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    console.error("❌ addMessage error:", ex);
    res.status(500).json({ msg: "Server error while adding message" });
  }
};
