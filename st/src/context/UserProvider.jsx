import { createContext, useContext, useState } from "react";

import { request } from "../api/apiService";

import { Storage } from "../store/store";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const store = new Storage();
  const [isAuth, setIsAuth] = useState(false);

  const [userData, setUserData] = useState(store.get("userData"));

  const updateUser = (userData) => {
    setUserData(userData);
    store.set("userData", userData);
  };

  const login = async (credentials) => {
    try {
      const response = await request("post", "/v1/auth/login", credentials);

      if (response.statusText === "OK") {
        const userData = response.data;
        updateUser(userData);
        setIsAuth(true);
        return true;
      } else {
        setIsAuth(false);
        return false;
      }
    } catch (error) {
      setIsAuth(false);
      console.error(`Something went wrong: ${error}`);
      return false;
    }
  };

  const logout = () => {
    setUserData(null);
    store.destroy("userData");
    store.destroy("questionsToSpeaker");
    setIsAuth(false);
  };

  return (
    <UserContext.Provider
      value={{ userData, login, logout, isAuth, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
