import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createTransaction,
  RESET_TRANSACTION_STATE,
} from "../../redux/features/transaction/transactionSlice";
import { getProducts } from "../../redux/features/product/productSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";

const initialState = {
  products: [],
  customer: {
    name: "",
    email: "",
    phone: "",
  },
  totalAmount: 0,
  paymentMethod: "Cash",
  paymentStatus: "Paid",
  notes: "",
};

const TransactionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, isLoading: productLoading } = useSelector(
    (state) => state.product
  );
  const { isLoading, isSuccess, isError } = useSelector(
    (state) => state.transaction
  );

  const [transaction, setTransaction] = useState(initialState);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Load products on component mount
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // Filter products based on search
  useEffect(() => {
    if (products.length > 0 && productSearch) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.category.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  // Reset form after successful transaction
  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction created successfully");
      setTransaction(initialState);
      setSelectedProducts([]);
      dispatch(RESET_TRANSACTION_STATE());
      navigate("/transactions");
    }
  }, [isSuccess, dispatch, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested customer object
    if (name.includes("customer.")) {
      const customerField = name.split(".")[1];
      setTransaction({
        ...transaction,
        customer: {
          ...transaction.customer,
          [customerField]: value,
        },
      });
    } else {
      setTransaction({
        ...transaction,
        [name]: value,
      });
    }
  };

  // Add product to transaction
  const addProduct = (product) => {
    // Check if product is already in the list
    const existingProduct = selectedProducts.find(
      (item) => item.product === product._id
    );

    if (existingProduct) {
      // Update quantity if product already exists
      const updatedProducts = selectedProducts.map((item) =>
        item.product === product._id
          ? {
              ...item,
              quantity: parseInt(item.quantity) + 1,
              totalPrice:
                (parseInt(item.quantity) + 1) * parseFloat(item.price),
            }
          : item
      );
      setSelectedProducts(updatedProducts);
    } else {
      // Add new product
      const newProduct = {
        product: product._id,
        name: product.name,
        quantity: 1,
        price: parseFloat(product.price),
        totalPrice: parseFloat(product.price),
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }

    // Clear search
    setProductSearch("");
    setFilteredProducts([]);
  };

  // Remove product from transaction
  const removeProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(
      (item) => item.product !== productId
    );
    setSelectedProducts(updatedProducts);
  };

  // Update product quantity
  const updateProductQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    const updatedProducts = selectedProducts.map((item) =>
      item.product === productId
        ? {
            ...item,
            quantity: parseInt(quantity),
            totalPrice: parseInt(quantity) * parseFloat(item.price),
          }
        : item
    );
    setSelectedProducts(updatedProducts);
  };

  // Calculate total amount
  const calculateTotal = () => {
    return selectedProducts
      .reduce((total, item) => total + item.totalPrice, 0)
      .toFixed(2);
  };

  // Submit transaction
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      return toast.error("Please add at least one product");
    }

    if (!transaction.customer.name) {
      return toast.error("Please enter customer name");
    }

    const formData = {
      ...transaction,
      products: selectedProducts,
      totalAmount: parseFloat(calculateTotal()),
    };

    dispatch(createTransaction(formData));
  };

  // Cancel transaction and return to transactions page
  const handleCancel = () => {
    navigate("/transactions");
  };

  return (
    <div className="transaction-form">
      <h3>Create New Sale</h3>

      {isLoading || productLoading ? (
        <SpinnerImg />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="transaction-form-container">
            <div className="product-selection">
              <h4>Select Products</h4>
              <div className="search-products">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                {filteredProducts.length > 0 && (
                  <div className="search-results">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="search-item"
                        onClick={() => addProduct(product)}
                      >
                        <p>{product.name}</p>
                        <p>${product.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="selected-products">
                <h4>Selected Products</h4>
                {selectedProducts.length === 0 ? (
                  <p>No products selected</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((item) => (
                        <tr key={item.product}>
                          <td>{item.name}</td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateProductQuantity(
                                  item.product,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>${item.totalPrice.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="--btn --btn-danger"
                              onClick={() => removeProduct(item.product)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan="3"
                          className="total-label"
                        >
                          Total Amount:
                        </td>
                        <td
                          colSpan="2"
                          className="total-amount"
                        >
                          ${calculateTotal()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>

            <div className="customer-details">
              <h4>Customer Information</h4>
              <div className="form-group">
                <label>Customer Name*:</label>
                <input
                  type="text"
                  name="customer.name"
                  value={transaction.customer.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="customer.email"
                  value={transaction.customer.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="text"
                  name="customer.phone"
                  value={transaction.customer.phone}
                  onChange={handleInputChange}
                />
              </div>

              <h4>Payment Information</h4>
              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  name="paymentMethod"
                  value={transaction.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Status:</label>
                <select
                  name="paymentStatus"
                  value={transaction.paymentStatus}
                  onChange={handleInputChange}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={transaction.notes}
                  onChange={handleInputChange}
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="--btn --btn-primary"
            >
              {isLoading ? "Processing..." : "Complete Sale"}
            </button>
            <button
              type="button"
              className="--btn --btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TransactionForm;
