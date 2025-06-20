const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        messageId:msg._id,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json(data._id);
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
module.exports.editMessage =async(req,res)=>{
  const {messageId,newMessage} = req.body;

  
  try {
    const updatedMessages = await Messages.findByIdAndUpdate(messageId,{
      message: { text: newMessage },
    }, {
      new: true, 
      runValidators: true, 
    });
    if (updatedMessages) {
      return res.json(newMessage);
    } else {
      return res.json({ msg: "Failed to update message." });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error." });
  }
}
