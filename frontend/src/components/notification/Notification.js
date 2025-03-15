import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import "./Notification.scss";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/features/auth/authSlice";
import { getExpiringProducts } from "../../redux/features/product/productService";
import { toast } from "react-toastify";
import ExpiringProductModal from "./ExpiringProductModal";

const Notification = () => {
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    const fetchExpiringProducts = async () => {
      if (isLoggedIn) {
        try {
          setIsLoading(true);
          const products = await getExpiringProducts();
          // Sort products by expiry date (ascending)
          const sortedProducts = products.sort(
            (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
          );
          setExpiringProducts(sortedProducts);
        } catch (error) {
          toast.error("Could not fetch expiring products");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExpiringProducts();
    // Check every day for new expiring products
    const interval = setInterval(fetchExpiringProducts, 86400000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setIsOpen(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Get the first expiring product (if any)
  const firstExpiringProduct =
    expiringProducts.length > 0 ? expiringProducts[0] : null;

  return (
    <div className="notification">
      <div
        className="notification-icon"
        onClick={toggleDropdown}
      >
        <FaBell />
        {!isLoading && expiringProducts.length > 0 && (
          <span className="notification-badge">{expiringProducts.length}</span>
        )}
      </div>
      {isOpen && expiringProducts.length > 0 && (
        <div className="notification-dropdown">
          <h4>Products Expiring Soon</h4>
          {expiringProducts.map((product) => (
            <div
              key={product._id}
              className="notification-item"
              onClick={() => handleProductClick(product)}
            >
              <p>{product.name}</p>
              <p>
                Expires: {new Date(product.expiryDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {showModal && firstExpiringProduct && (
        <ExpiringProductModal
          product={selectedProduct || firstExpiringProduct}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Notification;
