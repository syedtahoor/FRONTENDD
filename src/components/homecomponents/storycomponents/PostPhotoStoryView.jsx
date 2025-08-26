import React from 'react';

const PostPhotoStoryView = ({ story, onAddToStory, onAddText }) => {
  return (
    <div className="w-full h-full relative bg-gray-900 flex items-center justify-center p-8">
      {/* Background blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-sm opacity-30"
        style={{
          backgroundImage: `url(${story?.url || "https://images.unsplash.com/photo-1698778573682-346d219322b2?w=1080&auto=format"})`
        }}
      />
      
      {/* Main content area */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Post image container */}
        <div className=" overflow-hidden">
          <img
            src={story?.url || "https://images.unsplash.com/photo-1698778573682-346d219322b2?w=1080&auto=format"}
            alt="Post"
            className="w-full h-full object-contain rounded-xl"
          />
          
          {/* Post caption/content area */}
          {story?.pagename && (
            <div className="p-4">
              <p className="text-white text-sm font-medium leading-relaxed">
                {story.pagename}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPhotoStoryView;