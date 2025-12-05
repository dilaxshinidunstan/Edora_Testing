import React from 'react';
import './Footer.css';
import { FaFacebook, FaYoutube, FaLinkedinIn, FaInstagram } from 'react-icons/fa'; // Importing social media icons
import qrcode from '../../assets/images/qrcode.png'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left side: Paragraph and Links */}
        <div className="footer-left">
          <p>© All rights reserved. Made with <span className="heart">❤</span> from Edora</p>
       
        </div>

        {/* Right side */}
        <div className="footer-right">
          {/* Social Media Icons */}
          <div className="footer-social-icons">
            <a href="https://www.facebook.com/people/Edora/61571247552104" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://www.linkedin.com/company/learnwithedora/" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
            <a href="https://www.youtube.com/@learnwithedora" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
            <a href="https://www.instagram.com/learnwithedora" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
