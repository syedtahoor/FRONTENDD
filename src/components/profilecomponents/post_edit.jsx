import React, { useState } from "react";
import { X } from "lucide-react";
import Person from "../../assets/images/person-1.png";

export default function EditPostModal({ onClose, editData }) {
  const [isOpen, setIsOpen] = useState(true);
  const [postText, setPostText] = useState(editData?.content || "");

  const handlePost = () => {
    console.log("Post submitted:", postText);
    setIsOpen(false);
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-sf font-medium text-gray-900">
            Edit Post
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={25} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* User Profile */}
          <div className="flex items-center mb-5 mt-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
              <img
                src={Person}
                className="w-full h-full object-cover"
                alt="User avatar"
              />
            </div>
            <span className="ml-3 font-medium font-sf text-gray-900">
              The Ransom
            </span>
          </div>

          {/* Text Input - sirf text posts ke liye */}
          {(!editData?.type || editData?.type === "text") && (
            <div className="mb-6">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind ?"
                className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none text-md placeholder-[#9b9b9b]"
              />
            </div>
          )}

          {/* Image Display - image posts ke liye */}
          {editData?.type === "image" && (
            <div className="mb-6">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind ?"
                className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none text-md placeholder-[#9b9b9b] mb-4"
              />
              <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={editData.image}
                  alt="Post image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Video Display - video posts ke liye */}
          {editData?.type === "video" && (
            <div className="mb-6">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind ?"
                className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none text-md placeholder-[#9b9b9b] mb-4"
              />
              <div className="w-full h-64 bg-black rounded-md overflow-hidden">
                <video
                  src={editData.video}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Post Button */}
          <button
            onClick={handlePost}
            className="w-full py-2.5 bg-[#0017e7] text-white rounded-md font-medium text-sm hover:bg-[#0013c6] transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
