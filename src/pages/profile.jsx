import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Edit3,
  MoreHorizontal,
  MapPin,
  Gem,
  Key,
  Globe,
  Bell,
  Ban,
  HelpCircle,
  Power,
  LogOut,
  Lock,
} from "lucide-react";
import NavbarReplica from "../components/nav";
import Person1 from "../assets/images/person-1.png";
import PostTab from "../components/profilecomponents/post_tab";
import EditCover from "../components/profilecomponents/edit_cover";
import EditProfile from "../components/profilecomponents/edit_profile_photo";
import EditIntro from "../components/profilecomponents/edit_intro";
import ReqMembership from "../components/profilecomponents/request_membership";
import AboutTab from "../components/profilecomponents/about_tab";
import MediaTabPhotos from "../components/profilecomponents/media_tab_photos";
import AboutFriendsTab from "../components/profilecomponents/about_friends_tab";
import AboutAgencyTab from "../components/profilecomponents/about_agency_tab";
import Badges from "../components/profilecomponents/badges";
import BadgesTab from "../components/profilecomponents/badges_tab";
import VerifiedMembershipsTab from "../components/profilecomponents/verified_memberships_tab";
import AccountKeySettings from "../components/profilecomponents/account_key_settings";
import PrivacySettings from "../components/profilecomponents/privacy_settings";
import LanguageSettings from "../components/profilecomponents/select_language";
import ManageNotification from "../components/profilecomponents/manage_notification";
import BlockedUser from "../components/profilecomponents/blocked_user";
import DeactivateAccount from "../components/profilecomponents/deactivate_account";
import HelpCenter from "../components/profilecomponents/help_center";
import axios from "axios";
import Preloader from "../components/preloader/Preloader";
import PostImage from "../assets/images/postimage.png";

