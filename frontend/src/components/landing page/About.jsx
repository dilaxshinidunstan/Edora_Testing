import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import './About.css';
import Navbar from './Navbar';
import Footer from './Footer';

import { FaWhatsapp } from 'react-icons/fa';
import integrity from '../../assets/images/integrity.svg'
import innovation from '../../assets/images/innovation.svg'
import excellence from '../../assets/images/excellence.svg'
import profile1 from '../../assets/images/profile1.jpg'
import profile2 from '../../assets/images/profile2.jpg'
import profile3 from '../../assets/images/profile.jpg'
import profile4 from '../../assets/images/profile4.jpg'

const About = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with 1000ms animation duration
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevDarkMode => !prevDarkMode);
  };

  return (
    <>
      <Navbar toggleDarkMode={toggleDarkMode} />
      <section className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <div className="context">
          <div className="about" data-aos="fade-down">
            <h2>About Us</h2>
            <p>Information about Edora</p>
          </div>
          <div className="about-container">
            <section className="about-card" data-aos="fade-up">
              <p>Welcome to Edora, where we are dedicated to providing top-quality educational resources and innovative learning solutions.</p>
            </section>

            <section className="about-card" data-aos="fade-up">
              <h3>Our Mission</h3>
              <p>At Edora, our mission is to empower learners through interactive and engaging educational content. We strive to make learning accessible and enjoyable for each student.</p>
            </section>

            <section className="about-card" data-aos="fade-up">
              <h3>Our Vision</h3>
              <p>We envision a world where education is nationally accessible and personalized to meet the needs of every learner in SriLanka. Our commitment is to harness the power of technology to transform the educational landscape.</p>
            </section>

            <section className="about-card" data-aos="fade-up">
              <h3>Our History</h3>
              <p>Edora was founded in June 2024 by Ajintha, Shalini, Dilaxshini, and Kishore. Currently, we are a small startup working on our minimum viable product, aiming to become a leading provider of educational technology and help students achieve their academic goals.</p>
            </section>

            {/* <section className="about-card team-section" data-aos="fade-up">
              <h3>Our Team</h3>
              <p>Meet the people who make it all happen:</p>
              <div className="team-members">
                <div className="team-member" data-aos="fade-right">
                  <img src={profile1} alt="Ajintha" />
                  <p><strong>Ajintha</strong> - Team Member</p>
                </div>
                <div className="team-member" data-aos="fade-left">
                  <img src={profile2} alt="Kishore" />
                  <p><strong>Kishore</strong> - Team Member</p>
                </div>
                <div className="team-member" data-aos="fade-right">
                  <img src={profile3} alt="Shalini" />
                  <p><strong>Shalini</strong> - Team Member</p>
                </div>
                <div className="team-member" data-aos="fade-left">
                  <img src={profile4} alt="Dilaxshini" />
                  <p><strong>Dilaxshini</strong> - Team Member</p>
                </div>
              </div>
            </section> */}

            <section className="about-card values-section" data-aos="fade-up">
              <h3>Our Values</h3>
              <p>We believe in:</p>
              <div className="values">
                <div className="value" data-aos="fade-right">
                  <img src={integrity} alt="Integrity" />
                  <p><strong>Integrity</strong> - We uphold the highest standards of integrity in all of our actions.</p>
                </div>
                <div className="value" data-aos="fade-left">
                  <img src={innovation} alt="Innovation" />
                  <p><strong>Innovation</strong> - We constantly seek innovative solutions to improve the learning experience.</p>
                </div>
                <div className="value" data-aos="fade-right">
                  <img src={excellence} alt="Excellence" />
                  <p><strong>Excellence</strong> - We strive for excellence in everything we do.</p>
                </div>
              </div>
            </section>

            <section className="about-card" data-aos="fade-up">
              <h3>Contact Us</h3>
              <p>We'd love to hear from you! Reach out to us at contact through <span></span>
                <a href="mailto:edora.toinfo@gmail.com?subject=Inquiry&body=Hello," target="_blank">
                  <strong className='linkon'>edora.toinfo@gmail.com</strong>
                </a><br/>
                <a
                  href="https://wa.me/94779363665" // Replace with your number
                  target="_blank"
                  rel="noopener noreferrer"
                > 
                <button className="btn-whatsapp">
                <FaWhatsapp />
                Chat on Whatsapp
                </button>
                </a>
                
              </p>
            </section>
          </div>
          <Footer />
        </div>
      </section>
    </>
  );
};

export default About;
