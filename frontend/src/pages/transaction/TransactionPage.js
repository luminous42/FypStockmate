import React, { useState } from "react";
import { Link } from "react-router-dom";
import TransactionList from "../../components/transaction/TransactionList";
import TransactionStats from "../../components/transaction/TransactionStats";
import { FaPlus } from "react-icons/fa";
import "../../components/transaction/Transaction.scss";

const TransactionPage = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="transaction-page">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Transactions
        </button>
        <button
          className={`tab ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          Statistics
        </button>
        <button
          className="add-button"
          onClick={() => {
            const baseUrl = window.location.origin;
            window.location.href = `${baseUrl}/add-transaction`;
          }}
        >
          <FaPlus /> New Transaction
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "list" ? <TransactionList /> : <TransactionStats />}
      </div>
    </div>
  );
};

export default TransactionPage;
