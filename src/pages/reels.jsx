import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
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
import ShareIcon from "../assets/images/share.png";

const SCROLL_THRESHOLD = 0.75;
const PLAY_PAUSE_DELAY = 800;
const DROPDOWN_WIDTH = 180;
const MAX_REELS_LIMIT = 50;

// Helper to resolve URLs
const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (typeof path === "string" && path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");
  return `${base}/storage/${path}`;
};

// Utility functions
const formatCount = (num) =>
  num >= 1000 ? `${(num / 1000).toFixed(1).replace(".0", "")}k` : num;

// Optimized ReelItem component with React.memo and video preloading
const ReelItem = React.memo(({ 
  item, 
  index, 
  isActive, 
  onVideoToggle, 
  onLikeToggle, 
  onDropdownToggle, 
  playState,
  expandedTags,
  expandedDescriptions,
  onToggleTagsExpansion,
  onToggleDescriptionExpansion,
  isNearActive // New prop for preloading
}) => {
  const videoRef = useRef(null);
  
  // Preload videos that are near active (better UX)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || item.type !== "video") return;
    
    // Preload if near active or active
    if (isNearActive || isActive) {
      video.preload = "auto";
      // Start loading immediately
      video.load();
    }
  }, [isNearActive, isActive, item.type]);
  
  // Video control effect
  useEffect(() => {
    const video = videoRef.current;
    if (!video || item.type !== "video") return;
    
    if (isActive) {
      // Play current video with better ready state handling
      const tryPlay = () => {
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA instead of HAVE_ENOUGH_DATA
          video.play().catch(() => {});
        } else {
          // Multiple event listeners for faster response
          const events = ['canplay', 'canplaythrough', 'loadeddata'];
          const playHandler = () => {
            video.play().catch(() => {});
            events.forEach(event => video.removeEventListener(event, playHandler));
          };
          
          events.forEach(event => {
            video.addEventListener(event, playHandler, { once: true });
          });
          
          // Fallback timeout
          setTimeout(tryPlay, 100);
        }
      };
      
      tryPlay();
    } else {
      // Pause non-active videos but don't reset time for smoother experience
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isActive, item.type]);

  // Render tags with limit
  const renderTags = useCallback((tags, maxVisible = 3) => {
    if (!tags || tags.length === 0) return null;
    
    const visibleTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;
    
    return (
      <div className="mt-2">
        <div className="text-white text-sm">
          {expandedTags[index] ? (
            <div>
              <span>{tags.map(tag => `#${tag}`).join(' ')}</span>
              <button 
                onClick={() => onToggleTagsExpansion(index)}
                className="text-[#4151e6] hover:text-[#2839d3] ml-2 font-medium"
              >
                See Less
              </button>
            </div>
          ) : (
            <div>
              <span>{visibleTags.map(tag => `#${tag}`).join(' ')}....</span>
              {remainingCount > 0 && (
                <button 
                  onClick={() => onToggleTagsExpansion(index)}
                  className="text-[#4151e6] hover:text-[#2839d3] ml-1 font-medium"
                >
                  See More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [expandedTags, index, onToggleTagsExpansion]);

  // Render description with limit
  const renderDescription = useCallback((description, maxLength = 80) => {
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
          <div>
            <span>{description}</span>
            <button 
              onClick={() => onToggleDescriptionExpansion(index)}
              className="text-[#4151e6] hover:text-[#2839d3] ml-2 font-medium"
            >
              See Less
            </button>
          </div>
        ) : (
          <div>
            <span>{description.substring(0, maxLength)}...</span>
            <button 
              onClick={() => onToggleDescriptionExpansion(index)}
              className="text-[#4151e6] hover:text-[#2839d3] ml-0 font-medium"
            >
              See More
            </button>
          </div>
        )}
      </div>
    );
  }, [expandedDescriptions, index, onToggleDescriptionExpansion]);

  return (
    <div
      data-index={index}
      className="snap-start h-full w-full relative"
      style={{ 
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        willChange: 'transform',
        height: '85vh'
      }}
    >
      <div className="relative h-full w-full">
        {item.type === "video" ? (
          <video
            ref={videoRef}
            src={item.src}
            className="w-full h-full object-cover cursor-pointer"
            loop
            playsInline
            muted
            poster={item.thumbnail || undefined}
            onClick={() => onVideoToggle(index)}
            preload={isActive || isNearActive ? "auto" : "none"} // Smart preloading
            style={{
              willChange: 'transform',
            }}
          />
        ) : (
          <img
            src={item.src}
            alt="reel"
            className="w-full h-full object-cover"
          />
        )}

        {/* Play/Pause Overlay */}
        {item.type === "video" && isActive && (
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
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
            onClick={(e) => onDropdownToggle(e, index)}
          >
            <MoreHorizontal className="w-7 h-7 text-white" />
          </button>
        </div>

        {/* Bottom User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={item.userProfilePhoto || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
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
          {renderDescription(item.description)}
          
          {/* Dynamic Hashtags */}
          {renderTags(item.tags)}
        </div>
      </div>
    </div>
  );
});

const Reels = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const playPauseTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasInitialScrollSetRef = useRef(false);
  
  // Use refs for non-UI state to minimize re-renders
  const expandedTagsRef = useRef({});
  const expandedDescriptionsRef = useRef({});

  // Combined states - only UI-affecting state
  const [activeIndex, setActiveIndex] = useState(0);
  const [playState, setPlayState] = useState({
    showIcon: false,
    isPlaying: true,
  });
  const [dropdown, setDropdown] = useState(null);
  const [reels, setReels] = useState([]);
  const [fetchedIds, setFetchedIds] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0); // For forcing re-renders when needed

  // React Virtual virtualizer with better preloading
  const rowVirtualizer = useVirtualizer({
    count: reels.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => window.innerHeight * 0.85, // 85vh height
    overscan: 5, // 5 upar aur 5 neeche pre-render (video preloading ke liye)
  });

  // Enhanced play/pause with immediate response
  const showPlayPauseOverlay = useCallback((playing) => {
    setPlayState({ showIcon: true, isPlaying: playing });

    if (playPauseTimeoutRef.current) {
      clearTimeout(playPauseTimeoutRef.current);
    }

    playPauseTimeoutRef.current = setTimeout(() => {
      setPlayState((prev) => ({ ...prev, showIcon: false }));
    }, PLAY_PAUSE_DELAY);
  }, []);

  // Optimized video toggle with instant response
  const toggleVideo = useCallback(
    (index) => {
      const container = containerRef.current;
      if (!container) return;
      
      const videoElement = container.querySelector(`[data-index="${index}"] video`);
      const item = reels[index];
      
      if (!videoElement || !item || item.type !== "video") return;

      const isPlaying = !videoElement.paused;
      if (isPlaying) {
        videoElement.pause();
        showPlayPauseOverlay(false);
      } else {
        if (videoElement.readyState >= 3) {
          videoElement.play().catch(() => {});
        } else {
          videoElement.addEventListener('canplaythrough', () => {
            videoElement.play().catch(() => {});
          }, { once: true });
        }
        showPlayPauseOverlay(true);
      }
    },
    [showPlayPauseOverlay, reels]
  );

  // Toggle tags expansion using refs
  const toggleTagsExpansion = useCallback((index) => {
    expandedTagsRef.current = {
      ...expandedTagsRef.current,
      [index]: !expandedTagsRef.current[index]
    };
    // Force re-render for this specific change
    setForceUpdate(prev => prev + 1);
  }, []);

  // Toggle description expansion using refs
  const toggleDescriptionExpansion = useCallback((index) => {
    expandedDescriptionsRef.current = {
      ...expandedDescriptionsRef.current,
      [index]: !expandedDescriptionsRef.current[index]
    };
    // Force re-render for this specific change  
    setForceUpdate(prev => prev + 1);
  }, []);

  // Handle like/unlike functionality
  const handleLikeToggle = useCallback(async (reelId, index) => {
    const isCurrentlyLiked = reels[index]?.is_liked;
    const newLikeCount = isCurrentlyLiked 
      ? Math.max(0, (reels[index]?.likes || 0) - 1)
      : (reels[index]?.likes || 0) + 1;

    setReels(prev => prev.map((reel, idx) => 
      idx === index 
        ? { ...reel, is_liked: !isCurrentlyLiked, likes: newLikeCount }
        : reel
    ));

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/storereellike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ reel_id: reelId }),
      });

      const json = await resp.json();
      
      if (json && json.status) {
        setReels(prev => prev.map((reel, idx) => 
          idx === index 
            ? { ...reel, is_liked: json.liked, likes: json.liked ? newLikeCount : Math.max(0, newLikeCount - 1) }
            : reel
        ));
      }
    } catch (error) {
      setReels(prev => prev.map((reel, idx) => 
        idx === index 
          ? { ...reel, is_liked: isCurrentlyLiked, likes: reels[index]?.likes || 0 }
          : reel
      ));
    }
  }, [reels]);

  // Body scroll management
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const scrollTop = window.scrollY;
    const bodyStyle = document.body.style;

    const originalStyles = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      width: bodyStyle.width,
    };

    Object.assign(bodyStyle, {
      overflow: "hidden",
      position: "fixed",
      top: `-${scrollTop}px`,
      width: "100%",
    });

    return () => {
      Object.assign(bodyStyle, originalStyles);
      if (playPauseTimeoutRef.current) {
        clearTimeout(playPauseTimeoutRef.current);
      }
    };
  }, []);

  // Reset container scroll to top only once
  useEffect(() => {
    if (
      containerRef.current &&
      reels.length > 0 &&
      !hasInitialScrollSetRef.current
    ) {
      containerRef.current.scrollTop = 0;
      setActiveIndex(0);
      hasInitialScrollSetRef.current = true;
    }
  }, [reels.length]);

  // Enhanced intersection observer for smooth snap scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > SCROLL_THRESHOLD) {
            const newIndex = Number(entry.target.getAttribute("data-index"));
            if (newIndex !== activeIndex && !isNaN(newIndex)) {
              setActiveIndex(newIndex);
            }
          }
        });
      },
      { 
        root: container, 
        threshold: [SCROLL_THRESHOLD],
        rootMargin: '0px 0px -10% 0px'
      }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, [rowVirtualizer.getVirtualItems().length, activeIndex]);

  // Enhanced API fetcher
  const fetchMoreReels = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreReels) return;
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL}/getreels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
          user_id: userId || "",
        },
        body: JSON.stringify({ already_fetched_ids: fetchedIds }),
      });
      const json = await resp.json();
      
      if (json && json.status && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          setHasMoreReels(false);
          return;
        }
        
        const mapped = json.data.map((r) => {
          let parsedTags = [];
          try {
            parsedTags = r.tags ? JSON.parse(r.tags) : [];
          } catch (e) {
            parsedTags = [];
          }
          
          return {
            id: r.id,
            type: "video",
            src: resolveMediaUrl(r.video_file),
            thumbnail: resolveMediaUrl(r.thumbnail),
            user: r?.user?.name || "",
            userProfilePhoto: resolveMediaUrl(r?.user?.profile?.profile_photo),
            likes: r.likes || 0,
            comments: r.comments_count || 0,
            shares: r.shares || 0,
            description: r.description || "",
            tags: parsedTags,
            is_liked: !!r.is_liked,
          };
        });
        
        setReels((prev) => [...prev, ...mapped]);
        setFetchedIds((prev) => [...prev, ...(json.fetched_ids || [])]);
      }
    } catch (e) {
      // Silent error handling
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchedIds, hasMoreReels]);

  // Initial fetch
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchMoreReels();
    }
  }, [initialized, fetchMoreReels]);

  // Earlier prefetch trigger
  useEffect(() => {
    if (reels.length === 0 || !hasMoreReels) return;
    const nearEnd = activeIndex >= reels.length - 3;
    if (nearEnd && !loading && !isFetchingRef.current && reels.length < MAX_REELS_LIMIT && hasMoreReels) {
      fetchMoreReels();
    }
  }, [activeIndex, reels.length, loading, hasMoreReels, fetchMoreReels]);

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
                      scrollBehavior: "smooth",
                      transform: 'translateZ(0)',
                      willChange: 'scroll-position'
                    }}
                    tabIndex={0}
                  >
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = reels[virtualRow.index];
                        const isNearActive = Math.abs(virtualRow.index - activeIndex) <= 2; // 2 items ke andar hai
                        
                        return (
                          <div
                            key={item.id}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              transform: `translateY(${virtualRow.start}px)`,
                              height: virtualRow.size,
                            }}
                          >
                            <ReelItem
                              item={item}
                              index={virtualRow.index}
                              isActive={virtualRow.index === activeIndex}
                              isNearActive={isNearActive}
                              onVideoToggle={toggleVideo}
                              onLikeToggle={handleLikeToggle}
                              onDropdownToggle={toggleDropdown}
                              playState={playState}
                              expandedTags={expandedTagsRef.current}
                              expandedDescriptions={expandedDescriptionsRef.current}
                              onToggleTagsExpansion={toggleTagsExpansion}
                              onToggleDescriptionExpansion={toggleDescriptionExpansion}
                            />
                          </div>
                        );
                      })}
                    </div>
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
                      <button
                        className={`p-2 rounded-full transition-colors ${
                          reels[activeIndex]?.is_liked ? "bg-black/20" : ""
                        } hover:bg-black/20`}
                        onClick={() => handleLikeToggle(reels[activeIndex]?.id, activeIndex)}
                      >
                        {reels[activeIndex]?.is_liked ? (
                          <ThumbsUp className="w-7 h-7 text-[#0017e7]" fill="#0017e7" />
                        ) : (
                          <ThumbsUp className="w-7 h-7 text-black" />
                        )}
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        {formatCount(reels[activeIndex]?.likes || 0)}
                      </span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center">
                      <button className="p-2 hover:bg-black/20 rounded-full transition-colors">
                        <MessageCircle className="w-7 h-7 text-black" />
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        {formatCount(reels[activeIndex]?.comments || 0)}
                      </span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center">
                      <button className="p-2 hover:bg-black/20 rounded-full transition-colors">
                        <img src={ShareIcon} className="w-8 h-7" alt="share" />
                      </button>
                      <span className="text-black text-xs mt-1 font-medium">
                        {formatCount(reels[activeIndex]?.shares || 0)}
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