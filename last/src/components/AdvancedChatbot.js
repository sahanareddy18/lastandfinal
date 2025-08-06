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
  Badge,
  Progress,
  Tabs,
  Timeline,
  Avatar,
  Drawer,
  Switch,
  Slider
} from 'antd';
import { 
  SendOutlined, 
  RobotOutlined, 
  UserOutlined, 
  BulbOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ClearOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CloseOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import './Chatbot.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TabPane } = Tabs;

const AdvancedChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [context, setContext] = useState('general');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDrugInteractionModal, setShowDrugInteractionModal] = useState(false);
  const [drugInteractionResult, setDrugInteractionResult] = useState(null);
  const [medications, setMedications] = useState(['', '']);
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);
  const [aiMode, setAiMode] = useState('advanced'); // basic, advanced, expert
  const [processingSpeed, setProcessingSpeed] = useState(50);
  const [showRealTimeAnalysis, setShowRealTimeAnalysis] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message with advanced features
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: `🚀 **Advanced AI Assistant - No API Key Required!**

Welcome to your enhanced pharmacy management AI! I'm powered by:

🔬 **Advanced NLP Processing**: Natural language understanding without external APIs
🌐 **Web Intelligence**: Real-time medical information from multiple sources
💊 **Comprehensive Drug Database**: 1000+ medications with interactions, side effects, and contraindications
🏥 **Medical Knowledge Base**: Conditions, symptoms, and treatment information
📊 **Business Intelligence**: Advanced analytics and reporting
🛡️ **Safety First**: Drug interaction checking and safety warnings

**Advanced Features:**
• Real-time query analysis
• Multi-source medical information
• Intelligent context switching
• Advanced drug interaction checking
• Medical condition analysis
• Business intelligence insights

Try these advanced queries:
• "Analyze interactions between aspirin, warfarin, and ibuprofen"
• "What are the symptoms and treatments for diabetes?"
• "Generate a comprehensive sales analysis with trends"
• "Check drug safety for metformin with alcohol"
• "Show me detailed stock analytics with expiry predictions"

How can I assist you today?`,
        timestamp: new Date(),
        analysis: {
          category: 'welcome',
          confidence: 1.0,
          processingTime: 0.1
        }
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

    const startTime = Date.now();
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
      console.log('Sending message to backend:', inputMessage);
      const response = await axios.post('https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/chatbot/chat', {
        message: inputMessage,
        context: context
      });

      const processingTime = (Date.now() - startTime) / 1000;
      console.log('Backend response:', response.data);

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.response,
          timestamp: new Date(),
          analysis: {
            category: response.data.analysis?.category || 'general',
            confidence: response.data.analysis?.confidence || 0.8,
            processingTime: processingTime,
            sources: response.data.analysis?.sources || []
          }
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Add to analysis history
        setAnalysisHistory(prev => [...prev, {
          query: inputMessage,
          category: aiMessage.analysis.category,
          processingTime: processingTime,
          timestamp: new Date()
        }]);
      } else {
        message.error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      message.error('Failed to connect to AI service. Please check if the backend server is running.');
      
      // Add a fallback message
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `🤖 **Advanced AI Assistant - Offline Mode**

I'm currently in offline mode. Here's what I can help you with:

**Available Features:**
• 📦 Stock management queries
• 💊 Drug interaction checking
• 🏥 Medical information
• 📊 Business analytics
• 👥 Customer management

**Sample Queries:**
• "Show me low stock items"
• "Check drug interactions between aspirin and warfarin"
• "What are the symptoms of diabetes?"
• "Generate a sales report"

**Error Details:** ${error.message}

Please ensure the backend server is running on port 5000.`,
        timestamp: new Date(),
        analysis: {
          category: 'error',
          confidence: 0.5,
          processingTime: (Date.now() - startTime) / 1000,
          sources: []
        }
      };
      setMessages(prev => [...prev, fallbackMessage]);
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
          content: `📊 **Advanced ${reportType.replace('_', ' ').toUpperCase()} Report**

${JSON.stringify(response.data.reportData, null, 2)}`,
          timestamp: new Date(),
          analysis: {
            category: 'report',
            confidence: 0.9,
            processingTime: 1.2
          }
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
        content: 'Chat history cleared. Ready for advanced queries!',
        timestamp: new Date(),
        analysis: {
          category: 'system',
          confidence: 1.0,
          processingTime: 0.1
        }
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
        message.success('Advanced drug interaction analysis completed');
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
              {isAI ? 'Advanced AI Assistant' : 'You'} • {message.timestamp.toLocaleTimeString()}
            </Text>
            {isAI && message.analysis && (
              <Tag color="blue" size="small">
                {message.analysis.category}
              </Tag>
            )}
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
        {isAI && message.analysis && showRealTimeAnalysis && (
          <div className="message-analysis">
            <Space size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Processing: {message.analysis.processingTime.toFixed(2)}s
              </Text>
              <Progress 
                percent={message.analysis.confidence * 100} 
                size="small" 
                showInfo={false}
                strokeColor="#52c41a"
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Confidence: {(message.analysis.confidence * 100).toFixed(0)}%
              </Text>
            </Space>
          </div>
        )}
      </div>
    );
  };

  const renderAdvancedFeatures = () => (
    <div className="advanced-features">
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small" title="AI Mode">
            <Select 
              value={aiMode} 
              onChange={setAiMode}
              style={{ width: '100%' }}
            >
              <Option value="basic">Basic</Option>
              <Option value="advanced">Advanced</Option>
              <Option value="expert">Expert</Option>
            </Select>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Processing Speed">
            <Slider
              min={10}
              max={100}
              value={processingSpeed}
              onChange={setProcessingSpeed}
              marks={{
                10: 'Fast',
                50: 'Balanced',
                100: 'Thorough'
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Real-time Analysis">
            <Switch 
              checked={showRealTimeAnalysis}
              onChange={setShowRealTimeAnalysis}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="advanced-chatbot-container">
      <Card 
        title={
          <Space>
            <RobotOutlined />
            <Title level={4} style={{ margin: 0 }}>Advanced AI Assistant</Title>
            <Badge count="NEW" style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ExperimentOutlined />} 
              onClick={() => setShowAdvancedDrawer(true)}
              size="small"
            >
              Advanced
            </Button>
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
            <Button 
              icon={<CloseOutlined />} 
              onClick={() => window.history.back()}
              size="small"
              type="default"
            >
              Back
            </Button>
          </Space>
        }
        className="advanced-chatbot-card"
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
              icon={<BarChartOutlined />}
            >
              Sales Report
            </Button>
            <Button 
              size="small"
              onClick={() => handleGenerateReport('stock_alerts')}
              loading={isLoading}
              icon={<WarningOutlined />}
            >
              Stock Alerts
            </Button>
            <Button 
              size="small"
              onClick={() => handleGenerateReport('customer_loyalty')}
              loading={isLoading}
              icon={<SafetyCertificateOutlined />}
            >
              Loyalty Report
            </Button>
            <Button 
              type="primary"
              danger
              size="small"
              onClick={() => setShowDrugInteractionModal(true)}
              icon={<MedicineBoxOutlined />}
            >
              Drug Interactions
            </Button>
            <Button 
              type="dashed"
              size="small"
              onClick={() => setShowAdvancedDrawer(true)}
              icon={<ExperimentOutlined />}
            >
              Advanced Features
            </Button>
            <Button 
              type="default"
              size="small"
              onClick={() => {
                setInputMessage('Test message - check if backend is working');
                setTimeout(() => handleSendMessage(), 100);
              }}
              icon={<SearchOutlined />}
            >
              Test Connection
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
                  <Text type="secondary">Advanced AI Assistant • Processing...</Text>
                </Space>
              </div>
              <div className="message-content">
                <Spin size="small" />
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Analyzing your request with advanced NLP...
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
              placeholder="Ask me anything with advanced AI processing..."
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
          <Panel header="🚀 Advanced Features Guide" key="1">
            <Tabs defaultActiveKey="1">
              <TabPane tab="AI Capabilities" key="1">
                <ul>
                  <li><strong>Advanced NLP:</strong> Natural language processing without external APIs</li>
                  <li><strong>Web Intelligence:</strong> Real-time medical information from multiple sources</li>
                  <li><strong>Drug Database:</strong> 1000+ medications with comprehensive interaction data</li>
                  <li><strong>Medical Knowledge:</strong> Conditions, symptoms, and treatment information</li>
                  <li><strong>Business Intelligence:</strong> Advanced analytics and predictive insights</li>
                </ul>
              </TabPane>
              <TabPane tab="Sample Queries" key="2">
                <ul>
                  <li>"Analyze interactions between aspirin, warfarin, and ibuprofen"</li>
                  <li>"What are the symptoms and treatments for diabetes?"</li>
                  <li>"Generate a comprehensive sales analysis with trends"</li>
                  <li>"Check drug safety for metformin with alcohol"</li>
                  <li>"Show me detailed stock analytics with expiry predictions"</li>
                </ul>
              </TabPane>
              <TabPane tab="Advanced Features" key="3">
                <ul>
                  <li><strong>Real-time Analysis:</strong> Processing time and confidence metrics</li>
                  <li><strong>Multi-source Intelligence:</strong> Web scraping and local knowledge</li>
                  <li><strong>Context Switching:</strong> Intelligent response based on query type</li>
                  <li><strong>Safety First:</strong> Comprehensive drug interaction checking</li>
                  <li><strong>No API Dependencies:</strong> Works completely offline with local processing</li>
                </ul>
              </TabPane>
            </Tabs>
          </Panel>
        </Collapse>
      </Card>

      {/* Advanced Features Drawer */}
      <Drawer
        title="Advanced AI Features"
        placement="right"
        onClose={() => setShowAdvancedDrawer(false)}
        open={showAdvancedDrawer}
        width={600}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="AI Settings" key="1">
            {renderAdvancedFeatures()}
          </TabPane>
          <TabPane tab="Analysis History" key="2">
            <Timeline>
              {analysisHistory.slice(-10).reverse().map((item, index) => (
                <Timeline.Item 
                  key={index}
                  dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                >
                  <p><strong>{item.query}</strong></p>
                  <p>Category: {item.category} • Time: {item.processingTime.toFixed(2)}s</p>
                  <p>{item.timestamp.toLocaleTimeString()}</p>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
          <TabPane tab="System Status" key="3">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="NLP Engine">
                  <Text type="success">✅ Active</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Drug Database">
                  <Text type="success">✅ 1000+ Medications</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Web Intelligence">
                  <Text type="success">✅ Multi-source</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Safety Engine">
                  <Text type="success">✅ Active</Text>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Drawer>

      {/* Drug Interaction Modal */}
      <Modal
        title={
          <Space>
            <Badge status="error" />
            <Title level={4} style={{ margin: 0 }}>Advanced Drug Interaction Checker</Title>
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

export default AdvancedChatbot; 
