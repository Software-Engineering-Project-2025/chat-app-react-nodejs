const Messages = require("../models/messageModel");
const { encrypt, decrypt } = require("../utils/CryptoUtils");

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
        console.error("Decryption failed:", err.message);
      }

      return {
        fromSelf: msg.sender.toString() === from,
        messageId: msg._id, 
        message: decrypted,
        date:msg.updatedAt
      };
    });
    
    res.json(projectedMessages);
  } catch (ex) {
    console.error("getMessages error:", ex);
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

    const data = await Messages.create({
      message: { text: encryptedMessage },
      users: [from, to],
      sender: from,
    });

    if (data) {
      return res.json(data._id); 
    } else {
      return res.status(500).json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    console.error("addMessage error:", ex);
    res.status(500).json({ msg: "Server error while adding message" });
  }
};

module.exports.editMessage = async (req, res) => {
  const { messageId, newMessage } = req.body;

  if (!messageId || !newMessage) {
    return res.status(400).json({ msg: "Missing required fields." });
  }

  try {
    const encrypted = encrypt(newMessage); 

    const updatedMessage = await Messages.findByIdAndUpdate(
      messageId,
      { message: { text: encrypted } },
      { new: true, runValidators: true }
    );

    if (updatedMessage) {
      return res.json(newMessage);
    } else {
      return res.status(404).json({ msg: "Message not found." });
    }
  } catch (error) {
    console.error("editMessage error:", error);
    return res.status(500).json({ msg: "Internal server error." });
  }
};

module.exports.deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  if (!messageId) {
    return res.status(400).json({ msg: "Missing required fields." });
  }
  try {
    const deleted = await Messages.findByIdAndDelete(messageId);
    if (deleted) {
      return res.json({ success: true });
    } else {
      return res.status(404).json({ msg: "Message not found." });
    }
  } catch (error) {
    console.error("deleteMessage error:", error);
    return res.status(500).json({ msg: "Internal server error." });
  }
};
