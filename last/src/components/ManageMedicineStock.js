import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Popconfirm, Input, DatePicker, InputNumber, message } from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined, 
  CloseOutlined,
  SearchOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import "./ManageMedicineStock.css";

const ManageProductStock = () => {
  const [products, setProducts] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchGenericName, setSearchGenericName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/stocks");
      setProducts(response.data.data || []);
    } catch (error) {
      setError("Error fetching stock data.");
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/stocks/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setEditedProduct({ ...product });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditedProduct({});
  };

  const handleSave = async () => {
    if (!editedProduct.genericName || !editedProduct.category) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await axios.put(`https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/stocks/${editId}`, editedProduct);
      setProducts((prev) => prev.map((prod) => (prod._id === editId ? editedProduct : prod)));
      setEditId(null);
      setEditedProduct({});
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleChange = (e) => {
    setEditedProduct({ ...editedProduct, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (name, value) => {
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleDateChange = (date, dateString) => {
    setEditedProduct({ ...editedProduct, expiryDate: dateString });
  };

  const updateDiscounts = async () => {
    try {
      setLoading(true);
      await axios.post("https://pharmacystockmanagmentandbillingsystemba.onrender.com/api/stocks/update-discounts");
      message.success("Discounts updated successfully!");
      fetchStock(); // Refresh the stock data
    } catch (error) {
      console.error("Error updating discounts:", error);
      message.error("Failed to update discounts");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const isOutOfStock = showOutOfStock && product.quantity === 0;
    const isExpired = showExpired && new Date(product.expiryDate) < new Date();
  
    return (
      (!showOutOfStock || isOutOfStock) &&
      (!showExpired || isExpired) &&
      (searchName ? (product.productName || "").toLowerCase().includes(searchName.toLowerCase()) : true) &&
      (searchGenericName ? (product.genericName || "").toLowerCase().includes(searchGenericName.toLowerCase()) : true) &&
      (searchSupplier ? (product.supplierName || "").toLowerCase().includes(searchSupplier.toLowerCase()) : true) &&
      (searchCategory ? (product.category || "").toLowerCase().includes(searchCategory.toLowerCase()) : true)
    );
  });
  
  return (
    <div className="manage-product-stock-container">
      <h2>Manage Stock</h2>
      <div className="search-bar">
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={updateDiscounts}
          loading={loading}
          style={{ marginRight: '10px' }}
        >
          Update Discounts
        </Button>
        <Input
          placeholder="Search by Product Name"
          prefix={<SearchOutlined />}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="search-input"
        />
        <Input
          placeholder="Search by Generic Name"
          prefix={<SearchOutlined />}
          value={searchGenericName}
          onChange={(e) => setSearchGenericName(e.target.value)}
          className="search-input"
        />
        <Input
          placeholder="Search by Category"
          prefix={<SearchOutlined />}
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="search-input"
        />
        <Input
          placeholder="Search by Supplier Name"
          prefix={<SearchOutlined />}
          value={searchSupplier}
          onChange={(e) => setSearchSupplier(e.target.value)}
          className="search-input"
        />
        <Button 
          type={showOutOfStock ? "primary" : "default"}
          onClick={() => setShowOutOfStock(!showOutOfStock)}
        >
          {showOutOfStock ? "Show All" : "Out of Stock"}
        </Button>
        <Button 
          type={showExpired ? "primary" : "default"}
          onClick={() => setShowExpired(!showExpired)}
        >
          {showExpired ? "Show All" : "Expired"}
        </Button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <div className="table-container">
        <table className="product-stock-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>Product Name</th>
              <th>Packing</th>
              <th>Rack Number</th>
              <th>Shelf Number</th>
              <th>Category</th>
              <th>Generic Name</th>
              <th>Batch ID</th>
              <th>Expiry Date</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>MRP</th>
              <th>Discounted Price</th>
              <th>Discount %</th>
              <th>Rates</th>
              <th>GST</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={product._id}>
                <td>{index + 1}</td>
                {editId === product._id ? (
                  <>
                    <td><Input name="productName" value={editedProduct.productName} onChange={handleChange} /></td>
                    <td><Input name="packing" value={editedProduct.packing} onChange={handleChange} /></td>
                    <td><Input name="rackNumber" value={editedProduct.rackNumber || "Rack-1"} onChange={handleChange} /></td>
                    <td><Input name="shelfNumber" value={editedProduct.shelfNumber || "Shelf-1"} onChange={handleChange} /></td>
                    <td><Input name="category" value={editedProduct.category || ""} onChange={handleChange} /></td>
                    <td><Input name="genericName" value={editedProduct.genericName || ""} onChange={handleChange} /></td>
                    <td><Input name="batchId" value={editedProduct.batchId} onChange={handleChange} /></td>
                    <td>
                      <DatePicker 
                        value={editedProduct.expiryDate ? dayjs(editedProduct.expiryDate) : null}
                        onChange={handleDateChange}
                      />
                    </td>
                    <td><Input name="supplierName" value={editedProduct.supplierName} onChange={handleChange} /></td>
                    <td>
                      <InputNumber 
                        min={0}
                        value={editedProduct.quantity}
                        onChange={(value) => handleNumberChange('quantity', value)}
                      />
                    </td>
                    <td>
                      <InputNumber 
                        min={0}
                        value={editedProduct.mrp}
                        onChange={(value) => handleNumberChange('mrp', value)}
                      />
                    </td>
                    <td>
                      <InputNumber 
                        min={0}
                        value={editedProduct.discountedPrice || editedProduct.mrp}
                        disabled
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </td>
                    <td>
                      <InputNumber 
                        min={0}
                        max={100}
                        value={editedProduct.discount || 0}
                        disabled
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </td>
                    <td>
                      <InputNumber 
                        min={0}
                        value={editedProduct.rate}
                        onChange={(value) => handleNumberChange('rate', value)}
                      />
                    </td>
                    <td><Input name="gst" value={editedProduct.gst || "N/A"} onChange={handleChange} /></td>
                    <td className="action-cell">
                      <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} />
                      <Button danger icon={<CloseOutlined />} onClick={handleCancelEdit} />
                    </td>
                  </>
                ) : (
                  <>
                    <td>{product.productName}</td>
                    <td>{product.packing}</td>
                    <td>{product.rackNumber || "Rack-1"}</td>
                    <td>{product.shelfNumber || "Shelf-1"}</td>
                    <td>{product.category || "N/A"}</td>
                    <td>{product.genericName || "N/A"}</td>
                    <td>{product.batchId}</td>
                    <td>{new Date(product.expiryDate).toLocaleDateString()}</td>
                    <td>{product.supplierName}</td>
                    <td>{product.quantity}</td>
                    <td>{product.mrp}</td>
                    <td>
                      {product.discountedPrice ? (
                        <span style={{ 
                          color: product.discount > 0 ? '#ff4d4f' : 'inherit',
                          fontWeight: product.discount > 0 ? 'bold' : 'normal'
                        }}>
                          ₹{product.discountedPrice}
                        </span>
                      ) : (
                        product.mrp
                      )}
                    </td>
                    <td>
                      {product.discount > 0 ? (
                        <span style={{ 
                          color: '#ff4d4f', 
                          fontWeight: 'bold',
                          backgroundColor: '#fff2f0',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {product.discount}%
                        </span>
                      ) : (
                        '0%'
                      )}
                    </td>
                    <td>{product.rate}</td>
                    <td>{product.gst || "N/A"}</td>
                    <td className="action-cell">
                      <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(product)} />
                      <Popconfirm 
                        title="Are you sure to delete this product?" 
                        onConfirm={() => handleDelete(product._id)} 
                        okText="Yes" 
                        cancelText="No"
                      >
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProductStock;
