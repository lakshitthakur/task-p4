import React from "react";

import firstbg from "../assets/home/firstbg.jpeg";
import facebookImage from "../assets/home/fb.png";
import netflixImage from "../assets/home/nfbg.png";
import netflixImageTwo from "../assets/home/nf2.png";

const Homepage = () => {
  return (
    <main className="homepage">

      {/* Hero Section */}
      <section className="home-hero">
        <h1>Welcome to DEV@Deakin</h1>

        <p>
          A platform for students and academics to connect, share knowledge,
          and collaborate. This homepage also showcases my web development
          projects and practical work.
        </p>
      </section>

      {/* About Me */}
      <section className="home-section">
        <div className="about-content">
          <h2>About Me</h2>

          <p>
            Welcome to my DEV@Deakin platform. I am currently exploring
            foundational frontend technologies such as HTML, CSS and React
            to build secure, responsive and user-friendly web applications.
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="home-section">
        <h2>Featured Projects</h2>

        <p>
          The following projects demonstrate my practical experience in
          frontend development, responsive design and web application
          development.
        </p>

        <div className="projects-grid">

          {/* Project 1 */}
          <article className="project-card">
            <img
              src={facebookImage}
              alt="Secure Web App project screenshot"
              className="project-image"
            />

            <div className="project-content">
              <h3>Secure Web App</h3>

              <p>
                A website developed as an educational project inspired by
                social media platforms. The project focuses on frontend
                development, responsive design and user interface structure.
              </p>

              <a
                href="https://github.com/lakshitthakur/task-p4"
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                View on GitHub
              </a>
            </div>
          </article>

          {/* Project 2 */}
          <article className="project-card">
            <img
              src={netflixImage}
              alt="Data Analytics Dashboard project screenshot"
              className="project-image"
            />

            <div className="project-content">
              <h3>Data Analytics Dashboard</h3>

              <p>
                A dashboard-style web project inspired by streaming
                platforms. It was developed for educational and
                entertainment purposes and demonstrates frontend layout
                and visual presentation.
              </p>

              <a
                href="https://github.com/lakshitthakur/task-p4"
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                View on GitHub
              </a>
            </div>
          </article>

        </div>
      </section>

      {/* Image Gallery */}
      <section className="home-section">
        <h2>Image Gallery</h2>

        <p>
          A selection of screenshots from my web development projects.
        </p>

        <div className="gallery-grid">

          <img
            src={firstbg}
            alt="DEV@Deakin project screenshot"
            className="gallery-image"
          />

          <img
            src={facebookImage}
            alt="Secure Web App screenshot"
            className="gallery-image"
          />

          <img
            src={netflixImage}
            alt="Data Analytics Dashboard screenshot"
            className="gallery-image"
          />

          <img
            src={netflixImageTwo}
            alt="Data Analytics project screenshot"
            className="gallery-image"
          />

        </div>
      </section>

    </main>
  );
};

export default Homepage;