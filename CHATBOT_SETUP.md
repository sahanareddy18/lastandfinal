# Chatbot Setup Guide

## Overview
The pharmacy management system now includes an AI-powered chatbot with advanced features for stock management, customer insights, and business intelligence.

## Features
- **Stock Management**: Query inventory levels, expiry dates, and locations
- **Customer Management**: View customer information and loyalty points
- **Sales Analysis**: Get sales reports and revenue insights
- **Business Intelligence**: Performance metrics and trends
- **Report Generation**: Automated reports for sales, stock alerts, and customer loyalty
- **Drug Interaction Checking**: Analyze potential harmful interactions between medications
- **Safety Warnings**: Get contraindications and side effect information
- **Medication Compatibility**: Check if medications can be safely combined

## Setup Instructions

### 1. OpenAI API Key
You need to add your OpenAI API key to the backend `.env` file:

```bash
# Add this line to your .env file in the backend directory
OPENAI_API_KEY=your_openai_api_key_here
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 2. Dependencies Installation
The following packages have been installed:

**Backend:**
- `openai` - For AI chat functionality

**Frontend:**
- `react-markdown` - For rendering AI responses
- `react-syntax-highlighter` - For code highlighting
- `remark-gfm` - For GitHub Flavored Markdown support

### 3. API Endpoints
The chatbot provides the following API endpoints:

- `POST /api/chatbot/chat` - Chat with AI
- `POST /api/chatbot/drug-interactions` - Check drug interactions
- `GET /api/chatbot/insights` - Get system insights
- `POST /api/chatbot/reports` - Generate reports

### 4. Usage
1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd last && npm start`
3. Navigate to the Admin Dashboard
4. Click on the "AI Assistant" tab
5. Start chatting with the AI!

### 5. Example Queries
Try asking the AI:
- "Show me low stock items"
- "What are today's sales?"
- "Which customers have high loyalty points?"
- "Generate a sales report"
- "Check expiring medicines"
- "Is it safe to take aspirin with warfarin?"
- "Check drug interactions between ibuprofen and aspirin"
- "What are the side effects of paracetamol?"
- "Can I take amoxicillin with birth control?"

### 6. Context Options
The chatbot supports different contexts:
- **General**: Default context for general queries
- **Stock**: Focused on inventory and stock management
- **Customers**: Customer-related information and loyalty points
- **Sales**: Sales data and revenue analysis

### 7. Drug Interaction Features
- **Interactive Modal**: Use the "Drug Interactions" button to check multiple medications
- **Safety Warnings**: Get contraindications and side effect information
- **Compatibility Checking**: Verify if medications can be safely combined
- **Real-time Analysis**: Instant feedback on potential harmful interactions

## Troubleshooting

### Common Issues:

1. **"Failed to connect to AI service"**
   - Check if your OpenAI API key is correctly set in `.env`
   - Verify the API key is valid and has sufficient credits

2. **"Failed to get response from AI"**
   - Check your internet connection
   - Verify the backend server is running on port 5000

3. **Frontend dependencies not found**
   - Run `npm install` in the `last` directory
   - Make sure all packages are installed correctly

## Security Notes
- Never commit your OpenAI API key to version control
- Use environment variables for sensitive configuration
- Monitor your OpenAI usage to avoid unexpected charges

## Advanced Configuration
You can modify the AI behavior by editing `chatbotController.js`:
- Change the AI model (currently using `gpt-3.5-turbo`)
- Adjust temperature and max_tokens parameters
- Customize the system context for your specific needs 