import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { getTransactions } from "../../redux/features/transaction/transactionSlice";
import { SpinnerImg } from "../loader/Loader";
import "./Transaction.scss";
import DateRangePicker from "react-daterange-picker";
import "react-daterange-picker/dist/css/react-calendar.css";
import moment from "moment";

const TransactionList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transactions, isLoading } = useSelector((state) => state.transaction);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  // Handle date range selection
  const handleDateRangeSelect = (range) => {
    setDateRange({
      startDate: range.start.toDate(),
      endDate: range.end.toDate(),
    });
    setIsDatePickerOpen(false);
  };

  // Navigate to add transaction page
  const goToAddTransaction = () => {
    navigate("/add-transaction");
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
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              {moment(dateRange.startDate).format("MMM D, YYYY")} -{" "}
              {moment(dateRange.endDate).format("MMM D, YYYY")}
            </button>

            {isDatePickerOpen && (
              <div className="date-picker-container">
                <DateRangePicker
                  value={{
                    start: moment(dateRange.startDate),
                    end: moment(dateRange.endDate),
                  }}
                  onSelect={handleDateRangeSelect}
                  singleDateRange={true}
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={goToAddTransaction}
          className="--btn --btn-primary"
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
