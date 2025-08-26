import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import SidebarMenu from "../components/sidebarmenu";
import ProfileCard from "../components/profilecard";
import NavbarReplica from "../components/nav";
import axios from "axios";

const Friends = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchRandomUsers = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/users/getrandomusers`,
        { limit: 5 }, // request body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = response.data;

      const processedUsers = data.users.map(user => {
        let profilePic = "https://randomuser.me/api/portraits/women/44.jpg";

        if (user.profile) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
          if (user.profile.profile_photo) {
            profilePic = user.profile.profile_photo.startsWith("http")
              ? user.profile.profile_photo
              : `${baseUrl}/storage/${user.profile.profile_photo}`;
          }
        }

        return {
          ...user,
          profilePic,
          subtitle: user.headline || "No headline provided",
        };
      });

      setFriends(processedUsers);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  fetchRandomUsers();
}, []);

  const onBackToHome = () => {
    navigate("/");
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.subtitle && friend.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <NavbarReplica />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[86rem] mx-auto px-0 md:px-4 py-0 md:py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden md:block md:col-span-3">
              <ProfileCard />
              <SidebarMenu />
            </div>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-9">
              <div className="bg-white rounded-lg shadow-sm border border-[#6974b1] p-4 mx-auto">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <button
                    onClick={onBackToHome}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <h1 className="text-2xl font-semibold font-sf text-gray-900">
                    Friends
                  </h1>
                </div>

                {/* Search Bar */}
                <div className="flex-1 mb-7 relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#343f7b] md:block hidden" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Friends"
                    className="w-full bg-[#efeff3] font-sf rounded-full md:pl-14 pl-4 pr-4 py-2 md:py-4 text-[#343f7b] placeholder:font-semibold placeholder-[#343f7b] outline-none"
                  />
                </div>
                <div className="border-t border-gray-200 my-5"></div>

                {/* Friends Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      {/* Cover Image - Simplified version with just a colored background */}
                      <div className="h-20 bg-gradient-to-r from-blue-400 to-purple-500"></div>

                      {/* Profile Section */}
                      <div className="px-2 pb-2 relative">
                        {/* Profile Picture */}
                        <div className="flex justify-center -mt-8 mb-3">
                          <img
                            src={friend.profilePic}
                            alt={friend.name}
                            className="w-20 h-20 rounded-full border-2 border-white object-cover"
                            onError={(e) => {
                              e.target.src = "https://randomuser.me/api/portraits/women/44.jpg";
                            }}
                          />
                        </div>

                        {/* Name and Subtitle */}
                        <div className="text-center mb-8">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 font-sf">
                            {friend.name}
                          </h3>
                          <p className="text-xs text-gray-500 leading-tight font-sf">
                            {friend.subtitle}
                          </p>
                        </div>

                        {/* Add Friend Button */}
                        <button className="w-full px-4 py-2 bg-[#0017e7] text-white rounded-md hover:bg-[#0015d8] transition-colors text-sm font-medium font-sf">
                          Add Friend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show message if no friends found */}
                {filteredFriends.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-sf">No friends found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Friends;