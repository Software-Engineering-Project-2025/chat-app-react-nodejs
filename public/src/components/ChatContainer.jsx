import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import { FaEdit } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

export default function ChatContainer({ currentChat, socket, currentId }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(recieveMessageRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    };

    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (data) => {
        setArrivalMessage({ fromSelf: false, message: data.msg,messageId:data.messageId });
      });

      socket.current.on("msg-changed", (data) => {
        console.log("dıd I get the message?", data);
        console.log("can I see all messages?", messages);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === data.messageId
              ? { ...msg, message: data.newMessage }
              : msg
          )
        );
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off("msg-recieve");
        socket.current.off("msg-changed");
      }
    };
  }, [socket, messages]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    const response = await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });
    socket.current.emit("send-msg", {
      messageId:response.data,
      to: currentChat._id,
      from: data._id,
      msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg, messageId: response.data });
    setMessages(msgs);
  };

  const handleEditMessage = async (messageId) => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/messages/editmsg",
        {
          messageId,
          newMessage,
        }
      );

      const updatedMessages = messages.map((message) => {
        if (message.messageId === messageId) {
          return { ...message, message: response.data };
        }
        return message;
      });

      setMessages(updatedMessages);
      setEditingMessageId(null);
      setNewMessage("");
      socket.current.emit("send-changed-msg", {
        messageId,
        newMessage: response.data,
        to: currentChat._id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img src={`${currentChat.avatarImage}`} alt="" />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout socket={socket} currentId={currentId} />
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div ref={scrollRef} key={message.messageId || uuidv4()}>
            <div
              className={`message ${message.fromSelf ? "sended" : "recieved"}`}
            >
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="content"
              >
                {message.fromSelf && (
                  <span className="edit-icon">
                    <FaEdit
                      onClick={() => {
                        console.log(messages);

                        if (editingMessageId === message.messageId) {
                          setEditingMessageId(null);
                          setNewMessage("");
                        } else {
                          setEditingMessageId(message.messageId);
                          setNewMessage(message.message);
                        }
                      }}
                    />
                  </span>
                )}

                {editingMessageId === message.messageId ? (
                  <>
                    <textarea
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault(); // Enter ile satır atlamayı engeller
                          if (newMessage.trim().length > 0) {
                            handleEditMessage(message.messageId);
                          }
                        }
                      }}
                      placeholder="Edit message"
                    />
                    <IoMdSend
                      className="send-edit-btn"
                      onClick={() => {
                        if (newMessage.trim().length > 0) {
                          handleEditMessage(message.messageId);
                        }
                      }}
                    />
                  </>
                ) : (
                  <p>{message.message}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar {
        img {
          height: 3rem;
        }
      }

      .username {
        h3 {
          color: white;
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;

      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }

        textarea {
          width: 100%;
          resize: vertical;
          padding: 0.5rem;
          font-size: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #ccc;
          margin-right: 0.5rem;
          background-color: #1e1e2f;
          color: white;
          outline: none;
        }
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #4f04ff21;
      }
    }

    .recieved {
      justify-content: flex-start;

      .content {
        background-color: #9900ff20;
      }
    }
  }

  .edit-icon {
    display: none;
    margin-right: 0.5rem;
    color: #ccc;
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.2s ease;
  }

  .content:hover .edit-icon {
    display: inline-block;
  }

  .message.editing .edit-icon {
    display: inline-block;
  }
`;
