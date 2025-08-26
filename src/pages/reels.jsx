import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Volume2,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import SidebarMenu from "../components/sidebarmenu";
import ProfileCard from "../components/profilecard";
import NavbarReplica from "../components/nav";
import testVideo from "../assets/images/testvideo.mp4";
import postimage from "../assets/images/postimage.png";
import ShareIcon from "../assets/images/share.png";
import postprofile from "../assets/images/postprofile.jpg";
import ReelsComments from "../components/ReelsComponents/reels_comments";

const SCROLL_THRESHOLD = 0.75;
const PLAY_PAUSE_DELAY = 800;
const DROPDOWN_WIDTH = 180;

// Static data (moved outside component)
const REELS_DATA = [
  {
    id: 1,
    type: "video",
    src: testVideo,
    user: "The Ransom",
    likes: 145000,
    comments: 2163,
    shares: 916,
    description: "Watch how simple designs turn into smooth, eye-catching animations, Watch how simple designs turn into smooth, eye-catching animations, Watch how simple designs turn into smooth, eye-catching animations, Watch how simple designs turn into smooth, eye-catching animations",
    tags: ["UIDesign", "MotionDesign", "Animation", "Creative", "Design", "Innovation", "Technology", "Art", "Digital", "Modern"]
  },
  {
    id: 2,
    type: "image",
    src: postimage,
    user: "The Ransom",
    likes: 145000,
    comments: 2163,
    shares: 916,
    description: "Creating amazing visual experiences with cutting-edge design",
    tags: ["VisualDesign", "UX", "UI", "Branding", "Marketing", "SocialMedia", "Content", "Creative", "Digital", "Innovation"]
  },
  {
    id: 3,
    type: "video",
    src: testVideo,
    user: "The Ransom",
    likes: 234000,
    comments: 5432,
    shares: 1205,
    description: "Exploring the future of digital storytelling and content creation",
    tags: ["Storytelling", "ContentCreation", "Digital", "Media", "Creative", "Innovation", "Technology", "Future", "Trends", "Design"]
  },
];

// Utility functions
const formatCount = (num) =>
  num >= 1000 ? `${(num / 1000).toFixed(1).replace(".0", "")}k` : num;

// Custom hook for video control
const useVideoControl = (videoRefs, activeIndex) => {
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);
};

