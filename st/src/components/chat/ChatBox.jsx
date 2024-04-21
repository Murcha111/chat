import io from "socket.io-client";
import { useEffect, useState } from "react";

const API_VERSION = "v1";
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

import { request } from "src/api/apiService";
import { useUser } from "src/context/UserProvider";
import { Storage } from "src/store/store";
const newStore = new Storage();

const socketUrl = `${API_URL}`;

// socket initialization here causes connection retries
const socket = io(socketUrl, {
  transports: ["websocket"],
  autoConnect: false
});

export const ChatBox = () => {
  // Chat and questions container state
  const { userData } = useUser();
  const accessToken = userData.tokens.access.token;

  // Chat state
  const [like, setLike] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [shouldReconnect, setShouldReconnect] = useState(false);

  // Questions block state
  const [speaker, setSpeaker] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [questionMessage, setQuestionMessage] = useState("");
  const [questions, setQuestions] = useState(
    newStore.get("questionsToSpeaker") || []
  );

  // Connect to chat
  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    socket.on("received like", () => {
      setLike(true);
      console.log("Received like!");
    });
  }, []);

  useEffect(() => {
    try {
      const getHistoryMessages = async () => {
        const path = "messages";
        const method = "get";
        const messagesResponse = await request(
          method,
          `/${API_VERSION}/${path}`
        );

        const newMessages = messagesResponse.data;
        const filteredMessages = newMessages.filter(
          (msg) => !chatMessages.some((existing) => existing.id === msg.id)
        );

        const updatedMessages = [...chatMessages, ...filteredMessages].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setChatMessages(updatedMessages);
      };

      socket.on("received message", (data) =>
        setChatMessages((prevMessages) => [...prevMessages, data])
      );
      getHistoryMessages();
    } catch (error) {
      console.log(error);
    }
    return () => {
      socket.off("received message");
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    let timeout;

    if (like) {
      timeout = setTimeout(() => {
        setLike(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [like]);

  const fetchOneTimeToken = async (accessToken) => {
    try {
      if (accessToken == null) {
        stopReconnection(new Error("no access token provided"));
      }

      const method = "post";
      const path = "auth/get-one-time";
      const response = await request(
        method,
        `/${API_VERSION}/${path}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.statusText !== "OK") {
        stopReconnection(new Error("no access token provided"));
        throw new Error(`api call ${path} failed: ${response.status}`);
      }
      const oneTimeTokenResponse = response.data.oneTime.token;

      return oneTimeTokenResponse;
    } catch (error) {
      stopReconnection(e);
    }
  };

  const handleSendMessage = () => {
    socket.emit("send message", { msg: chatMessage });
    setChatMessage("");
  };

  const handleClickLike = () => {
    socket.emit("send like");
  };

  const handleQuestionsend = async () => {
    try {
      const response = await request(
        "post",
        "/v1/questions",
        {
          message: questionMessage,
          speaker: speaker,
          isAnonymous,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response) {
        setQuestions((prev) => [...prev, response.data]);
        newStore.setQuestions("questionsToSpeaker", response.data);
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setQuestionMessage("");
      setSpeaker("");
      setIsAnonymous(false);
    }
  };

  const connect = async () => {
    setShouldReconnect(true);
    if (!accessToken) {
      stopReconnection(new Error("no access token provided"));
    }
    await reconnect();
  };

  const reconnect = async () => {
    try {
      const oneTimeTokenResponse = await fetchOneTimeToken(accessToken);

      socket.io.opts.query = {
        ...socket.io.opts.query,
        oneTimeToken: oneTimeTokenResponse,
        reconnection: false,
        autoConnect: false,
      };

      socket.on("connect", () => {
        console.log("Connected to server!!!");
      });

      socket.on("disconnect", () => {
        onDisconnect();
        if (shouldReconnect) setTimeout(async () => reconnect(), 500);
      });
      socket.on("connect_error", (e) => {
        console.log("connection error:", e);
        if (shouldReconnect) setTimeout(async () => reconnect(), 500);
      });
    } catch (e) {
      return stopReconnection(e);
    }
  };

  const stopReconnection = (error) => {
    setShouldReconnect(false);
    console.log(error);
  };

  const onDisconnect = () => {
    console.log("disconnected!");
  };
  //TODO speakers array GET
  return (
    <>
      <div id="chat">
        <input
          type="text"
          placeholder="MESSAGE"
          id="chat-message"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
        />
        {chatMessages.map((messageData) => (
          <div
            key={messageData.id}
            style={{ display: "flex", marginBottom: "8px" }}
          >
            <div style={{ marginRight: "20px" }}>
              {messageData.user.firstName}:
            </div>

            <div> {messageData.message}</div>
          </div>
        ))}

        <button id="chat-send" onClick={handleSendMessage}>
          Отправить сообщение в чат
        </button>
        <button id="chat-like" onClick={handleClickLike}>
          Лайк! 💜
        </button>

        <div
          style={{
            display: like ? "block" : "none",
          }}
        >
          💜
        </div>

        <div style={{ marginTop: "150px" }}>
          <input
            type="text"
            placeholder="MESSAGE for Speaker"
            id="chat-message-speaker"
            value={questionMessage}
            onChange={(e) => setQuestionMessage(e.target.value)}
          />
          <label htmlFor="select">Выберите спикера:</label>
          <select
            name="speakers"
            id="speakers-select"
            onChange={(e) => setSpeaker(e.target.value)}
          >
            <option value="">Выберите спикера</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="hamster">Hamster</option>
            <option value="parrot">Parrot</option>
            <option value="spider">Spider</option>
            <option value="goldfish">Goldfish</option>
          </select>
          <button id="chat-like" onClick={handleQuestionsend}>
            Отправить вопрос спикеру
          </button>
          <input
            checked={isAnonymous}
            type="checkbox"
            id="anonymous"
            name="anonymous"
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <label htmlFor="anonimus">Анонимно</label>
        </div>
        <div>
          <p>Ваши вопросы</p>
          <div>
            <ul>
              {questions?.length > 0 &&
                questions.map((el) => (
                  <li key={el.id}>{el.message}</li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
