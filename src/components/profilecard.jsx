import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Preloader from "./preloader/Preloader";

const ProfileCard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);     
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!loading) navigate("/profile");
  };

  useEffect(() => {
    let isMounted = true;
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/user/profile/${userId}`)
      .then((res) => {
        if (!isMounted) return;
        // Merge user and profile data
        let userData = {
          ...res.data.user,
          ...res.data.profile,
        };

        // Handle profile photo like group_main_home.jsx
        if (userData.profile_photo) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
          const profilePhotoUrl = userData.profile_photo.startsWith("http")
            ? userData.profile_photo
            : `${baseUrl}/storage/${userData.profile_photo}`;
          userData = {
            ...userData,
            profile_photo: profilePhotoUrl,
          };
        }

        setUserProfile(userData);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.log("Profile API error:", err);
        setError("Failed to load profile");
        setUserProfile(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  
  if (loading) {
    return (
      <Preloader />
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-red-300 p-6 mb-4">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-2 text-sm rounded bg-gray-900 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow border border-[#6974b1] p-6 mb-4 cursor-pointer"
      onClick={handleProfileClick}
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-20 h-20 rounded-full mr-3 flex items-center justify-center bg-white border-2 ${
            userProfile?.profile_photo
              ? "border-transparent"
              : "border-[#6974b1]"
          }`}
        >
          <img
            src={
              userProfile?.profile_photo ||
              "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
            }
            alt="Profile"
            className="w-20 h-20 object-cover rounded-full"
          />
        </div>
        <div>
          <h3 className="font-sf font-semibold text-gray-900">
            {userProfile?.name || "Guest User"}
          </h3>
          <p className="text-sm text-gray-500">
            {userProfile?.profession || "—"}
          </p>
          <p className="text-sm font-medium text-gray-400">
            {userProfile?.location || "—"}
          </p>
        </div>
      </div>

      <div className="flex justify-between text-center border-t pt-3">
        <div>
          <div className="font-bold font text-gray-900 text-lg">90</div>
          <div className="text-xs text-gray-500 font-sf">Posts</div>
        </div>
        <div>
          <div className="font-bold text-gray-900 text-lg">250</div>
          <div className="text-xs text-gray-500 font-sf">Followers</div>
        </div>
        <div>
          <div className="font-bold text-gray-900 text-lg">160</div>
          <div className="text-xs text-gray-500 font-sf">Following</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
