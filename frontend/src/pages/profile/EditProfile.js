import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";
import { selectUser } from "../../redux/features/auth/authSlice";
import "./Profile.scss";
import { toast } from "react-toastify";
import { updateUser } from "../../services/authService";
import ChangePassword from "../../components/changePassword/ChangePassword";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiInfo,
  FiImage,
  FiSave,
} from "react-icons/fi";

const EditProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(selectUser);
  const { email } = user;

  useEffect(() => {
    if (!email) {
      navigate("/profile");
    }
  }, [email, navigate]);

  const initialState = {
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    bio: user?.bio,
    photo: user?.photo,
  };
  const [profile, setProfile] = useState(initialState);
  const [profileImage, setProfileImage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageURL;
      if (
        profileImage &&
        (profileImage.type === "image/jpeg" ||
          profileImage.type === "image/jpg" ||
          profileImage.type === "image/png")
      ) {
        const image = new FormData();
        image.append("file", profileImage);
        image.append("cloud_name", "zinotrust");
        image.append("upload_preset", "wk66xdkq");

        // First save image to cloudinary
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/zinotrust/image/upload",
          { method: "post", body: image }
        );
        const imgData = await response.json();
        imageURL = imgData.url.toString();
      }

      // Save Profile
      const formData = {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        photo: profileImage ? imageURL : profile.photo,
      };

      const data = await updateUser(formData);
      toast.success("Profile updated");
      navigate("/profile");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="profile">
      <div className="page-header">
        <h3>
          <FiUser /> Edit Profile
        </h3>
      </div>

      {isLoading && <Loader />}

      <Card cardClass="card">
        <div className="profile-photo">
          <img
            src={user?.photo}
            alt="profile"
          />
        </div>
        <div className="profile-data">
          <form onSubmit={saveProfile}>
            <div className="info-group">
              <label>
                <FiUser /> Name
              </label>
              <input
                type="text"
                name="name"
                value={profile?.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-group">
              <label>
                <FiMail /> Email
              </label>
              <input
                type="text"
                name="email"
                value={profile?.email}
                disabled
              />
              <small>Email cannot be changed.</small>
            </div>
            <div className="info-group">
              <label>
                <FiPhone /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={profile?.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="info-group">
              <label>
                <FiInfo /> Bio
              </label>
              <textarea
                name="bio"
                value={profile?.bio}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>
            <div className="info-group">
              <label>
                <FiImage /> Profile Photo
              </label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
              />
            </div>
            <div className="action-buttons">
              <button
                type="submit"
                className="--btn --btn-primary"
              >
                <FiSave /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </Card>

      <ChangePassword />
    </div>
  );
};

export default EditProfile;
