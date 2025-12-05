import React, { useEffect, useState,useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import emailjs from '@emailjs/browser';
import './Welcome.css';
import { FaUser, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import '@fortawesome/fontawesome-free/css/all.min.css';
import success1 from '../../assets/images/success1.png'
import success2 from '../../assets/images/success2.png'
import success3 from '../../assets/images/success3.png'
import contact from '../../assets/images/contact.png'
import personalised from '../../assets/images/personalised.jpg'
import game from '../../assets/images/game.jpg'
import self from '../../assets/images/self.jpg'

const Welcome = () => {

  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with a duration of 1000ms
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const testimonials = [
  {
    name: 'N. Vithurshan',
    quote: 'This website transformed my life by providing quality education and guidance.',
    rating: 4,
  },
  {
    name: 'L. Aishwarya',
    quote: 'Thanks to Edora, I was able to achieve my academic goals in an effective way.',
    rating: 5,
  },
  {
    name: 'A.H.M. Parveena',
    quote: 'The practicing papers and quiz here helped me excel in my exam preparation.',
    rating: 4.5,
  },
  {
    name: 'J. Jude Jeron',
    quote: 'The interactive quizzes and engaging content made learning both fun and effective.',
    rating: 5,
  },
];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs.sendForm('service_x9llp4k', 'template_y50jy8s', e.target, 'V5tbtA7LeLnz4Yxx2')
      .then((result) => {
        alert('Thank you for contacting Edora Team! 😃');
        setFormData({ name: '', email: '', message: '' });
      }, (error) => {
        alert('Oops, Try Again!');
      });
  };

  return (
    <div className="welcome-container" data-aos="fade-up">
      {/* <br/> */}
      <section id="home" className="welcome-section hero-section" data-aos="zoom-in-up">
        <div className="hero-content">
          <h1><strong>Unlock Your Potential with AI Education</strong></h1>
          <p>Designed to equip students with the knowledge and confidence to excel in today's competitive world through dynamic learning experiences.</p>
          <br/>
          <div className="cta-buttons">
            <a href="/signup" className="cta-button student-btn">Let's Go</a>
            {/* <a href="/tutors" className="cta-button tutor-btn">For Tutors</a> */}
          </div>
        </div>
      </section>

      {/* <section id="about-us" className="welcome-section" data-aos="zoom-in-up" data-aos-duration="2000">
        <h2><strong>About Us</strong></h2>
        <p>Summary of the services we offer to support your educational journey</p>
        <div className="about-us-content">
          <div className="about-us-item" data-aos="fade-down">
            <i className="fas fa-users about-us-icon"></i>
            <h1><strong>1,200+</strong></h1>
            <p>Number of Students</p>
          </div>
          {/* <div className="about-us-item" data-aos="fade-down">
            <i className="fas fa-chalkboard-teacher about-us-icon"></i>
            <h1><strong>50+</strong></h1>
            <p>Number of Tutors</p>
          </div> */}
          {/* <div className="about-us-item" data-aos="fade-down">
            <i className="fas fa-book about-us-icon"></i>
            <h1><strong>20+</strong></h1>
            <p>Available Courses</p>
          </div>
          <div className="about-us-item"data-aos="fade-down">
            <i className="fas fa-archive about-us-icon"></i>
            <h1><strong>150+</strong></h1>
            <p>Available Materials</p>
          </div>
        </div>
      </section>  */}

      
{/* Services Section */}
<section id="services" className="welcome-section services-section"data-aos="zoom-in-up" data-aos-duration="2000">
        <h2>Our Services</h2>
        <div className="services-container">
          <div className="service-card"data-aos="fade-down-right">
            <div className="service-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="service-content">
              <h3>Interactive Learning</h3>
              <p>Engage in interactive lessons with our AI tools that enhance learning through real-time feedback and adaptive methods.</p>
            </div>
          </div>

          <div className="service-card" data-aos="fade-down">
            <div className="service-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="service-content">
              <h3>Past Papers</h3>
              <p>Access a vast collection of past exam papers and practice tests to prepare for your exams with confidence.</p>
            </div>
          </div>

          <div className="service-card" data-aos="fade-down-left">
            <div className="service-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="service-content">
              <h3>Gamified Learning</h3>
              <p>
              Make learning enjoyable with our gamified content that lets you earn rewards and achievements as you progress through lessons.</p>
            </div>
          </div>

          {/* Add more services as needed */}
        </div>
      </section>
      {/* <section id="downloads" className="welcome-section" data-aos="zoom-in-up" data-aos-duration="2000">
        <h2><strong>Downloads</strong></h2>
        <p>Download the past papers and model papers for your best practice</p>
        <br/>
        <div className="downloads-preview">
          <div className="book-card"  data-aos="fade-down-right">
            <img src={Englishp} alt="G.C.E O/L 2023 English" className="book-image" />
            <h3>G.C.E O/L 2023</h3>
            <p>English</p>
          </div>
          <div className="book-card"  data-aos="fade-down">
            <img src={Mathsp} alt="G.C.E O/L 2023 Mathematics" className="book-image" />
            <h3>G.C.E O/L 2023</h3>
            <p>Mathematics</p>
          </div>
          <div className="book-card"  data-aos="fade-down-left">
            <img src={Sciencep} alt="G.C.E O/L 2023 Science" className="book-image" />
            <h3>G.C.E O/L 2023</h3>
            <p>Science</p>
          </div>
        </div>
        <a href="/downloads" className="see-more-button">See More</a>
      </section> */}
      {/* <section id="elibrary" className="welcome-section" data-aos="zoom-in-up" data-aos-duration="2000">
        <h2><strong>E-Library</strong></h2>
        <p>Access valuable reference materials for your studies</p>
        <br/>
        <div className="downloads-preview">
          <div className="book-card"  data-aos="fade-down-right">
            <img src={Science} alt="Social Studies" className="book-image" />
            <h3>Social Studies</h3>
            <p>Science</p>
            <p>Emily Brown</p>
            <p>4.8 ★</p>                
          </div>
          <div className="book-card" data-aos="fade-down">
            <img src={English} alt="Easy English" className="book-image" />
            <h3>Easy English</h3>
            <p>English</p>
            <p>John Doe</p>
            <p>4.5 ★</p>
          </div>
          <div className="book-card"  data-aos="fade-down-left">
            <img src={Maths} alt="Numerical Tricks" className="book-image" />
            <h3>Numerical Tricks</h3>
            <p>Mathematics</p>
            <p>Jane Smith</p>
            <p>4.2 ★</p>
          </div>
        </div>
        <a href="/elibrary" className="see-more-button">See More</a>
      </section> */}

 {/* Blog Section */}
 <section id="blog" className="welcome-section blog-section" data-aos="zoom-in-up" data-aos-duration="2000">
        <h2>Latest Blog Posts</h2>
        <div className="blog-preview">
          <div className="blog-card" data-aos="fade-down-right">
            <img src={personalised} alt="Blog Post 1" className="blog-img"/>
            <div className="blog-content">
              <h3>AI in Personalized Learning</h3>
              <p>Discover how artificial intelligence is being utilized to create personalized learning experiences. </p>
            </div>
          </div>

          <div className="blog-card" data-aos="fade-down"> 
            <img src={game} alt="Blog Post 2" className="blog-img"/>
            <div className="blog-content">
              <h3>Gamification in Education</h3>
              <p>Learn how gamification can enhance learning experiences and keep students motivated. </p>
            </div>
          </div><div className="blog-card"data-aos="fade-down-left">
            <img src={self} alt="Blog Post 2" className="blog-img"/>
            <div className="blog-content">
              <h3>The Benefits of Self-Learning</h3>
              <p>Explore the advantages of self-learning through online platforms. </p>
            </div>
          </div>

          {/* Add more blog cards as needed */}
        </div>
        <a href="/blog" className="see-more-button">Read More</a>
      </section>


      <section id="success-stories" className="welcome-section" data-aos="zoom-in-up" data-aos-duration="2000">
        <h2>Success Stories</h2>
        <p>Discover how our platform has helped students achieve their goals and excel in their studies</p>
        <br/>
        <div className="stories-container">
          <div className="testimonial-container">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card"
                data-aos="fade-down"
              >
                <div className="gradient-circle-bottom"></div>
                <div className="gradient-circle-top"></div>
                <h3 className="testimonial-name">{testimonial.name}</h3>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-rating">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:scale-105" data-aos="fade-down-left">
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#107067] to-[#04aaa2] rounded-full opacity-30"></div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-tl from-[#107067] to-[#04aaa2] rounded-full opacity-50"></div>
              <h3 className="text-xl font-bold text-gray-800">N. Vithurshan</h3>
              <p className="text-sm text-gray-600 mt-2 italic">
              "This website transformed my life by providing quality education and guidance."
              </p>
              <div className="flex mt-3 space-x-1 text-yellow-500 text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
            <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:scale-105" data-aos="fade-down-left">
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#107067] to-[#04aaa2] rounded-full opacity-30"></div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-tl from-[#107067] to-[#04aaa2] rounded-full opacity-50"></div>
              <h3 className="text-xl font-bold text-gray-800">L. Aishwarya</h3>
              <p className="text-sm text-gray-600 mt-2 italic">
              "Thanks to Edora, I was able to achieve my academic goals in an effective way."
              </p>
              <div className="flex mt-3 space-x-1 text-yellow-500 text-lg">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:scale-105" data-aos="fade-down-left">
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#107067] to-[#04aaa2] rounded-full opacity-30"></div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-tl from-[#107067] to-[#04aaa2] rounded-full opacity-50"></div>
            <h3 className="text-xl font-bold text-gray-800">T. Janani</h3>
            <p className="text-sm text-gray-600 mt-2 italic">
              "The practicing papers and quiz here helped me excel in my exam preparation."
            </p>
            <div className="flex mt-3 space-x-1 text-yellow-500 text-lg">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
          </div> */}
        </div>
      </section>

      <section id="contact" className="welcome-section"data-aos="zoom-in-up">
        <h2>Contact Us</h2>
        <p>Get in touch with us for any inquiries, support, or feedback. We’re here to help!</p>
        <div className="contact-content">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="input-group">
              <FaUser />
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaEnvelope />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaPaperPlane />
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="contact-btn">Send Message</button>
          </form>
          <div className="contact-image">
            <img src={contact} alt="Contact Us" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;