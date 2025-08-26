import Navbar from "../components/nav";
import Preloader from "../components/preloader/Preloader";
import banner from "../assets/images/banner-bg.png";
import DP from "../assets/images/banner-pro.jpg";
import Share from "../assets/images/share.png";
import { useEffect, useRef, useState } from "react";
import EditCover from "../components/pageprofile/edit_cover";
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
  Link2,
  Trash2,
  BellDot,
} from "lucide-react";
import ReqMembers from "../components/pageprofile/reqMembers";
import EditIntro from "../components/pageprofile/edit_intro";
import EditProfile from "../components/pageprofile/edit_profile_photo";
import PostTab from "../components/pageprofile/post_tab";
import MembersTab from "../components/pageprofile/MembersTab";
import MediaTabPhotos from "../components/pageprofile/media_tab_photos";
import AgentsTab from "../components/pageprofile/AgentsTab";
import Mentions from "../components/pageprofile/Mentions";
import SummaryTab from "../components/pageprofile/summaryTab";
import PrivacySettings from "../components/pageprofile/privacy_settings";
import ManageNotification from "../components/pageprofile/manage_notification";
import DeletePage from "../components/pageprofile/DeletePage";
import { useLocation } from "react-router-dom";
import CreatePost from "../components/pageprofile/CreatePost";
import CreatePoll from "../components/pageprofile/CreatePoll";