const Reels = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const playPauseTimeoutRef = useRef(null);

  // Combined states
  const [activeIndex, setActiveIndex] = useState(0);
  const [playState, setPlayState] = useState({
    showIcon: false,
    isPlaying: true,
  });
  const [dropdown, setDropdown] = useState(null);
  const [expandedTags, setExpandedTags] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Custom hook usage
  useVideoControl(videoRefs, activeIndex);

  // Optimized play/pause overlay
  const showPlayPauseOverlay = useCallback((playing) => {
    setPlayState({ showIcon: true, isPlaying: playing });

    if (playPauseTimeoutRef.current) {
      clearTimeout(playPauseTimeoutRef.current);
    }

    playPauseTimeoutRef.current = setTimeout(() => {
      setPlayState((prev) => ({ ...prev, showIcon: false }));
    }, PLAY_PAUSE_DELAY);
  }, []);

  // Optimized video toggle
  const toggleVideo = useCallback(
    (index) => {
      const video = videoRefs.current[index];
      if (!video || REELS_DATA[index].type !== "video") return;

      const isPlaying = !video.paused;
      if (isPlaying) {
        video.pause();
        showPlayPauseOverlay(false);
      } else {
        video.play();
        showPlayPauseOverlay(true);
      }
    },
    [showPlayPauseOverlay]
  );

  // Toggle tags expansion
  const toggleTagsExpansion = useCallback((index) => {
    setExpandedTags(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // Toggle description expansion
  const toggleDescriptionExpansion = useCallback((index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  // Render tags with limit
  const renderTags = useCallback((tags, index, maxVisible = 3) => {
    if (!tags || tags.length === 0) return null;
    
    const visibleTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;
    
    return (
      <div className="mt-2">
        <div className="text-white text-sm">
          {expandedTags[index] ? (
            // Show all tags when expanded
            <div>
              <span>{tags.map(tag => `#${tag}`).join(' ')}</span>
              <button 
                onClick={() => toggleTagsExpansion(index)}
                className="text-blue-400 hover:text-blue-300 ml-2 font-medium"
              >
                See Less
              </button>
            </div>
          ) : (
            // Show limited tags with See More button
            <div>
              <span>{visibleTags.map(tag => `#${tag}`).join(' ')}....</span>
              {remainingCount > 0 && (
                <button 
                  onClick={() => toggleTagsExpansion(index)}
                  className="text-blue-400 hover:text-blue-300 ml-1 font-medium"
                >
                  See More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [expandedTags, toggleTagsExpansion]);

  // Render description with limit
  const renderDescription = useCallback((description, index, maxLength = 80) => {
    if (!description) return null;
    
    const isExpanded = expandedDescriptions[index];
    const shouldTruncate = description.length > maxLength;
    
    if (!shouldTruncate) {
      return (
        <p className="text-white text-sm leading-relaxed pr-12">
          {description}
        </p>
      );
    }
    
    return (
      <div className="text-white text-sm leading-relaxed pr-12">
        {isExpanded ? (
          // Show full description when expanded
          <div>
            <span>{description}</span>
            <button 
              onClick={() => toggleDescriptionExpansion(index)}
              className="text-blue-400 hover:text-blue-300 ml-2 font-medium"
            >
              See Less
            </button>
          </div>
        ) : (
          // Show truncated description with See More button
          <div>
            <span>{description.substring(0, maxLength)}...</span>
            <button 
              onClick={() => toggleDescriptionExpansion(index)}
              className="text-blue-400 hover:text-blue-300 ml-0 font-medium"
            >
              See More
            </button>
          </div>
        )}
      </div>
    );
  }, [expandedDescriptions, toggleDescriptionExpansion]);

  // Body scroll management (simplified)
  useEffect(() => {
    const scrollTop = window.scrollY;
    const bodyStyle = document.body.style;

    // Save original styles
    const originalStyles = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      width: bodyStyle.width,
    };

    // Apply reels styles
    Object.assign(bodyStyle, {
      overflow: "hidden",
      position: "fixed",
      top: `-${scrollTop}px`,
      width: "100%",
    });

    return () => {
      Object.assign(bodyStyle, originalStyles);
      window.scrollTo(0, scrollTop);

      if (playPauseTimeoutRef.current) {
        clearTimeout(playPauseTimeoutRef.current);
      }
    };
  }, []);

  // Intersection observer for active index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > SCROLL_THRESHOLD) {
            setActiveIndex(Number(entry.target.getAttribute("data-index")));
          }
        });
      },
      { root: container, threshold: [0, 0.25, 0.5, SCROLL_THRESHOLD, 1] }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Scroll handler
  const scrollToIndex = useCallback((index) => {
    const container = containerRef.current;
    if (!container) return;

    const item = container.querySelector(`[data-index="${index}"]`);
    if (item) item.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Wheel event handler
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      const newIndex =
        e.deltaY > 0
          ? Math.min(activeIndex + 1, REELS_DATA.length - 1)
          : Math.max(activeIndex - 1, 0);
      scrollToIndex(newIndex);
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handler, { passive: false });
    return () => container.removeEventListener("wheel", handler);
  }, [activeIndex, scrollToIndex]);

  // Dropdown handlers
  const toggleDropdown = useCallback(
    (e, index) => {
      e.stopPropagation();

      if (dropdown) {
        setDropdown(null);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdown({
          x: rect.right - DROPDOWN_WIDTH,
          y: rect.bottom,
          index,
        });
      }
    },
    [dropdown]
  );

  const handleReportReel = useCallback(() => {
    console.log("Report reel clicked");
    setDropdown(null);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = () => setDropdown(null);

    if (dropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdown]);

  const onBackToHome = () => navigate("/");

  return (
    <>
      <NavbarReplica />
      <div className="min-h-screen bg-gray-100 overflow-hidden">
        <div className="max-w-[86rem] mx-auto px-0 md:px-4 py-0 md:py-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="hidden md:block md:col-span-3 mt-1">
              <ProfileCard />
              <SidebarMenu />
            </div>

            <div className="col-span-1 md:col-span-9">
              <div className="p-4">
                <div className="relative">
                  <div
                    ref={containerRef}
                    className="h-[85vh] w-full max-w-sm mx-auto overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black rounded-2xl"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      overscrollBehavior: "contain",
                    }}
                    tabIndex={0}
                  >
                    {REELS_DATA.map((item, index) => (
                      <div
                        key={item.id}
                        data-index={index}
                        className="snap-start h-full w-full relative"
                      >
                        <div className="relative h-full w-full">
                          {item.type === "video" ? (
                            <video
                              ref={(el) => (videoRefs.current[index] = el)}
                              src={item.src}
                              className="w-full h-full object-cover cursor-pointer"
                              loop
                              playsInline
                              muted
                              onClick={() => toggleVideo(index)}
                            />
                          ) : (
                            <img
                              src={item.src}
                              alt="reel"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Play/Pause Overlay */}
                          {item.type === "video" && index === activeIndex && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                                playState.showIcon ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              <div className="bg-black/35 rounded-full p-4 backdrop-blur-sm">
                                {playState.isPlaying ? (
                                  <Pause className="w-12 h-12 text-white fill-white" />
                                ) : (
                                  <Play className="w-12 h-12 text-white fill-white" />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Top Controls */}
                          <div className="absolute top-2 left-4 right-4 z-20 flex items-center justify-between">
                            <button className="p-2">
                              <Volume2 className="w-7 h-7 text-white fill-white" />
                            </button>
                            <button
                              className="p-2 relative"
                              onClick={(e) => toggleDropdown(e, index)}
                            >
                              <MoreHorizontal className="w-7 h-7 text-white" />
                            </button>
                          </div>

                          {/* Bottom User Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={postprofile}
                                alt={item.user}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium text-sm">
                                    {item.user}
                                  </span>
                                  <button className="bg-transparent border border-white text-white px-7 py-1 rounded-md text-sm ms-2 font-medium hover:bg-white hover:text-black transition-colors">
                                    Follow
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Dynamic Description */}
                            {renderDescription(item.description, index)}
                            
                            {/* Dynamic Hashtags */}
                            {renderTags(item.tags, index)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown Menu */}
                  {dropdown && (
                    <div
                      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px]"
                      style={{ left: dropdown.x, top: dropdown.y }}
                    >
                      <button
                        onClick={handleReportReel}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-red-500 font-medium">
                          Report Reel
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Right Actions Panel */}
                  <div className="absolute right-56 top-3/4 transform -translate-y-1/2 flex flex-col items-center gap-4 z-20">
                    {/* Like */}
                    <div className="flex flex-col items-center">
                      <button className="p-2 hover:bg-black/20 rounded-full transition-colors">
                        <ThumbsUp
                          className="w-7 h-7 text-transparent fill-[#0017e7]"
                          fill="white"
                        />
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        {formatCount(REELS_DATA[activeIndex]?.likes || 0)}
                      </span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center">
                      <button className="p-2 hover:bg-black/20 rounded-full transition-colors">
                        <MessageCircle className="w-7 h-7 text-black" />
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        {formatCount(REELS_DATA[activeIndex]?.comments || 0)}
                      </span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center">
                      <button className="p-2 hover:bg-black/20 rounded-full transition-colors">
                        <img src={ShareIcon} className="w-8 h-7" alt="share" />
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        {formatCount(REELS_DATA[activeIndex]?.shares || 0)}
                      </span>
                    </div>

                    {/* Save */}
                    <div className="flex flex-col items-center">
                      <button className="p-2 hover:bg-black/20 rounded-full transition-colors">
                        <Bookmark className="w-7 h-7 text-black" />
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        8137
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide Scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Reels;