const Profile = () => {
  // API posts state - Added similar to Post.jsx
  const [apiPosts, setApiPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchedPostIds, setFetchedPostIds] = useState([]);

  // Static post data (fallback) - keeping original data
  const textPosts = [
    {
      id: 1,
      type: "text",
      content:
        "Just finished an amazing UI/UX project! Really excited about the results.",
      timestamp: "2024-01-15T10:30:00Z",
      likes: 25,
      comments: 5,
    },
    {
      id: 2,
      type: "text",
      content:
        "Working on some new design patterns today. The creative process never stops!",
      timestamp: "2024-01-14T14:20:00Z",
      likes: 18,
      comments: 3,
    },
  ];

  const imagePosts = [
    {
      id: 3,
      type: "image",
      content: "Check out this new design mockup I created",
      image:
        "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=500&h=400&fit=crop",
      timestamp: "2024-01-13T16:45:00Z",
      likes: 42,
      comments: 8,
    },
  ];

  const videoPosts = [
    {
      id: 4,
      type: "video",
      content: "Behind the scenes of my design process",
      video:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail:
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=400&fit=crop",
      timestamp: "2024-01-12T09:15:00Z",
      likes: 67,
      comments: 12,
    },
  ];

  // Other existing state variables
  const [showeditcoverPopup, setShoweditcoverPopup] = useState(false);
  const [showeditprofilePopup, setShoweditprofilePopup] = useState(false);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);
  const [showeditintroPopup, setShoweditintroPopup] = useState(false);
  const [showreqmemPopup, setShowreqmemPopup] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showAccountKeySettings, setShowAccountKeySettings] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showManageNotification, setShowManageNotification] = useState(false);
  const [showBlockedUser, setShowBlockedUser] = useState(false);
  const [showDeactivateAccount, setShowDeactivateAccount] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [currentBannerPhoto, setCurrentBannerPhoto] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const [suggestedError, setSuggestedError] = useState(null);

  // API Integration Functions - Similar to Post.jsx
  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/getauthenticatedposts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            already_fetched_ids: fetchedPostIds,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Convert API posts to display format first
        const newConvertedPosts = convertApiPostsToDisplayFormat(data);

        // Extract all newly received post IDs
        const newIds = [
          ...data.text_posts.map((p) => p.id),
          ...data.image_posts.map((p) => p.id),
          ...data.video_posts.map((p) => p.id),
        ];

        // Append new posts to existing posts array (maintaining order)
        setApiPosts((prevPosts) => [...prevPosts, ...newConvertedPosts]);

        // Update the list of fetched post IDs
        setFetchedPostIds((prevIds) =>
          Array.from(new Set([...prevIds, ...newIds]))
        );

        // If nothing new is returned
        if (newIds.length === 0) {
          setHasMore(false);
        }
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert API posts to match existing structure
  const convertApiPostsToDisplayFormat = (apiData) => {
    // Get base URL without /api
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

    const convertedPosts = [];

    // Convert text posts
    apiData.text_posts.forEach((post) => {
      convertedPosts.push({
        id: post.id,
        type: "text",
        content: post.content,
        timestamp: post.created_at,
        likes: 0,
        comments: 0,
        user: post.user,
        uniqueId: `text_${post.id}`,
      });
    });

    // Convert image posts
    apiData.image_posts.forEach((post) => {
      const imageUrl = post.media?.file
        ? post.media.file.startsWith("http")
          ? post.media.file
          : `${baseUrl}/storage/${post.media.file}`
        : PostImage;

      convertedPosts.push({
        id: post.id,
        type: "image",
        content: post.content,
        image: imageUrl,
        timestamp: post.created_at,
        likes: 0,
        comments: 0,
        user: post.user,
        uniqueId: `image_${post.id}`,
      });
    });

    // Convert video posts
    apiData.video_posts.forEach((post) => {
      const videoUrl = post.media?.file
        ? post.media.file.startsWith("http")
          ? post.media.file
          : `${baseUrl}/storage/${post.media.file}`
        : "";

      convertedPosts.push({
        id: post.id,
        type: "video",
        content: post.content,
        video: videoUrl,
        thumbnail: PostImage,
        timestamp: post.created_at,
        likes: 0,
        comments: 0,
        user: post.user,
        uniqueId: `video_${post.id}`,
      });
    });

    // Sort this batch by timestamp (newest first within this batch)
    return convertedPosts.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  // Get combined posts (API + static as fallback)
  const getCombinedPosts = () => {
    // If we have API posts, use them, otherwise use static posts
    if (apiPosts.length > 0) {
      return apiPosts; // Return as is, maintaining pagination order
    } else {
      // Return static posts as fallback with proper structure
      const staticPosts = [
        ...textPosts.map((post, index) => ({
          ...post,
          uniqueId: `text_${post.id || index}`,
        })),
        ...imagePosts.map((post, index) => ({
          ...post,
          uniqueId: `image_${post.id || index}`,
        })),
        ...videoPosts.map((post, index) => ({
          ...post,
          uniqueId: `video_${post.id || index}`,
        })),
      ];

      // Sort static posts by timestamp
      return staticPosts.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
  };

  const combinedPosts = getCombinedPosts();

  // Separate posts by type for backward compatibility
  const getPostsByType = (type) => {
    return combinedPosts.filter((post) => post.type === type);
  };

  const number_of_text_posts = getPostsByType("text").length;
  const number_of_image_posts = getPostsByType("image").length;
  const number_of_video_posts = getPostsByType("video").length;

  const text_posts_data = getPostsByType("text");
  const image_posts_data = getPostsByType("image");
  const video_posts_data = getPostsByType("video");

  const [activeTab, setActiveTab] = useState("Posts");
  const tabs = [
    "Posts",
    "About",
    "Media",
    "Friends",
    "My Work",
    "My Agencies",
    "My Badges",
    "Verified Memberships",
  ];

  const suggestedPeople = [
    {
      id: 1,
      name: "Arshpixels",
      role: "UI/UX Product Designer",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
    },
    {
      id: 2,
      name: "Jaiwad singh",
      role: "WebApp Developer",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop",
    },
    {
      id: 3,
      name: "Code By Rixa",
      role: "QR Developer",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
    },
    {
      id: 4,
      name: "Arjit Designs",
      role: "Graphic Designer",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
    },
    {
      id: 5,
      name: "NexusDesigns",
      role: "Brand Photographer",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop",
    },
  ];

  const totalPosts =
    number_of_text_posts + number_of_image_posts + number_of_video_posts;

  const iconRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [userProfile, setUserProfile] = useState(null);

  // Load initial posts
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL}/user/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data.user);

        // Handle profile photo
        if (data.user && data.user.profile && data.user.profile.profile_photo) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
          const profilePhotoUrl = data.user.profile.profile_photo.startsWith(
            "http"
          )
            ? data.user.profile.profile_photo
            : `${baseUrl}/storage/${data.user.profile.profile_photo}`;

          console.log("Profile Photo URL:", profilePhotoUrl);
          setCurrentProfilePhoto(profilePhotoUrl);
        }

        // Handle banner photo
        if (data.user && data.user.profile && data.user.profile.cover_photo) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
          const bannerPhotoUrl = data.user.profile.cover_photo.startsWith(
            "http"
          )
            ? data.user.profile.cover_photo
            : `${baseUrl}/storage/${data.user.profile.cover_photo}`;

          console.log("Banner Photo URL:", bannerPhotoUrl);
          setCurrentBannerPhoto(bannerPhotoUrl);
        }
      })
      .catch(() => setUserProfile(null));
  }, [refreshTrigger]);

  useEffect(() => {
    if (
      showeditcoverPopup ||
      showeditprofilePopup ||
      showeditintroPopup ||
      showreqmemPopup ||
      showAccountKeySettings ||
      showPrivacySettings ||
      showLanguageSettings ||
      showManageNotification ||
      showBlockedUser ||
      showDeactivateAccount ||
      showHelpCenter
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [
    showeditcoverPopup,
    showeditprofilePopup,
    showeditintroPopup,
    showreqmemPopup,
    showAccountKeySettings,
    showPrivacySettings,
    showLanguageSettings,
    showManageNotification,
    showBlockedUser,
    showDeactivateAccount,
    showHelpCenter,
  ]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest(".profile-dropdown-menu") &&
        !event.target.closest(".profile-dropdown-toggle")
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const fetchRandomUsers = async () => {
      try {
        setSuggestedLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/getrandomusers`,
          { limit: 5 },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const processedUsers = response.data.users.map((user) => {
          let profilePic = "https://randomuser.me/api/portraits/women/44.jpg";

          if (user.profile?.profile_photo) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(
              "/api",
              ""
            );
            profilePic = user.profile.profile_photo.startsWith("http")
              ? user.profile.profile_photo
              : `${baseUrl}/storage/${user.profile.profile_photo}`;
          }

          return {
            id: user.id,
            name: user.name,
            role: user.profile?.headline || "No headline",
            image: profilePic,
          };
        });

        setSuggestedUsers(processedUsers);
        setSuggestedLoading(false);
      } catch (err) {
        setSuggestedError(err.message);
        setSuggestedLoading(false);
      }
    };

    fetchRandomUsers();
  }, []);

  const handleDropdownToggle = () => {
    if (!showDropdown && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 256,
      });
    }
    setShowDropdown((prev) => !prev);
  };

  const handleEditIntroClose = () => {
    setShoweditintroPopup({ show: false });
    setRefreshTrigger((prev) => prev + 1);
  };

  if (userProfile === null) {
    return <Preloader />;
  }

  return (
    <>
      {showeditcoverPopup && (
        <EditCover
          onClose={() => setShoweditcoverPopup(false)}
          currentCoverPhoto={currentBannerPhoto}
          onCoverUpdate={(newPhoto) => {
            setCurrentBannerPhoto(newPhoto);
            // Update the userProfile state as well
            setUserProfile((prev) => ({
              ...prev,
              profile: {
                ...prev.profile,
                cover_photo: newPhoto,
              },
            }));
          }}
        />
      )}
      {showeditprofilePopup && (
        <EditProfile
          onClose={() => setShoweditprofilePopup(false)}
          currentProfilePhoto={currentProfilePhoto}
          onProfileUpdate={(newPhoto) => {
            setCurrentProfilePhoto(newPhoto);
            setUserProfile((prev) => ({
              ...prev,
              profile: {
                ...prev.profile,
                profile_photo: newPhoto,
              },
            }));
          }}
        />
      )}
      {showeditintroPopup.show && (
        <EditIntro
          onClose={handleEditIntroClose}
          initialData={{
            name: showeditintroPopup.name,
            headline: showeditintroPopup.headline,
            location: showeditintroPopup.location,
          }}
          userId={userProfile?.id}
        />
      )}

      {showreqmemPopup && (
        <ReqMembership onClose={() => setShowreqmemPopup(false)} />
      )}
      {showBadgesModal && <Badges onClose={() => setShowBadgesModal(false)} />}
      {showAccountKeySettings && (
        <AccountKeySettings onClose={() => setShowAccountKeySettings(false)} />
      )}
      {showPrivacySettings && (
        <PrivacySettings onClose={() => setShowPrivacySettings(false)} />
      )}
      {showLanguageSettings && (
        <LanguageSettings onClose={() => setShowLanguageSettings(false)} />
      )}
      {showManageNotification && (
        <ManageNotification onClose={() => setShowManageNotification(false)} />
      )}
      {showBlockedUser && (
        <BlockedUser onClose={() => setShowBlockedUser(false)} />
      )}
      {showDeactivateAccount && (
        <DeactivateAccount onClose={() => setShowDeactivateAccount(false)} />
      )}
      {showHelpCenter && (
        <HelpCenter onClose={() => setShowHelpCenter(false)} />
      )}
      <NavbarReplica />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[86rem] mx-auto px-0 md:px-4 py-0 md:py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Main Profile Section */}
            <div className="col-span-1 md:col-span-8">
              <div className="bg-white rounded-lg border border-[#7c87bc] shadow-lg overflow-hidden">
                {/* Cover Photo */}
                <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
                  <img
                    src={
                      currentBannerPhoto ||
                      "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?_gl=1*1ssvgvw*_ga*MzkyNzI2MjYwLjE3NDY2MzYwNzY.*_ga_8JE65Q40S6*czE3NTI2OTA2MDckbzE5JGcxJHQxNzUyNjkwNjYyJGo1JGwwJGgw"
                    }
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setShoweditcoverPopup(true)}
                    className="absolute top-4 right-4 border border-[#707070] bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="px-10 pb-6">
                  {/* Profile Picture */}
                  <div className="relative -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                      <img
                        src={
                          currentProfilePhoto ||
                          (userProfile &&
                            userProfile.profile &&
                            userProfile.profile.profile_photo) ||
                          "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <button
                      onClick={() => setShoweditprofilePopup(true)}
                      className="absolute bottom-2 -right-5 bg-white border border-[#707070] p-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="relative mb-7 bg-white rounded-md mt-5">
                    {/* Edit Button */}
                    <button
                      onClick={() =>
                        setShoweditintroPopup({
                          show: true,
                          name: userProfile?.name,
                          headline: userProfile?.profile?.headline,
                          location: userProfile?.profile?.location,
                        })
                      }
                      className="absolute top-10 -right-5 bg-white border border-[#707070] p-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Name and Title */}
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-3xl font-bold text-black font-sf">
                        {userProfile ? userProfile.name : "Loading..."}
                      </span>
                      <button
                        className="flex items-center bg-[#bbf1fc] rounded-full px-4 py-1 focus:outline-none"
                        onClick={() => setShowBadgesModal(true)}
                        style={{ cursor: "pointer" }}
                      >
                        <Gem className="w-5 h-5 text-[#1797a6] mr-2" />
                        <span className="text-[#1797a6] font-medium text-base">
                          Verified Memberships
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center text-[#636363] mb-2">
                      <Settings className="w-5 h-5 mr-2" />
                      <span className="text-lg">
                        {userProfile && userProfile.profile.headline}
                      </span>

                      <div className="flex items-center text-gray-600 ms-5">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span className="text-lg">
                          {userProfile && userProfile.profile.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex space-x-7 mb-8">
                    <div className="flex items-center space-x-1 font-sf">
                      <span className="text-lg font-semibold text-gray-900">
                        {totalPosts}
                      </span>
                      <span className="text-md text-gray-500 font-sf font-medium">
                        post
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 font-sf">
                      <span className="text-lg font-semibold text-gray-900">
                        250
                      </span>
                      <span className="text-md font-medium text-gray-500 font-sf">
                        followers
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 font-sf">
                      <span className="text-lg font-semibold text-gray-900">
                        160
                      </span>
                      <span className="text-md text-gray-500 font-sf font-medium">
                        following
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowreqmemPopup(true)}
                      className=" bg-[#0017e7] text-white py-2.5 px-6 rounded-md hover:bg-[#0012b7] transition-colors  font-sf"
                    >
                      Request Membership
                    </button>
                    <button className="px-6 py-2.5 border border-black text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-sf font-medium">
                      Add a post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Suggested For You */}
            <div className="hidden md:block md:col-span-4">
              <div className="bg-white rounded-lg border border-[#7c87bc] shadow-lg">
                <div className="p-5 border-b border-[#7c87bc]">
                  <h2 className="text-md font-medium font-sf text-[#707070]">
                    Suggested For You
                  </h2>
                </div>

                <div className="p-5">
                  {suggestedLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading suggestions...</p>
                    </div>
                  ) : suggestedError ? (
                    <div className="text-center py-4">
                      <p className="text-red-500">{suggestedError}</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {suggestedUsers.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={person.image}
                              alt={person.name}
                              className="w-14 h-14 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://randomuser.me/api/portraits/women/44.jpg";
                              }}
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 text-md font-sf">
                                {person.name}
                              </h3>
                              <p className="text-xs text-gray-500 font-sf">
                                {person.role}
                              </p>
                            </div>
                          </div>
                          <button
                            className="bg-[#0017e7] text-white text-sm font-medium px-3 py-1 rounded hover:bg-[#0013c6] transition-colors"
                            onClick={() => handleAddFriend(person.id)}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Full Width Below Grid */}
          <div className="mt-4">
            <div className="col-span-12">
              <div className="bg-white rounded-lg border border-[#7c87bc] shadow-lg overflow-hidden">
                <div className="px-6 py-5 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-10">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`text-lg font-sf font-medium transition-colors relative ${
                            activeTab === tab
                              ? "text-[#0017e7] border-b-2 border-[#0017e7] pb-4"
                              : "text-gray-500 hover:text-gray-700 pb-4"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    <div className="relative mb-3">
                      <button
                        className="profile-dropdown-toggle text-black hover:text-gray-600 transition-colors"
                        onClick={handleDropdownToggle}
                        type="button"
                        ref={iconRef}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showDropdown && (
            <div className="profile-dropdown-menu absolute right-24  -mt-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-2">
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowAccountKeySettings(true);
                  setShowDropdown(false);
                }}
              >
                <Key className="w-5 h-5 mr-3" /> Account Key Settings
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowPrivacySettings(true);
                  setShowDropdown(false);
                }}
              >
                <Lock className="w-5 h-5 mr-3" /> Privacy Setting
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowLanguageSettings(true);
                  setShowDropdown(false);
                }}
              >
                <Globe className="w-5 h-5 mr-3" /> Language
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowManageNotification(true);
                  setShowDropdown(false);
                }}
              >
                <Bell className="w-5 h-5 mr-3" /> Manage Notification
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowBlockedUser(true);
                  setShowDropdown(false);
                }}
              >
                <Ban className="w-5 h-5 mr-3" /> Blocked
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowHelpCenter(true);
                  setShowDropdown(false);
                }}
              >
                <HelpCircle className="w-5 h-5 mr-3" /> Help Center
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={() => {
                  setShowDeactivateAccount(true);
                  setShowDropdown(false);
                }}
              >
                <Power className="w-5 h-5 mr-3" /> Deactivate Account
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <LogOut className="w-5 h-5 mr-3" /> Log Out
              </button>
            </div>
          )}
          {/* Tab Content */}
          {(activeTab === "Posts" || activeTab === "My Work") && (
            <PostTab
              number_of_text_posts={number_of_text_posts}
              number_of_image_posts={number_of_image_posts}
              number_of_video_posts={number_of_video_posts}
              text_posts_data={text_posts_data}
              image_posts_data={image_posts_data}
              video_posts_data={video_posts_data}
              // Pass API integration props
              combinedPosts={combinedPosts}
              fetchPosts={fetchPosts}
              loading={loading}
              hasMore={hasMore}
            />
          )}
          {activeTab === "About" && <AboutTab />}
          {activeTab === "Media" && <MediaTabPhotos />}
          {activeTab === "Friends" && <AboutFriendsTab />}
          {activeTab === "My Agencies" && <AboutAgencyTab />}
          {activeTab === "My Badges" && <BadgesTab />}
          {activeTab === "Verified Memberships" && <VerifiedMembershipsTab />}
        </div>
      </div>
    </>
  );
};

export default Profile;