const PageProfile = () => {
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [showeditcoverPopup, setShoweditcoverPopup] = useState(false);
  const [showeditprofilePopup, setShoweditprofilePopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showeditintroPopup, setShoweditintroPopup] = useState(false);
  const [showreqmemPopup, setShowreqmemPopup] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const iconRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Posts");
  const [loadingPages, setLoadingPages] = useState(false);
  const [pageData, setPageData] = useState([]);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);
  const [currentCoverPhoto, setCurrentCoverPhoto] = useState(null);
  const tabs = [
    "Posts",
    "Memberships",
    "Agent & Agencies",
    "Media",
    "Mentions",
    "Our Work",
    "Summary",
  ];
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showManageNotification, setShowManageNotification] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreatePostModel, setShowCreatePostModel] = useState(false);
  const [showPoll, setShowPoll] = useState(false);

  const location = useLocation();
  const { PagesId } = location.state || {};
  console.log("PagesId---", PagesId);
  const relatedPages = [
    {
      id: 1,
      name: "Arshpixels",
      members: "25k",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
    },
    {
      id: 2,
      name: "Jaiwad singh",
      members: "20k",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop",
    },
    {
      id: 3,
      name: "Code By Rixa",
      members: "90k",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
    },
    {
      id: 4,
      name: "Arjit Designs",
      members: "1k",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
    },
    {
      id: 5,
      name: "NexusDesigns",
      members: "2k",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop",
    },
  ];

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

  const number_of_text_posts = textPosts.length;
  const number_of_image_posts = imagePosts.length;
  const number_of_video_posts = videoPosts.length;

  const text_posts_data = textPosts;
  const image_posts_data = imagePosts;
  const video_posts_data = videoPosts;

  const totalPosts =
    number_of_text_posts + number_of_image_posts + number_of_video_posts;

  const handleEditIntroClose = () => {
    setShoweditintroPopup({ show: false });
    setRefreshTrigger((prev) => prev + 1);
  };

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

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("token");

    if (!userId || !token) return;

    setLoadingPages(true);
    if (PagesId) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/pages/${PagesId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const page = data.data;
            setPageData(page);

            // Handle profile photo
            if (page.page_profile_photo) {
              const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(
                "/api",
                ""
              );
              const profilePhotoUrl = page.page_profile_photo.startsWith("http")
                ? page.page_profile_photo
                : `${baseUrl}/storage/${page.page_profile_photo}`;

              setCurrentProfilePhoto(profilePhotoUrl);
            }

            // Handle banner image
            if (page.page_cover_photo) {
              const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(
                "/api",
                ""
              );
              const coverPhotoUrl = page.page_cover_photo.startsWith("http")
                ? page.page_cover_photo
                : `${baseUrl}/storage/${page.page_cover_photo}`;

              setCurrentCoverPhoto(coverPhotoUrl);
            }
          } else {
            console.log("Error fetching page:", data.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching page:", error);
        })
        .finally(() => {
          setLoadingPages(false);
        });
    }
  }, [PagesId]);

  if (loadingPages) {
    return <Preloader />;
  }

  if (!pageData) {
    return <Preloader />;
  }

  return (
    <>
      {showeditcoverPopup && (
        <EditCover
          onClose={() => setShoweditcoverPopup(false)}
          currentCoverPhoto={currentCoverPhoto}
          pageId={PagesId}
          onCoverUpdate={(newCover) => {
            setCurrentCoverPhoto(newCover);
            setPageData((prev) => ({
              ...prev,
              page_cover_photo: newCover,
            }));
          }}
        />
      )}
      {showeditprofilePopup && (
        <EditProfile
          onClose={() => setShoweditprofilePopup(false)}
          currentProfilePhoto={currentProfilePhoto}
          pageId={PagesId}
          onProfileUpdate={(newPhoto) => {
            setCurrentProfilePhoto(newPhoto);
            setPageData((prev) => ({
              ...prev,
              page_profile_photo: newPhoto,
            }));
          }}
        />
      )}

      {showreqmemPopup && (
        <ReqMembers onClose={() => setShowreqmemPopup(false)} />
      )}

      {showeditintroPopup.show && (
        <EditIntro
          onClose={handleEditIntroClose}
          initialData={{
            name: pageData.page_name,
            location: pageData.page_location,
          }}
          pagesId={PagesId}
          onIntroUpdate={(updatedData) => {
            setPageData((prev) => ({
              ...prev,
              page_name: updatedData.name,
              page_location: updatedData.location,
            }));
          }}
        />
      )}

      {showCreatePostModel && (
        <CreatePost
          onClose={() => setShowCreatePostModel(false)}
          onOpenPoll={() => {
            setShowPoll(true);
            setShowCreatePostModel(false);
          }}
          pageId={parseInt(PagesId)}
        />
      )}

      {showPoll && <CreatePoll onClose={() => setShowPoll(false)} />}

      <Navbar />
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
                      currentCoverPhoto ||
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
                          name: "HASNAIN",
                          headline: "Developer",
                          location: "Johar",
                        })
                      }
                      className="absolute top-10 -right-5 bg-white border border-[#707070] p-2 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Name and Title */}
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-black font-sf">
                        {/* {userProfile ? userProfile.name : "Loading..."} */}
                        {pageData.page_name}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <Settings className="w-5 h-5 mr-2 text-gray-900" />
                      {/* <span className="text-lg">{userProfile && userProfile.profile.headline}</span> */}
                      <span className="text-lg text-gray-600">
                        {pageData.page_category},
                      </span>

                      <div className="flex items-center  ml-2">
                        <MapPin className="w-5 h-5 mr-2 text-gray-900" />
                        <span className="text-lg text-gray-600">
                          {/* {userProfile && userProfile.profile.location} */}
                          {pageData.page_location || "--"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex space-x-7 mb-8">
                    <div className="flex items-center space-x-1 font-sf">
                      <span className="text-lg font-semibold text-gray-900">
                        {/* {totalPosts} */}200
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
                      Invite Friends
                    </button>
                    <button
                      onClick={() => setShowCreatePostModel(true)}
                      className="px-6 py-2.5 border border-black text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-sf font-medium"
                    >
                      Add a post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Related Pages */}
            <div className="hidden md:block md:col-span-4">
              <div className="bg-white rounded-lg border border-[#7c87bc] shadow-lg">
                <div className="p-5 border-b border-[#7c87bc]">
                  <h2 className="text-md font-medium font-sf text-[#707070]">
                    Related Pages
                  </h2>
                </div>

                <div className="p-5">
                  <div className="space-y-5">
                    {relatedPages.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={person.image}
                            alt={person.name}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900 text-md font-sf">
                              {person.name}
                            </h3>
                            <p className="text-xs text-gray-500 font-sf">
                              {person.members} members
                            </p>
                          </div>
                        </div>
                        <button className="text-[#0017e7] text-sm font-medium hover:text-[#0012b7] transition-colors">
                          • Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  setShowPrivacySettings(true);
                  setShowDropdown(false);
                }}
              >
                <Lock className="w-5 h-5 mr-3" /> Privacy Setting
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowManageNotification(true);
                  setShowDropdown(false);
                }}
              >
                <BellDot className="w-5 h-5 mr-3" /> Manage Notifications
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowAccountKeySettings(true);
                  setShowDropdown(false);
                }}
              >
                <img src={Share} className="w-5 h-5 mr-3" /> Share Page
              </button>

              <button
                className="flex items-center w-full px-4 py-2 text-black hover:bg-gray-100"
                onClick={() => {
                  setShowLanguageSettings(true);
                  setShowDropdown(false);
                }}
              >
                <Link2 className="w-5 h-5 mr-3 -rotate-45" /> Copy Page Link
              </button>

              <button
                className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={() => {
                  setShowDeleteModal(true);
                  setShowDropdown(false);
                }}
              >
                <Trash2 className="w-5 h-5 mr-3" /> Delete Page
              </button>
            </div>
          )}

          {showPrivacySettings && (
            <PrivacySettings onClose={() => setShowPrivacySettings(false)} />
          )}

          {showManageNotification && (
            <ManageNotification
              onClose={() => setShowManageNotification(false)}
            />
          )}

          {showDeleteModal && (
            <DeletePage
              onCancel={() => setShowDeleteModal(false)}
              onBlock={() => setShowDeleteModal(false)}
            />
          )}

          {(activeTab === "Posts" || activeTab === "Our Work") && (
            <PostTab
              number_of_text_posts={number_of_text_posts}
              number_of_image_posts={number_of_image_posts}
              number_of_video_posts={number_of_video_posts}
              text_posts_data={text_posts_data}
              image_posts_data={image_posts_data}
              video_posts_data={video_posts_data}
            />
          )}
          {activeTab === "Memberships" && <MembersTab />}
          {activeTab === "Agent & Agencies" && <AgentsTab />}
          {activeTab === "Summary" && <SummaryTab />}
          {activeTab === "Media" && <MediaTabPhotos />}
          {activeTab === "Mentions" && (
            <Mentions
              number_of_text_posts={number_of_text_posts}
              number_of_image_posts={number_of_image_posts}
              number_of_video_posts={number_of_video_posts}
              text_posts_data={text_posts_data}
              image_posts_data={image_posts_data}
              video_posts_data={video_posts_data}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PageProfile;
