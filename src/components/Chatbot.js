import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const responses = {
    'hello': 'Hello! How can I help you today?',
    'hi': 'Hi there! How can I assist you?',
    'help': 'I can help you with:\n1. Order tracking\n2. Product information\n3. Returns and refunds\n4. Payment issues\n5. Account management\nWhat would you like to know?',
    'order': 'To track your order, please provide your order ID. You can find it in your order confirmation email or in your account dashboard.',
    'return': 'For returns and refunds, please visit the "Your Orders" section in your account. Select the item you want to return and follow the instructions.',
    'payment': 'If you\'re having payment issues, please check:\n1. Your card details\n2. Available balance\n3. Internet connection\nIf the problem persists, contact our support team.',
    'account': 'For account-related issues, you can:\n1. Reset your password\n2. Update your profile\n3. Change your address\n4. View order history\nWhat specific account help do you need?',
    'delivery': 'Our standard delivery time is 3-5 business days. For express delivery, please select the express shipping option at checkout.',
    'product': 'I can help you find information about our products. Please specify which product you\'re interested in.',
    'price': 'Product prices are displayed on the product pages. You can also find discounts and offers in our "Deals" section.',
    'contact': 'You can reach our customer support at:\nPhone: +1 (555) 123-4567\nEmail: support@example.com\nLive Chat: Available 24/7',
    'thank': 'You\'re welcome! Is there anything else I can help you with?',
    'bye': 'Goodbye! Have a great day!',
  };

  const getResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }
    return 'I\'m sorry, I didn\'t understand that. Could you please rephrase your question? You can ask about orders, returns, payments, or account-related queries.';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      const botResponse = getResponse(userMessage);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 500);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Customer Support Chat</h3>
        <p>How can I help you today?</p>
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot; 