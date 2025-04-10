import React from 'react';
import Chatbot from './Chatbot';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contact-container">
      <div className="contact-info">
        <h2>Contact Us</h2>
        <div className="contact-details">
          <div className="contact-item">
            <h3>Address</h3>
            <p>123 Fashion Street</p>
            <p>New York, NY 10001</p>
            <p>United States</p>
          </div>
          <div className="contact-item">
            <h3>Phone</h3>
            <p>+1 (555) 123-4567</p>
            <p>Mon-Fri: 9am-6pm EST</p>
          </div>
          <div className="contact-item">
            <h3>Email</h3>
            <p>support@example.com</p>
            <p>info@example.com</p>
          </div>
        </div>
      </div>
      <div className="chatbot-section">
        <Chatbot />
      </div>
    </div>
  );
};

export default ContactUs; 