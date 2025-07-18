import React, { useState, useEffect } from "react";
import styled from "styled-components";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import multiavatar from "@multiavatar/multiavatar/esm";
import axios from "axios";
import { host } from "../utils/APIRoutes";
 
export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const host = "http://localhost:5000/api/auth";
 
 
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
 
  useEffect(() => {
    if (!localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)) {
      navigate("/login");
    } else {
      const user = JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      // Eğer kullanıcı avatarı daha önce seçtiyse ana sayfaya yönlendir
      if (user.isAvatarImageSet) {
        navigate("/");
      }
    }
    // Generating avatars
    const generatedAvatars = [];
    for (let i = 0; i < 4; i++) {
      generatedAvatars.push(multiavatar(`Avatar${Math.random()}`));
    }
    setAvatars(generatedAvatars);
    setIsLoading(false);
  }, [navigate]);
 
  const setProfilePicture = async () => {
  if (selectedAvatar === undefined) {
    toast.error("Please select an avatar image.");
  } else {
    // Retrieve current user from localStorage (or the auth context if you're using one)
    const user = await JSON.parse(localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY));
   
    // The selected avatar, passed as Base64 or image URL (from your avatar options)
    const avatarImage = avatars[selectedAvatar];
 
    // Send the POST request to save the avatar in MongoDB
    const response = await axios.post(`${host}/setavatar/${user._id}`, { image: avatarImage });
 
    // Update the user in the local storage after saving it to the DB
    if (response.data.isSet) {
      user.isAvatarImageSet = true;
      user.avatarImage = response.data.image;
      localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(user));
      navigate("/");  // Redirect to home or another page
    } else {
      toast.error("Error saving avatar. Please try again.");
    }
  }
};
 
  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${
                  selectedAvatar === index ? "selected" : ""
                }`}
                onClick={() => setSelectedAvatar(index)}
              >
                <div dangerouslySetInnerHTML={{ __html: avatar }} />
              </div>
            ))}
          </div>
          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}
 
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;
 
  .loader {
    max-inline-size: 100%;
  }
 
  .title-container {
    h1 {
      color: white;
    }
  }
 
  .avatars {
    display: flex;
    gap: 2rem;
 
    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
 
      svg {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }
 
    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }
 
  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
`;
