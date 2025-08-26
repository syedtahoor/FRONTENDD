import React, { useState } from "react";
import { X, BarChart3 } from "lucide-react";
import axios from "axios";

export default function CreatePostModal({ onClose, onOpenPoll }) {
  const [isOpen, setIsOpen] = useState(true);
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!postText.trim()) return;

    setIsPosting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/textposts`,
        {
          content: postText.trim(),
          type: "text",
          visibility: "public",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.status === 201) {
        console.log("Post created successfully:", response.data);
        if (window.refreshPosts) {
          window.refreshPosts();
        }
        setPostText("");
        setIsOpen(false);
        onClose();
      }
    } catch (error) {
      if (error.response) {
        console.error("Error creating post:", error.response.data);
      } else if (error.request) {
        console.error("Network error:", error.request);
      } else {
        console.error("Error:", error.message);
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handlePollClick = () => {
    if (onOpenPoll) {
      onOpenPoll();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg text-gray-900 font-sf ms-2">Create Post</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isPosting}
          >
            <X size={25} className="text-black hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* User Profile */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img
                src="./src/assets/images/person-1.png"
                className="w-full h-full"
                alt=""
              />
            </div>
            <span className="ml-3 font-medium text-gray-900 font-sf">
              {localStorage.getItem("user_name") || "The Ransom"}
            </span>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share Your Thoughts..."
              className="w-full h-32 p-3 border border-gray-200 rounded-sm resize-none focus:outline-none focus:ring-2  focus:border-transparent text-sm"
              disabled={isPosting}
            />
          </div>

          {/* Media Options */}
          <div className="flex items-center justify-around mb-6 py-3 border border-gray-200 rounded-lg">
            <button
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              disabled={isPosting}
            >
              <img
                src="./src/assets/images/camera.png"
                className="w-7 h-5"
                alt=""
              />
              <span className="text-sm font-medium text-black">Photo</span>
            </button>

            <button
              onClick={handlePollClick}
              className="flex items-center gap-2 px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              disabled={isPosting}
            >
              <BarChart3 size={25} />
              <span className="text-sm font-medium text-black">Polls</span>
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              disabled={isPosting}
            >
              <img
                src="./src/assets/images/video.png"
                className="w-8 h-5"
                alt=""
              />
              <span className="text-sm font-medium text-black">Video</span>
            </button>
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={!postText.trim() || isPosting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              postText.trim() && !isPosting
                ? "bg-[#0017e7] text-white hover:bg-[#0015d6]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
