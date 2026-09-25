import React, { useEffect, useMemo, useState } from 'react';
import { getAuth } from 'firebase/auth';

// Backend API base URL
const API_URL = 'https://task-p5.onrender.com';

function BrowsePosts() {
  // Store all posts fetched from the backend
  const [posts, setPosts] = useState([]);

  // Store the current user's subscription plan
  const [userPlan, setUserPlan] = useState('Free');

  // Store loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Store the selected filter values
  const [typeFilter, setTypeFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Store the ID of the currently expanded post
  const [expandedPost, setExpandedPost] = useState(null);

  // Fetch posts when the component first loads
  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch posts from the backend
  const fetchPosts = async () => {
    try {
      // Start loading and clear any previous error
      setLoading(true);
      setError('');

      // Get Firebase authentication
      const auth = getAuth();

      // Get the currently logged-in user
      const currentUser = auth.currentUser;

      // Create request headers
      const headers = {
        'Content-Type': 'application/json'
      };

      // If the user is logged in, attach their Firebase ID token
      if (currentUser) {
        const idToken = await currentUser.getIdToken();

        headers.Authorization = `Bearer ${idToken}`;
      }

      // Request posts from the backend API
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'GET',
        headers
      });

      // Convert the response into JSON
      const data = await response.json();

      // Handle unsuccessful API responses
      if (!response.ok) {
        throw new Error(data.message || 'Unable to load posts.');
      }

      // Save the returned posts
      setPosts(data.posts || []);

      // Save the user's current plan
      setUserPlan(data.userPlan || 'Free');

    } catch (err) {
      // Log and display the error
      console.error('Browse posts error:', err);
      setError(err.message || 'Unable to load posts.');

    } finally {
      // Stop the loading state
      setLoading(false);
    }
  };

  // Create a unique list of tags from all posts
  const allTags = useMemo(() => {
    const tags = posts.flatMap((post) => post.tags || []);

    // Remove duplicate tags and sort them alphabetically
    return [...new Set(tags)].sort();
  }, [posts]);

  // Filter posts based on the selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {

      // Check the selected post type
      const matchesType =
        typeFilter === 'All' ||
        post.postType === typeFilter.toLowerCase();

      // Check the selected subscription plan
      const matchesPlan =
        planFilter === 'All' ||
        post.plan === planFilter;

      // Check whether the post contains the selected tag
      const matchesTag =
        !tagFilter ||
        (post.tags || []).some(
          (tag) => tag.toLowerCase() === tagFilter.toLowerCase()
        );

      // Assume the date matches unless a date filter is selected
      let matchesDate = true;

      // Compare the post date with the selected date
      if (dateFilter && post.createdAt?._seconds) {
        const postDate = new Date(post.createdAt._seconds * 1000)
          .toISOString()
          .split('T')[0];

        matchesDate = postDate === dateFilter;
      }

      // Return only posts matching every selected filter
      return (
        matchesType &&
        matchesPlan &&
        matchesTag &&
        matchesDate
      );
    });
  }, [
    posts,
    typeFilter,
    planFilter,
    tagFilter,
    dateFilter
  ]);

  // Reset all filters to their default values
  const resetFilters = () => {
    setTypeFilter('All');
    setPlanFilter('All');
    setTagFilter('');
    setDateFilter('');
  };

  // Convert the Firebase timestamp into a readable date
  const formatDate = (createdAt) => {
    // Handle posts without a valid date
    if (!createdAt?._seconds) {
      return 'Date unavailable';
    }

    // Format the date using Australian date formatting
    return new Date(createdAt._seconds * 1000).toLocaleDateString(
      'en-AU',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  };

  return (
    <section className="browse-posts-page">

      {/* Page heading and description */}
      <div className="browse-header">
        <div>
          <h1>Browse Posts</h1>

          <p>
            Explore questions and articles shared by the DEV@Deakin
            community.
          </p>
        </div>

        {/* Display the user's current subscription plan */}
        <div className="user-plan-badge">
          Current plan: <strong>{userPlan}</strong>
        </div>
      </div>

      {/* Post filtering controls */}
      <div className="browse-filters">

        {/* Filter posts by type */}
        <div className="filter-group">
          <label>Post Type</label>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="All">All</option>
            <option value="Question">Question</option>
            <option value="Article">Article</option>
          </select>
        </div>

        {/* Filter posts by subscription plan */}
        <div className="filter-group">
          <label>Plan</label>

          <select
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value)}
          >
            <option value="All">All</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {/* Filter posts by tag */}
        <div className="filter-group">
          <label>Tag</label>

          <select
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
          >
            <option value="">All tags</option>

            {/* Create an option for each unique tag */}
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Filter posts by creation date */}
        <div className="filter-group">
          <label>Date</label>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>

        {/* Reset all filters */}
        <button
          type="button"
          className="reset-filter-button"
          onClick={resetFilters}
        >
          Reset
        </button>

      </div>

      {/* Display loading message while posts are being fetched */}
      {loading && (
        <div className="browse-status">
          Loading posts...
        </div>
      )}

      {/* Display an error if the API request fails */}
      {error && (
        <div className="browse-error">
          {error}
        </div>
      )}

      {/* Display a message if no posts match the filters */}
      {!loading && !error && filteredPosts.length === 0 && (
        <div className="browse-status">
          No posts match the selected filters.
        </div>
      )}

      {/* Display all filtered posts */}
      <div className="posts-grid">

        {filteredPosts.map((post) => {

          // Check whether this post is currently expanded
          const isExpanded = expandedPost === post.id;

          return (
            <article
              key={post.id}
              className="post-card"
            >

              {/* Display post type and subscription plan */}
              <div className="post-card-header">

                {/* Display Question or Article */}
                <span className="post-type">
                  {post.postType === 'question'
                    ? 'Question'
                    : 'Article'}
                </span>

                {/* Display Free or Paid */}
                <span className={`post-plan ${post.plan.toLowerCase()}`}>
                  {post.plan}
                </span>

              </div>

              {/* Display the post title */}
              <h2>{post.title}</h2>

              {/* Display the post creation date */}
              <p className="post-date">
                {formatDate(post.createdAt)}
              </p>

              {/* Display question description or article abstract */}
              {post.postType === 'question' ? (
                <p>
                  {post.description}
                </p>
              ) : (
                <p>
                  {isExpanded
                    ? post.articleText
                    : post.abstract}
                </p>
              )}

              {/* Display post tags */}
              <div className="post-tags">
                {(post.tags || []).map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Expand or collapse the post */}
              <button
                type="button"
                className="expand-post-button"
                onClick={() =>
                  setExpandedPost(
                    isExpanded ? null : post.id
                  )
                }
              >
                {isExpanded
                  ? 'Show Less'
                  : 'Expand Post'}
              </button>

              {/* Display expanded question content */}
              {isExpanded && post.postType === 'question' && (
                <div className="expanded-content">
                  <p>
                    {post.description}
                  </p>
                </div>
              )}

              {/* Display expanded article content */}
              {isExpanded && post.postType === 'article' && (
                <div className="expanded-content">

                  {/* Article abstract */}
                  <h3>Abstract</h3>

                  <p>
                    {post.abstract}
                  </p>

                  {/* Full article text */}
                  <h3>Article</h3>

                  <p>
                    {post.articleText}
                  </p>

                </div>
              )}

            </article>
          );
        })}

      </div>

    </section>
  );
}

export default BrowsePosts;