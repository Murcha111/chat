import React, { useState } from "react";
import { useUser } from "../context/UserProvider";
import { NavLink } from "react-router-dom";
import { request } from "../api/apiService";

export const UserPage = () => {
  const { userData, logout, updateUser } = useUser();
  const [uploadedImage, setUploadedImage] = useState(null);

  const photoUrl = `${import.meta.env.VITE_API_URL}/uploads/${
    userData?.user?.photo
  }`;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setUploadedImage(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const apiMethod = "users/update-photo";

      const formData = new FormData();
      formData.append("file", uploadedImage);

      const response = await request("post", `/v1/${apiMethod}`, formData, {
        headers: {
          Authorization: `Bearer ${userData?.tokens.access.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUserData = {
        ...userData,
        user: {
          ...userData.user,
          photo: response?.data.photo,
        },
      };

      updateUser(updatedUserData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <img
        src={photoUrl}
        alt="Uploaded picture"
        style={{ maxWidth: "400px" }}
      />
      <div>
        <NavLink to="/main" style={{ marginRight: "32px" }}>
          go to main page
        </NavLink>
        <NavLink to="/" onClick={logout}>
          выйти X
        </NavLink>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            id="image"
            name="image"
            type="file"
            onChange={handleImageChange}
          />
        </div>
        <button type="submit">Загрузить фото</button>
        <p>name: {userData?.user?.firstName}</p>
        <p>last name: {userData?.user?.lastName}</p>
        <p>email: {userData?.user?.email}</p>
      </form>
    </div>
  );
};
