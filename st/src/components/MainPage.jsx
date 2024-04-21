import { NavLink } from "react-router-dom";
import { ChatBox } from "./chat/ChatBox";

export const MainPage = () => {
  return (
    <div style={{ display: "flex" }}>
      <div>
        MainPage
        <NavLink to="/user">go to user page</NavLink>
      </div>
      <div>
        <ChatBox />
      </div>
    </div>
  );
};
