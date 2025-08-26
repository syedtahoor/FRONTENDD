import React from 'react';

const PostTextStoryView = ({ story, onAddToStory, onAddText }) => {
  return (
    <div
    className="w-full h-full relative flex items-center justify-center p-4 bg-[#9B9B9B]"
  >
    <div className="w-full max-w-xs bg-white rounded-2xl overflow-hidden shadow-2xl">
      {/* Top section: Page Info */}
      <div className="flex items-center p-4 space-x-3">
        <img
          src={story?.avatar || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-black">
            {story?.pagename || "Page Name"}
          </p>
          <p className="text-xs text-gray-500">2 Days Ago</p>
        </div>
      </div>

      {/* Middle section: Main Text */}
      <div className="bg-black w-full h-[250px] flex items-center justify-center">
        <p className="text-white text-xl font-bold text-center px-6">
          {story?.text || "Post headline text goes here"}
        </p>
      </div>

      {/* Bottom section: Description */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-sm text-black leading-snug">
          {story?.postdesc ||
            "Discover new releases, curated playlists, and exclusive content — all in one..."}
        </p>
      </div>
    </div>
  </div>
  );
};

export default PostTextStoryView;