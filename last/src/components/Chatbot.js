import React, { useState, useRef, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Tag, 
  Tooltip, 
  Spin,
  Alert,
  Collapse,
  Statistic,
  Row,
  Col,
  Select,
  message,
  Modal,
  List,
  Badge
} from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined, 
  BulbOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ClearOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import './Chatbot.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [context, setContext] = useState('general');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDrugInteractionModal, setShowDrugInteractionModal] = useState(false);
  const [drugInteractionResult, setDrugInteractionResult] = useState(null);
  const [medications, setMedications] = useState(['', '']);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
                 content: `Hello! I'm your AI assistant for the pharmacy management system. I can help you with:

🔍 **Stock Management**: Check inventory levels, expiry dates, and locations
👥 **Customer Management**: View customer info and loyalty points
📊 **Sales Analysis**: Get sales reports and revenue insights
⚠️ **Alerts**: Low stock warnings and expiring medicines
📈 **Business Intelligence**: Performance metrics and trends
💊 **Drug Safety**: Check drug interactions and medication compatibility
🛡️ **Safety Warnings**: Get contraindications and side effect information

Try asking me questions like:
- "Show me low stock items"
- "What are today's sales?"
- "Which customers have high loyalty points?"
- "Generate a sales report"
- "Is it safe to take aspirin with warfarin?"
- "Check drug interactions between ibuprofen and aspirin"

How can I help you today?`,
        timestamp: new Date()
      }
    ]);
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const response = await axios.get('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/chatbot/insights');
      if (response.data.success) {
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/chatbot/chat', {
        message: inputMessage,
        context: context
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        message.error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      message.error('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/chatbot/reports', {
        reportType: reportType
      });

      if (response.data.success) {
        const reportMessage = {
          id: Date.now(),
          type: 'ai',
          content: `📊 **${reportType.replace('_', ' ').toUpperCase()} Report Generated**

${JSON.stringify(response.data.reportData, null, 2)}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, reportMessage]);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      message.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'ai',
        content: 'Chat history cleared. How can I help you?',
        timestamp: new Date()
      }
    ]);
  };

  const checkDrugInteractions = async () => {
    const validMedications = medications.filter(med => med.trim() !== '');
    if (validMedications.length < 2) {
      message.error('Please enter at least 2 medications to check for interactions');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/chatbot/drug-interactions', {
        medications: validMedications
      });

      if (response.data.success) {
        setDrugInteractionResult(response.data.data);
        message.success('Drug interaction check completed');
      } else {
        message.error('Failed to check drug interactions');
      }
    } catch (error) {
      console.error('Drug interaction check error:', error);
      message.error('Failed to check drug interactions');
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicationField = () => {
    setMedications([...medications, '']);
  };

  const removeMedicationField = (index) => {
    if (medications.length > 2) {
      const newMedications = medications.filter((_, i) => i !== index);
      setMedications(newMedications);
    }
  };

  const updateMedication = (index, value) => {
    const newMedications = [...medications];
    newMedications[index] = value;
    setMedications(newMedications);
  };

  const renderMessage = (message) => {
    const isAI = message.type === 'ai';
    
    return (
      <div key={message.id} className={`message ${isAI ? 'ai-message' : 'user-message'}`}>
        <div className="message-header">
          <Space>
            {isAI ? <RobotOutlined className="ai-icon" /> : <UserOutlined className="user-icon" />}
            <Text type="secondary">
              {isAI ? 'AI Assistant' : 'You'} • {message.timestamp.toLocaleTimeString()}
            </Text>
          </Space>
        </div>
        <div className="message-content">
          {isAI ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      Pretag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <Text>{message.content}</Text>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <Card 
        title={
          <Space>
            <RobotOutlined />
            <Title level={4} style={{ margin: 0 }}>AI Assistant</Title>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadInsights}
              size="small"
            >
              Refresh
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              onClick={clearChat}
              size="small"
              danger
            >
              Clear
            </Button>
          </Space>
        }
        className="chatbot-card"
      >
        {/* System Insights */}
        {insights && (
          <div className="insights-section">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic 
                  title="Total Stock Items" 
                  value={insights.totalStock} 
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Low Stock Alerts" 
                  value={insights.lowStockItems} 
                  valueStyle={{ color: insights.lowStockItems > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Expiring Soon" 
                  value={insights.expiringItems} 
                  valueStyle={{ color: insights.expiringItems > 0 ? '#faad14' : '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Total Customers" 
                  value={insights.totalCustomers} 
                />
              </Col>
            </Row>
          </div>
        )}

        <Divider />

        {/* Quick Actions */}
        <div className="quick-actions">
          <Space wrap>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleGenerateReport('sales_summary')}
              loading={isLoading}
            >
              Sales Report
            </Button>
            <Button 
              size="small"
              onClick={() => handleGenerateReport('stock_alerts')}
              loading={isLoading}
            >
              Stock Alerts
            </Button>
            <Button 
              size="small"
              onClick={() => handleGenerateReport('customer_loyalty')}
              loading={isLoading}
            >
              Loyalty Report
            </Button>
            <Button 
              type="primary"
              danger
              size="small"
              onClick={() => setShowDrugInteractionModal(true)}
            >
              Drug Interactions
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Context Selector */}
        <div className="context-selector">
          <Space>
            <Text strong>Context:</Text>
            <Select 
              value={context} 
              onChange={setContext}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="general">General</Option>
              <Option value="stock">Stock</Option>
              <Option value="customers">Customers</Option>
              <Option value="sales">Sales</Option>
            </Select>
          </Space>
        </div>

        {/* Chat Messages */}
        <div className="messages-container">
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="message ai-message">
              <div className="message-header">
                <Space>
                  <RobotOutlined className="ai-icon" />
                  <Text type="secondary">AI Assistant • Thinking...</Text>
                </Space>
              </div>
              <div className="message-content">
                <Spin size="small" />
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Processing your request...
                </Text>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your pharmacy management system..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isLoading}
              style={{ height: 'auto' }}
            >
              Send
            </Button>
          </Space.Compact>
        </div>

        {/* Help Section */}
        <Collapse 
          ghost 
          size="small" 
          style={{ marginTop: 16 }}
        >
                     <Panel header="💡 Quick Tips" key="1">
             <ul>
               <li>Ask about stock levels: "Show me low stock items"</li>
               <li>Check sales: "What are today's sales?"</li>
               <li>Customer info: "Which customers have high loyalty points?"</li>
               <li>Generate reports using the quick action buttons above</li>
               <li>Use the context selector for more specific responses</li>
               <li><strong>Drug Safety:</strong> Use the "Drug Interactions" button to check medication compatibility</li>
               <li>Ask about drug interactions: "Is it safe to take aspirin with warfarin?"</li>
               <li>Check side effects: "What are the side effects of ibuprofen?"</li>
             </ul>
           </Panel>
                 </Collapse>
       </Card>

       {/* Drug Interaction Modal */}
       <Modal
         title={
           <Space>
             <Badge status="error" />
             <Title level={4} style={{ margin: 0 }}>Drug Interaction Checker</Title>
           </Space>
         }
         open={showDrugInteractionModal}
         onCancel={() => {
           setShowDrugInteractionModal(false);
           setDrugInteractionResult(null);
           setMedications(['', '']);
         }}
         footer={[
           <Button key="cancel" onClick={() => setShowDrugInteractionModal(false)}>
             Cancel
           </Button>,
           <Button 
             key="check" 
             type="primary" 
             danger
             onClick={checkDrugInteractions}
             loading={isLoading}
           >
             Check Interactions
           </Button>
         ]}
         width={800}
       >
         <div style={{ marginBottom: 16 }}>
           <Text strong>Enter medications to check for potential interactions:</Text>
         </div>

         {medications.map((medication, index) => (
           <div key={index} style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
             <Input
               placeholder={`Medication ${index + 1}`}
               value={medication}
               onChange={(e) => updateMedication(index, e.target.value)}
               style={{ flex: 1 }}
             />
             {medications.length > 2 && (
               <Button 
                 danger 
                 size="small"
                 onClick={() => removeMedicationField(index)}
               >
                 Remove
               </Button>
             )}
           </div>
         ))}

         <Button 
           type="dashed" 
           onClick={addMedicationField}
           style={{ marginBottom: 16 }}
         >
           Add Another Medication
         </Button>

         {drugInteractionResult && (
           <div style={{ marginTop: 16 }}>
             <Divider />
             <Title level={5}>
               <Badge 
                 status={drugInteractionResult.hasInteractions ? 'error' : 'success'} 
                 text={
                   drugInteractionResult.hasInteractions 
                     ? '⚠️ INTERACTIONS FOUND' 
                     : '✅ NO INTERACTIONS DETECTED'
                 }
               />
             </Title>

             {drugInteractionResult.hasInteractions && (
               <Alert
                 message="Potential Drug Interactions Detected"
                 description={
                   <div>
                     <Text strong>Medications checked:</Text>
                     <List
                       size="small"
                       dataSource={drugInteractionResult.medications}
                       renderItem={(item) => <List.Item>{item}</List.Item>}
                     />
                     
                     <Divider />
                     
                     <Text strong>Interactions found:</Text>
                     <List
                       size="small"
                       dataSource={drugInteractionResult.interactions}
                       renderItem={(item) => (
                         <List.Item>
                           <Text type="danger">
                             {item.medication1} + {item.medication2}: {item.warning}
                           </Text>
                         </List.Item>
                       )}
                     />

                     {drugInteractionResult.warnings.length > 0 && (
                       <>
                         <Divider />
                         <Text strong>General warnings:</Text>
                         <List
                           size="small"
                           dataSource={drugInteractionResult.warnings}
                           renderItem={(item) => (
                             <List.Item>
                               <Text type="warning">{item}</Text>
                             </List.Item>
                           )}
                         />
                       </>
                     )}
                   </div>
                 }
                 type="error"
                 showIcon
                 style={{ marginTop: 8 }}
               />
             )}

             {!drugInteractionResult.hasInteractions && (
               <Alert
                 message="No Interactions Detected"
                 description="The medications you entered do not have known harmful interactions. However, always consult with a healthcare professional for medical advice."
                 type="success"
                 showIcon
                 style={{ marginTop: 8 }}
               />
             )}
           </div>
         )}
       </Modal>
     </div>
   );
 };

export default Chatbot; 
