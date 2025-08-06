import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Card, Row, Col, Typography, Tag, Space, Statistic, 
  Table, Collapse, Badge, Tooltip, message, Modal, List 
} from "antd";
import { 
  InboxOutlined, MedicineBoxOutlined, 
  ExclamationCircleOutlined, WarningOutlined 
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./RackManagement.css";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const RackManagement = () => {
  const [rackGroups, setRackGroups] = useState({});
  const [locations, setLocations] = useState([]);
  const [totalRacks, setTotalRacks] = useState(0);
  const [totalShelves, setTotalShelves] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // New state for modal functionality
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);
  const [modalType, setModalType] = useState('');

  // Fetch rack management data
  const fetchRackData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/stocks/rack-management");
      const { data } = response.data;
      
      setRackGroups(data.rackGroups);
      setLocations(data.locations);
      setTotalRacks(data.totalRacks);
      setTotalShelves(data.totalShelves);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error("Error fetching rack data:", error);
      message.error("Failed to fetch rack management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRackData();
  }, []);

  // Calculate statistics for each rack
  const getRackStats = (items) => {
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const lowStockItems = items.filter(item => (item.quantity || 0) <= 10).length;
    const nearExpiryItems = items.filter(item => {
      const expiryDate = dayjs(item.expiryDate);
      const today = dayjs();
      return expiryDate.diff(today, 'day') <= 30 && expiryDate.diff(today, 'day') > 0;
    }).length;
    const expiredItems = items.filter(item => {
      const expiryDate = dayjs(item.expiryDate);
      const today = dayjs();
      return expiryDate.diff(today, 'day') <= 0;
    }).length;

    return {
      totalQuantity,
      lowStockItems,
      nearExpiryItems,
      expiredItems
    };
  };

  // Handle badge clicks
  const handleBadgeClick = (type, items, rackNumber, shelfNumber = null) => {
    let filteredItems = [];
    let title = '';
    
    switch (type) {
      case 'lowStock':
        filteredItems = items.filter(item => (item.quantity || 0) <= 10);
        title = `Low Stock Items ${shelfNumber ? `- ${shelfNumber}` : `- ${rackNumber}`}`;
        break;
      case 'nearExpiry':
        filteredItems = items.filter(item => {
          const expiryDate = dayjs(item.expiryDate);
          const today = dayjs();
          return expiryDate.diff(today, 'day') <= 30 && expiryDate.diff(today, 'day') > 0;
        });
        title = `Near Expiry Items ${shelfNumber ? `- ${shelfNumber}` : `- ${rackNumber}`}`;
        break;
      case 'expired':
        filteredItems = items.filter(item => {
          const expiryDate = dayjs(item.expiryDate);
          const today = dayjs();
          return expiryDate.diff(today, 'day') <= 0;
        });
        title = `Expired Items ${shelfNumber ? `- ${shelfNumber}` : `- ${rackNumber}`}`;
        break;
      default:
        return;
    }
    
    if (filteredItems.length > 0) {
      setModalItems(filteredItems);
      setModalTitle(title);
      setModalType(type);
      setModalVisible(true);
    } else {
      message.info(`No ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} items found`);
    }
  };

  // Table columns for items in each rack
  const itemColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Generic Name',
      dataIndex: 'genericName',
      key: 'genericName',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        let color = 'green';
        if (quantity <= 0) color = 'red';
        else if (quantity <= 10) color = 'orange';
        
        return (
          <Badge 
            count={quantity} 
            style={{ backgroundColor: color }}
            showZero
          />
        );
      }
    },
    {
      title: 'Packing',
      dataIndex: 'packing',
      key: 'packing',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Batch ID',
      dataIndex: 'batchId',
      key: 'batchId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => {
        const expiryDate = dayjs(date);
        const today = dayjs();
        const daysUntilExpiry = expiryDate.diff(today, 'day');
        
        let color = 'green';
        let icon = null;
        
        if (daysUntilExpiry <= 0) {
          color = 'red';
          icon = <ExclamationCircleOutlined />;
        } else if (daysUntilExpiry <= 30) {
          color = 'orange';
          icon = <WarningOutlined />;
        }
        
        return (
          <Space>
            {icon}
            <Text style={{ color }}>
              {expiryDate.format('DD/MM/YYYY')}
            </Text>
          </Space>
        );
      }
    }
  ];

  // Modal content renderer
  const renderModalContent = () => {
    return (
      <List
        dataSource={modalItems}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{item.productName}</Text>
                  <Tag color="blue">{item.category}</Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text>Generic: {item.genericName}</Text>
                  <Text>Quantity: <Badge count={item.quantity} style={{ backgroundColor: item.quantity <= 10 ? 'red' : 'green' }} /></Text>
                  <Text>Batch: {item.batchId}</Text>
                  <Text>Expiry: {dayjs(item.expiryDate).format('DD/MM/YYYY')}</Text>
                  <Text>Packing: {item.packing}</Text>
                  <Text>
                    MRP: ₹{item.mrp}
                    {item.discount > 0 && (
                      <span style={{ marginLeft: '8px' }}>
                        <Tag color="red">Discounted: ₹{item.discountedPrice}</Tag>
                        <Tag color="orange">{item.discount}% OFF</Tag>
                      </span>
                    )}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="rack-management-container">
      <div className="header-section">
        <Title level={2} className="page-title">
          <InboxOutlined /> Rack Management
        </Title>
        <Text type="secondary">
          Organize and track medicines by rack location
        </Text>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} className="summary-section">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Racks"
              value={totalRacks}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Shelves"
              value={totalShelves}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={totalItems}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Items/Shelf"
              value={totalShelves > 0 ? Math.round(totalItems / totalShelves) : 0}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Rack Details */}
      <div className="rack-details-section">
        <Title level={3}>Rack Details</Title>
        
        {locations.length === 0 ? (
          <Card>
            <div className="empty-state">
              <InboxOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <Text type="secondary">No rack data available</Text>
            </div>
          </Card>
        ) : (
          <Collapse 
            defaultActiveKey={Object.keys(rackGroups).slice(0, 3)} 
            className="rack-collapse"
          >
            {Object.keys(rackGroups).map((rackNumber) => {
              const shelves = rackGroups[rackNumber] || [];
              const allItems = shelves.reduce((acc, shelf) => [...acc, ...shelf.items], []);
              const stats = getRackStats(allItems);
              
              return (
                <Panel
                  key={rackNumber}
                  header={
                    <div className="rack-header">
                      <Space>
                        <Text strong>{rackNumber}</Text>
                        <Badge count={shelves.length} showZero />
                        <Text type="secondary">
                          ({stats.totalQuantity} total items, {shelves.length} shelves)
                        </Text>
                      </Space>
                      <Space>
                        {stats.lowStockItems > 0 && (
                          <Tooltip title="Low stock items">
                            <Badge 
                              count={stats.lowStockItems} 
                              style={{ backgroundColor: '#fa8c16', cursor: 'pointer' }}
                              onClick={() => handleBadgeClick('lowStock', allItems, rackNumber)}
                            />
                          </Tooltip>
                        )}
                        {stats.nearExpiryItems > 0 && (
                          <Tooltip title="Near expiry items">
                            <Badge 
                              count={stats.nearExpiryItems} 
                              style={{ backgroundColor: '#faad14', cursor: 'pointer' }}
                              onClick={() => handleBadgeClick('nearExpiry', allItems, rackNumber)}
                            />
                          </Tooltip>
                        )}
                        {stats.expiredItems > 0 && (
                          <Tooltip title="Expired items">
                            <Badge 
                              count={stats.expiredItems} 
                              style={{ backgroundColor: '#ff4d4f', cursor: 'pointer' }}
                              onClick={() => handleBadgeClick('expired', allItems, rackNumber)}
                            />
                          </Tooltip>
                        )}
                      </Space>
                    </div>
                  }
                >
                  {shelves.map((shelf, shelfIndex) => {
                    const shelfStats = getRackStats(shelf.items);
                    return (
                      <div key={shelfIndex} className="shelf-section">
                        <div className="shelf-header">
                          <Text strong style={{ color: '#1890ff' }}>
                            {shelf.shelfNumber}
                          </Text>
                          <Space>
                            <Badge count={shelf.items.length} showZero />
                            <Text type="secondary">
                              ({shelfStats.totalQuantity} items)
                            </Text>
                          </Space>
                        </div>
                        <Table
                          columns={itemColumns}
                          dataSource={shelf.items}
                          rowKey="_id"
                          pagination={false}
                          size="small"
                          loading={loading}
                          className="shelf-table"
                        />
                      </div>
                    );
                  })}
                </Panel>
              );
            })}
          </Collapse>
        )}
      </div>

      {/* Modal for displaying badge details */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default RackManagement; 
