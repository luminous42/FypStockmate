import React from "react";
import Layout from "../../components/layout/Layout";
import TransactionDetail from "../../components/transaction/TransactionDetail";
import "../../components/transaction/Transaction.scss";

const TransactionDetailPage = () => {
  return (
    <Layout>
      <div className="transaction-detail-page">
        <TransactionDetail />
      </div>
    </Layout>
  );
};

export default TransactionDetailPage;
