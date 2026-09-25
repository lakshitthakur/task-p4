import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';

function PostPage() {

  // ----------------------------------------------------------
  // POST TYPE
  // ----------------------------------------------------------

  const [postType, setPostType] = useState('question');


  // ----------------------------------------------------------
  // QUESTION DATA
  // ----------------------------------------------------------

  const [questionData, setQuestionData] = useState({
    title: '',
    description: '',
    tags: '',
  });


  // ----------------------------------------------------------
  // ARTICLE DATA
  // ----------------------------------------------------------

  const [articleData, setArticleData] = useState({
    title: '',
    abstract: '',
    articleText: '',
    tags: '',
  });


  // ----------------------------------------------------------
  // POST PLAN
  // ----------------------------------------------------------

  const [postPlan, setPostPlan] = useState('Free');


  // ----------------------------------------------------------
  // UI STATES
  // ----------------------------------------------------------

  const [errorMessage, setErrorMessage] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // ----------------------------------------------------------
  // QUESTION INPUT
  // ----------------------------------------------------------

  const handleQuestionChange = (e) => {

    setQuestionData({
      ...questionData,
      [e.target.name]: e.target.value
    });

  };


  // ----------------------------------------------------------
  // ARTICLE INPUT
  // ----------------------------------------------------------

  const handleArticleChange = (e) => {

    setArticleData({
      ...articleData,
      [e.target.name]: e.target.value
    });

  };


  // ----------------------------------------------------------
  // POST TYPE
  // ----------------------------------------------------------

  const handleTypeChange = (e) => {

    setPostType(e.target.value);

    setErrorMessage('');
    setPostSuccess(false);

  };


  // ----------------------------------------------------------
  // VALIDATE FORM
  // ----------------------------------------------------------

  const validateForm = () => {

    if (postType === 'question') {

      const {
        title,
        description,
        tags
      } = questionData;

      if (
        !title.trim() ||
        !description.trim() ||
        !tags.trim()
      ) {

        setErrorMessage(
          'Please fill out all fields before submitting your question.'
        );

        return false;

      }

    } else {

      const {
        title,
        abstract,
        articleText,
        tags
      } = articleData;

      if (
        !title.trim() ||
        !abstract.trim() ||
        !articleText.trim() ||
        !tags.trim()
      ) {

        setErrorMessage(
          'Please fill out all fields before submitting your article.'
        );

        return false;

      }

    }

    return true;

  };


  // ----------------------------------------------------------
  // SUBMIT POST
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    setErrorMessage('');
    setPostSuccess(false);


    // --------------------------------------------------------
    // CLIENT-SIDE VALIDATION
    // --------------------------------------------------------

    if (!validateForm()) {
      return;
    }


    // --------------------------------------------------------
    // CHECK FIREBASE LOGIN
    // --------------------------------------------------------

    const auth = getAuth();

    const currentUser = auth.currentUser;

    if (!currentUser) {

      setErrorMessage(
        'You must be logged in to create a post.'
      );

      return;

    }


    try {

      setIsSubmitting(true);


      // ------------------------------------------------------
      // GET FIREBASE ID TOKEN
      // ------------------------------------------------------

      const idToken = await currentUser.getIdToken();


      // ------------------------------------------------------
      // CREATE REQUEST BODY
      // ------------------------------------------------------

      let requestBody = {

        postType: postType,

        plan: postPlan

      };


      // ------------------------------------------------------
      // QUESTION
      // ------------------------------------------------------

      if (postType === 'question') {

        requestBody = {

          ...requestBody,

          title: questionData.title,

          description: questionData.description,

          tags: questionData.tags

        };

      }


      // ------------------------------------------------------
      // ARTICLE
      // ------------------------------------------------------

      if (postType === 'article') {

        requestBody = {

          ...requestBody,

          title: articleData.title,

          abstract: articleData.abstract,

          articleText: articleData.articleText,

          tags: articleData.tags

        };

      }


      // ------------------------------------------------------
      // SEND TO BACKEND
      // ------------------------------------------------------

      const response = await fetch(
        'https://task-p5.onrender.com/api/posts',
        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json',

            'Authorization': `Bearer ${idToken}`

          },

          body: JSON.stringify(requestBody)

        }
      );


      // ------------------------------------------------------
      // READ BACKEND RESPONSE
      // ------------------------------------------------------

      const data = await response.json();


      // ------------------------------------------------------
      // HANDLE ERROR
      // ------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          data.message || 'Unable to create post.'
        );

      }


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      setPostSuccess(true);


      // Reset question form
      setQuestionData({
        title: '',
        description: '',
        tags: ''
      });


      // Reset article form
      setArticleData({
        title: '',
        abstract: '',
        articleText: '',
        tags: ''
      });


      // Reset plan
      setPostPlan('Free');


    } catch (error) {

      console.error(
        'Create post error:',
        error
      );

      setErrorMessage(
        error.message ||
        'Something went wrong while creating the post.'
      );

    } finally {

      setIsSubmitting(false);

    }

  };


  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (

    <div className="post-container">

      <div className="post-header-bar">

        <h3>New Post</h3>

      </div>


      <div className="post-card">


        {/* ------------------------------------------------ */}
        {/* POST TYPE */}
        {/* ------------------------------------------------ */}

        <div className="post-type-selector">

          <span className="selector-label">
            Select Post Type:
          </span>


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


        {/* ------------------------------------------------ */}
        {/* POST PLAN */}
        {/* ------------------------------------------------ */}

        <div className="post-type-selector">

          <span className="selector-label">
            Post Plan:
          </span>


          <label className="radio-option">

            <input
              type="radio"
              value="Free"
              checked={postPlan === 'Free'}
              onChange={(e) =>
                setPostPlan(e.target.value)
              }
            />

            Free

          </label>


          <label className="radio-option">

            <input
              type="radio"
              value="Paid"
              checked={postPlan === 'Paid'}
              onChange={(e) =>
                setPostPlan(e.target.value)
              }
            />

            Paid

          </label>

        </div>


        {/* ------------------------------------------------ */}
        {/* SUB HEADER */}
        {/* ------------------------------------------------ */}

        <div className="post-sub-bar">

          <h4>
            What do you want to ask or share
          </h4>

          <p className="sub-bar-desc">

            This section is designed based on
            the type of the post.

          </p>

        </div>


        {/* ------------------------------------------------ */}
        {/* ERROR */}
        {/* ------------------------------------------------ */}

        {errorMessage && (

          <div className="auth-feedback-banner error">

            {errorMessage}

          </div>

        )}


        {/* ------------------------------------------------ */}
        {/* SUCCESS */}
        {/* ------------------------------------------------ */}

        {postSuccess && (

          <div className="auth-feedback-banner success">

            Post created successfully!

          </div>

        )}


        {/* ------------------------------------------------ */}
        {/* FORM */}
        {/* ------------------------------------------------ */}

        <form
          onSubmit={handleSubmit}
          className="post-form"
          noValidate
        >


          {/* ============================================== */}
          {/* QUESTION */}
          {/* ============================================== */}

          {postType === 'question' ? (

            <div className="conditional-fields">


              <div className="form-group-inline">

                <label htmlFor="q-title">
                  Title
                </label>

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

                <label htmlFor="q-desc">
                  Describe your problem
                </label>

                <textarea
                  id="q-desc"
                  name="description"
                  rows="8"
                  value={questionData.description}
                  onChange={handleQuestionChange}
                />

              </div>


              <div className="form-group-inline">

                <label htmlFor="q-tags">
                  Tags
                </label>

                <input
                  id="q-tags"
                  type="text"
                  name="tags"
                  placeholder="e.g. Java, React, Firebase"
                  value={questionData.tags}
                  onChange={handleQuestionChange}
                />

              </div>

            </div>


          ) : (


            /* ============================================ */
            /* ARTICLE */
            /* ============================================ */

            <div className="conditional-fields">


              <div className="form-group-inline">

                <label htmlFor="a-title">
                  Title
                </label>

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

                <label htmlFor="a-abstract">
                  Abstract
                </label>

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

                <label htmlFor="a-text">
                  Article Text
                </label>

                <textarea
                  id="a-text"
                  name="articleText"
                  rows="8"
                  placeholder="Write your article here..."
                  value={articleData.articleText}
                  onChange={handleArticleChange}
                />

              </div>


              <div className="form-group-inline">

                <label htmlFor="a-tags">
                  Tags
                </label>

                <input
                  id="a-tags"
                  type="text"
                  name="tags"
                  placeholder="e.g. Java, React, Firebase"
                  value={articleData.tags}
                  onChange={handleArticleChange}
                />

              </div>

            </div>

          )}


          {/* ------------------------------------------------ */}
          {/* SUBMIT */}
          {/* ------------------------------------------------ */}

          <div className="post-actions">

            <button
              type="submit"
              className="post-submit-btn"
              disabled={isSubmitting}
            >

              {isSubmitting
                ? 'Posting...'
                : 'Post'
              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default PostPage;