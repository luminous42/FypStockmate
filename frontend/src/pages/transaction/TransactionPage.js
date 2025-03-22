import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import TransactionList from "../../components/transaction/TransactionList";
import TransactionStats from "../../components/transaction/TransactionStats";
import { FaPlus } from "react-icons/fa";
import "../../components/transaction/Transaction.scss";

const TransactionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("list");

  const goToAddTransaction = () => {
    navigate("/add-transaction");
  };

  return (
    <Layout>
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
            onClick={goToAddTransaction}
          >
            <FaPlus /> New Transaction
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "list" ? <TransactionList /> : <TransactionStats />}
        </div>
      </div>
    </Layout>
  );
};

export default TransactionPage;
