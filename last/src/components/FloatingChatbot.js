import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Modal, message } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import './FloatingChatbot.css';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    { text: 'Drug Interactions', query: 'check interactions between aspirin and warfarin' },
    { text: 'Stock Info', query: 'show me stock information' },
    { text: 'Sales Report', query: 'show me sales report' },
    { text: 'Test Connection', query: 'hello' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: messages.map(m => m.content).slice(-3)
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = { type: 'bot', content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleTestConnection = () => {
    setInputMessage('hello');
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="floating-button" onClick={() => setIsOpen(true)}>
        <MessageOutlined />
      </div>

      {/* Chat Modal */}
      <Modal
        title={
          <div className="modal-header">
            <span>🤖 AI Assistant</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              className="close-button"
            />
          </div>
        }
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={600}
        className="chatbot-modal"
        closable={false}
      >
        <div className="chatbot-container">
          {/* Messages */}
          <div className="messages-container" id="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h3>👋 Welcome to AI Assistant!</h3>
                <p>I can help you with:</p>
                <ul>
                  <li>💊 Drug interactions</li>
                  <li>📦 Stock information</li>
                  <li>📊 Sales reports</li>
                  <li>🔍 General queries</li>
                </ul>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="small"
                onClick={() => handleQuickAction(action)}
                className="quick-action-btn"
              >
                {action.text}
              </Button>
            ))}
          </div>

          {/* Input Area */}
          <div className="input-container">
            <Input.TextArea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="send-button"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FloatingChatbot; 
