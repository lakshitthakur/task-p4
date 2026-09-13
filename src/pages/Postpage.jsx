import React, { useState } from 'react';

function PostPage() {
  const [postType, setPostType] = useState('question');

  const [questionData, setQuestionData] = useState({
    title: '',
    description: '',
    tags: '',
  });

  const [articleData, setArticleData] = useState({
    title: '',
    abstract: '',
    articleText: '',
    tags: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  const handleQuestionChange = (e) => {
    setQuestionData({ ...questionData, [e.target.name]: e.target.value });
  };

  const handleArticleChange = (e) => {
    setArticleData({ ...articleData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    setPostType(e.target.value);
    setErrorMessage('');
    setPostSuccess(false);
  };

  const validateForm = () => {
    if (postType === 'question') {
      const { title, description, tags } = questionData;
      if (!title.trim() || !description.trim() || !tags.trim()) {
        setErrorMessage('Please fill out all fields before submitting your question.');
        return false;
      }
    } else {
      const { title, abstract, articleText, tags } = articleData;
      if (!title.trim() || !abstract.trim() || !articleText.trim() || !tags.trim()) {
        setErrorMessage('Please fill out all fields before submitting your article.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPostSuccess(false);

    if (!validateForm()) return;

    setPostSuccess(true);

    if (postType === 'question') {
      setQuestionData({ title: '', description: '', tags: '' });
    } else {
      setArticleData({ title: '', abstract: '', articleText: '', tags: '' });
    }
  };

  return (
    <div className="post-container">
      <div className="post-header-bar">
        <h3>New Post</h3>
      </div>

      <div className="post-card">
        <div className="post-type-selector">
          <span className="selector-label">Select Post Type:</span>
          <label className="radio-option">
            <input
              type="radio"
              value="question"
              checked={postType === 'question'}
              onChange={handleTypeChange}
            />
            Question
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="article"
              checked={postType === 'article'}
              onChange={handleTypeChange}
            />
            Article
          </label>
        </div>

        <div className="post-sub-bar">
          <h4>What do you want to ask or share</h4>
          <p className="sub-bar-desc">
            This section is designed based on the type of the post. It is conditionally rendered.
          </p>
        </div>

        {errorMessage && (
          <div className="auth-feedback-banner error">
            {errorMessage}
          </div>
        )}

        {postSuccess && (
          <div className="auth-feedback-banner success">
            Post Received!
          </div>
        )}

        <form onSubmit={handleSubmit} className="post-form" noValidate>
          {postType === 'question' ? (
            <div className="conditional-fields">
              <div className="form-group-inline">
                <label htmlFor="q-title">Title</label>
                <input
                  id="q-title"
                  type="text"
                  name="title"
                  placeholder="Start your question with how, what, why, etc."
                  value={questionData.title}
                  onChange={handleQuestionChange}
                />
              </div>

              <div className="form-group-block">
                <label htmlFor="q-desc">Describe your problem</label>
                <textarea
                  id="q-desc"
                  name="description"
                  rows="8"
                  value={questionData.description}
                  onChange={handleQuestionChange}
                />
              </div>

              <div className="form-group-inline">
                <label htmlFor="q-tags">Tags</label>
                <input
                  id="q-tags"
                  type="text"
                  name="tags"
                  placeholder="Please add up to 3 tags to describe what your question is about e.g., Java"
                  value={questionData.tags}
                  onChange={handleQuestionChange}
                />
              </div>
            </div>
          ) : (
            <div className="conditional-fields">
              <div className="form-group-inline">
                <label htmlFor="a-title">Title</label>
                <input
                  id="a-title"
                  type="text"
                  name="title"
                  placeholder="Enter a descriptive title"
                  value={articleData.title}
                  onChange={handleArticleChange}
                />
              </div>

              <div className="form-group-block">
                <label htmlFor="a-abstract">Abstract</label>
                <textarea
                  id="a-abstract"
                  name="abstract"
                  rows="3"
                  placeholder="Enter a 1-paragraph abstract"
                  value={articleData.abstract}
                  onChange={handleArticleChange}
                />
              </div>

              <div className="form-group-block">
                <label htmlFor="a-text">Article Text</label>
                <textarea
                  id="a-text"
                  name="articleText"
                  rows="8"
                  placeholder="Enter a 1-paragraph abstract"
                  value={articleData.articleText}
                  onChange={handleArticleChange}
                />
              </div>

              <div className="form-group-inline">
                <label htmlFor="a-tags">Tags</label>
                <input
                  id="a-tags"
                  type="text"
                  name="tags"
                  placeholder="Please add up to 3 tags to describe what your article is about e.g., Java"
                  value={articleData.tags}
                  onChange={handleArticleChange}
                />
              </div>
            </div>
          )}

          <div className="post-actions">
            <button type="submit" className="post-submit-btn">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostPage;