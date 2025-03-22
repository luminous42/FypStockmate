import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { getTransactions } from "../../redux/features/transaction/transactionSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";
import moment from "moment";

const TransactionList = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading } = useSelector((state) => state.transaction);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(30, "days").toDate(),
    endDate: moment().toDate(),
  });

  // Load transactions on component mount
  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);

  // Filter transactions based on search term and date range
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = transactions.filter((transaction) => {
        // Filter by date range
        const transactionDate = new Date(transaction.transactionDate);
        const isInDateRange =
          transactionDate >= dateRange.startDate &&
          transactionDate <= dateRange.endDate;

        // Filter by search term
        const matchesSearch =
          transaction.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.paymentMethod
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.paymentStatus
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (transaction.customer.email &&
            transaction.customer.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (transaction.customer.phone &&
            transaction.customer.phone
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));

        return isInDateRange && (searchTerm === "" || matchesSearch);
      });

      setFilteredTransactions(filtered);
    }
  }, [transactions, searchTerm, dateRange]);

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: new Date(value),
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return "$" + parseFloat(amount).toFixed(2);
  };

  // Format date for input field
  const formatDateForInput = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <div className="transaction-list">
      <h3>Sales Transactions</h3>

      <div className="transaction-list-header">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by customer, payment method, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="date-filter">
            <button
              className="--btn --btn-secondary"
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
            >
              {moment(dateRange.startDate).format("MMM D, YYYY")} -{" "}
              {moment(dateRange.endDate).format("MMM D, YYYY")}
            </button>

            {isDateFilterOpen && (
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>From:</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formatDateForInput(dateRange.startDate)}
                    onChange={handleDateChange}
                  />
                </div>
                <div className="date-input-group">
                  <label>To:</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formatDateForInput(dateRange.endDate)}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="--btn --btn-primary"
          onClick={() => {
            const baseUrl = window.location.origin;
            window.location.href = `${baseUrl}/add-transaction`;
          }}
        >
          New Sale
        </button>
      </div>

      {isLoading ? (
        <SpinnerImg />
      ) : (
        <div className="transaction-table">
          {filteredTransactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>{transaction.customer.name}</td>
                    <td>{transaction.products.length}</td>
                    <td>{formatCurrency(transaction.totalAmount)}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>
                      <span
                        className={`status ${transaction.paymentStatus.toLowerCase()}`}
                      >
                        {transaction.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/transaction-detail/${transaction._id}`}
                        className="--btn --btn-primary --btn-sm"
                      >
                        <FaEye /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
