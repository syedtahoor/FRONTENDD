import { useState, useEffect, useRef } from "react";
import PostImage from "../assets/images/postimage.png";
import PostStory from "./homecomponents/poststory";
import HomePostTab from "./homecomponents/homeposts";

const Post = () => {
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [storyType, setStoryType] = useState("photo");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [textBoxes, setTextBoxes] = useState([]);
  const [showFullText, setShowFullText] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [fetchedPostIds, setFetchedPostIds] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // API posts state - Changed to array to maintain order
  const [apiPosts, setApiPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts from API
  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/allposts`,
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

        // Extract all newly received post IDs - INCLUDING POLL POST IDs
        const newIds = [
          ...data.text_posts.map((p) => p.id),
          ...data.image_posts.map((p) => p.id),
          ...data.video_posts.map((p) => p.id),
          ...data.poll_posts.map((p) => p.id), // ADD THIS LINE
        ];

        // Append new posts to existing posts array (maintaining order)
        // Check if there are new "Just Now" posts from current user
        const currentUserJustNowPosts = newConvertedPosts.filter((post) => {
          const timeDiff = new Date() - new Date(post.timestamp);
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));
          return post.is_current_user && minutesDiff < 5; // Posts within 5 minutes
        });

        // If there are "Just Now" posts from current user, prepend them
        if (currentUserJustNowPosts.length > 0) {
          // Remove any existing current user posts from the list to avoid duplicates
          const filteredExistingPosts = apiPosts.filter(
            (existingPost) =>
              !currentUserJustNowPosts.some(
                (newPost) => newPost.uniqueId === existingPost.uniqueId
              )
          );

          // Prepend new "Just Now" posts, then add existing posts, then other new posts
          const otherNewPosts = newConvertedPosts.filter(
            (post) => !currentUserJustNowPosts.includes(post)
          );
          setApiPosts([
            ...currentUserJustNowPosts,
            ...filteredExistingPosts,
            ...otherNewPosts,
          ]);
        } else {
          // Normal append behavior for other posts
          setApiPosts((prevPosts) => [...prevPosts, ...newConvertedPosts]);
        }

        // Update the list of fetched post IDs
        setFetchedPostIds((prevIds) =>
          Array.from(new Set([...prevIds, ...newIds]))
        );

        // Set initial reaction states based on API data
        newConvertedPosts.forEach((post) => {
          if (post.current_user_reaction) {
            setSelectedReaction((prev) => ({
              ...prev,
              [post.uniqueId]: post.current_user_reaction,
            }));
            setIsLiked((prev) => ({ ...prev, [post.uniqueId]: true }));
          }
        });

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

  const refreshPosts = () => {
    // Ye tumhare existing posts fetch logic hai
    setFetchedPostIds([]);
    setApiPosts([]);
    setHasMore(true);
    fetchPosts();
  };

  useEffect(() => {
    // Global function set karo
    window.refreshPosts = refreshPosts;

    // Add posts update function
    window.updatePostsData = (updatedPosts) => {
      setApiPosts(updatedPosts);
    };

    // Initial posts load karo
    fetchPosts();

    // Cleanup
    return () => {
      delete window.refreshPosts;
      delete window.updatePostsData;
    };
  }, []);

  // Convert API posts to match your existing structure
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
        is_current_user: post.is_current_user,
        reactions_count: post.reactions_count || {},
        total_reactions: post.total_reactions || 0,
        current_user_reaction: post.current_user_reaction || null,
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
        is_current_user: post.is_current_user,
        reactions_count: post.reactions_count || {},
        total_reactions: post.total_reactions || 0,
        current_user_reaction: post.current_user_reaction || null,
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
        is_current_user: post.is_current_user,
        reactions_count: post.reactions_count || {},
        total_reactions: post.total_reactions || 0,
        current_user_reaction: post.current_user_reaction || null,
      });
    });

    // Convert poll posts - FIXED VERSION
    apiData.poll_posts.forEach((post) => {
      // Parse poll options from the API response
      const pollOptions = post.poll?.options || [];

      // Since options is just an array of strings, convert to proper format
      const formattedOptions = pollOptions.map((option, index) => ({
        id: index + 1,
        text: option, // Direct string value
        votes: 0, // Initialize with 0 votes
        percentage: 0, // Initialize with 0 percentage
      }));

      convertedPosts.push({
        id: post.id,
        type: "poll",
        content: post.content,
        poll: {
          options: formattedOptions,
          totalVotes: 0, // Initialize with 0 total votes
          userVoted: null,
          question: post.poll?.question || post.content,
        },
        timestamp: post.created_at,
        likes: 0,
        comments: 0,
        user: post.user,
        uniqueId: `poll_${post.id}`,
        is_current_user: post.is_current_user, // 🆕 ADD THIS LINE
      });
    });

    // Sort this batch by timestamp (newest first within this batch)
    return convertedPosts.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  // Get combined posts (API + static as fallback)
  const getCombinedPosts = () => {
    // Simply return API posts only
    return apiPosts;
  };

  const combinedPosts = getCombinedPosts();

  const [reactions, setReactions] = useState({
    like: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  });

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  // Story related handlers
  const handleAddToStory = () => {
    setShowStoryCreator(false);
    setSelectedImage(null);
    setSelectedVideo(null);
    setPostContent("");
    setTextBoxes([]);
    alert("Post added to your story successfully!");
  };

  const closeStoryCreator = () => {
    setShowStoryCreator(false);
    setSelectedImage(null);
    setSelectedVideo(null);
    setPostContent("");
    setTextBoxes([]);
  };

  const handleAddText = () => {
    const newTextBox = {
      id: Date.now(),
      text: "Add text here",
      x: 50,
      y: 50,
      editing: true,
      fontSize: "16px",
      color: "white",
    };
    setTextBoxes([...textBoxes, newTextBox]);
  };

  const handleTextClick = (id) => {
    setTextBoxes(
      textBoxes.map((box) =>
        box.id === id ? { ...box, editing: true } : { ...box, editing: false }
      )
    );
  };

  const handleTextChange = (id, newText) => {
    setTextBoxes(
      textBoxes.map((box) => (box.id === id ? { ...box, text: newText } : box))
    );
  };

  const handleRemoveText = (id) => {
    setTextBoxes(textBoxes.filter((box) => box.id !== id));
  };

  const handleMouseDown = (e, textBox) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedText(textBox.id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const [draggedText, setDraggedText] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (draggedText) {
      const container = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - container.left - dragOffset.x;
      const newY = e.clientY - container.top - dragOffset.y;

      setTextBoxes(
        textBoxes.map((box) =>
          box.id === draggedText
            ? {
                ...box,
                x: Math.max(0, Math.min(newX, container.width - 100)),
                y: Math.max(0, Math.min(newY, container.height - 30)),
              }
            : box
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggedText(null);
  };

  const handleAddToStoryFromMenu = (post) => {
    // console.log(post);

    setShowMenu(false);
    setSelectedImage(null);
    setSelectedVideo(null);
    setPostContent("");
    setSelectedPost(post);

    if (post.type === "image") {
      setStoryType("postphotostory");
      setSelectedImage(post.image || PostImage);
    } else if (post.type === "video") {
      setStoryType("postvideostory");
      setSelectedVideo(post.video);
    } else if (post.type === "text") {
      setStoryType("posttextstory");
      setPostContent(post.content);
    }

    setShowStoryCreator(true);
  };

  useEffect(() => {
    if (showCommentPopup || showSharePopup || showStoryCreator) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showCommentPopup, showSharePopup, showStoryCreator]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="mx-auto space-y-4">
        <HomePostTab
          posts_data={combinedPosts}
          poll_posts_data={[]}
          onAddToStory={handleAddToStoryFromMenu}
          fetchPosts={fetchPosts}
          loading={loading}
          hasMore={hasMore}
          refreshPosts={refreshPosts}
        />
      </div>

      <PostStory
        showStoryCreator={showStoryCreator}
        closeStoryCreator={closeStoryCreator}
        storyType={storyType}
        selectedImage={selectedImage}
        selectedVideo={selectedVideo}
        postContent={postContent}
        textBoxes={textBoxes}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        handleMouseDown={handleMouseDown}
        handleTextClick={handleTextClick}
        handleTextChange={handleTextChange}
        handleAddText={handleAddText}
        handleAddToStory={handleAddToStory}
        setTextBoxes={setTextBoxes}
        handleRemoveText={handleRemoveText}
        post={selectedPost}
      />
    </>
  );
};

export default Post;
