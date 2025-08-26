import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import vidoo from "../../../assets/images/testvideo.mp4";

const PostVideoStoryView = ({ storyData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(storyData?.duration || 0);
  const videoRef = useRef(null);

  // Time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {  
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [storyData?.url]);

  // Format time helper
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };


  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#9b9b9b]">
      <div className="relative" style={{ width: "260px", height: "450px" }}>
        {/* If video is available */}
        {storyData !== 0 ? (
          <div className="w-full h-full relative rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={vidoo}
              className="w-full h-full object-cover"
              loop
              autoPlay
              muted // 👈 Add this line
            />
            {/* Pagename & Timer */}
            <div className="absolute top-3 left-3 text-white text-sm font-light">
              {storyData?.pagename || "Story"}
            </div>
            <div className="absolute top-3 right-3 text-white text-sm font-light">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        ) : (
          // If no video URL
          <div className="w-full h-full bg-gray-800 rounded-lg flex flex-col items-center justify-center text-center px-4 text-white">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
              <Play size={32} className="text-gray-400 ml-1" />
            </div>
            <p className="text-gray-400 text-sm">
              {storyData?.pagename || "No video available"}
            </p>
            {storyData?.duration && (
              <p className="text-gray-500 text-xs mt-2">
                Duration: {storyData.duration}s
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostVideoStoryView;
