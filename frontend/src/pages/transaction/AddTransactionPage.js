import React from "react";
import Layout from "../../components/layout/Layout";
import TransactionForm from "../../components/transaction/TransactionForm";
import "../../components/transaction/Transaction.scss";

const AddTransactionPage = () => {
  return (
    <Layout>
      <div className="add-transaction-page">
        <TransactionForm />
      </div>
    </Layout>
  );
};

export default AddTransactionPage;
