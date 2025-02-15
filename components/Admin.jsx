import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get("https://payment-api.onrender.com/api/pay/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Payment Transactions</h1>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2">ID</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Payment Link</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td className="p-2">{tx.id}</td>
              <td className="p-2">₦{tx.amount}</td>
              <td className="p-2">{tx.status}</td>
              <td className="p-2">
                <a href={tx.paymentUrl} target="_blank" className="text-blue-500">Pay</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [amount, setAmount] = useState("");

  const handlePayment = async () => {
    const res = await axios.post("/api/pay", { amount });
    window.location.href = res.data.paymentUrl;
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">Pay with Paystack</h1>
      <input
        type="number"
        placeholder="Enter amount"
        className="border p-2 mb-4"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handlePayment}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Pay Now
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { fetchTransactions } from "../services/paymentService";

export default function TransactionTable() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch(() => alert("Failed to load transactions"));
  }, []);

  return (
    <div className="p-10">
      <h2 className="text-xl font-bold mb-4">Payment Transactions</h2>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2">ID</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Payment Link</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td className="p-2">{tx.id}</td>
              <td className="p-2">₦{tx.amount}</td>
              <td className="p-2">{tx.status}</td>
              <td className="p-2">
                <a href={tx.paymentUrl} target="_blank" className="text-blue-500">
                  Pay
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


import { useState } from "react";
import { initiatePayment } from "../services/paymentService";

export default function PaymentForm() {
  const [amount, setAmount] = useState("");

  const handlePayment = async () => {
    if (!amount) return alert("Enter amount");
    try {
      const paymentUrl = await initiatePayment(amount);
      window.location.href = paymentUrl; // Redirect to Paystack
    } catch (error) {
      alert("Payment failed!");
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">Pay with Paystack</h1>
      <input
        type="number"
        placeholder="Enter amount"
        className="border p-2 mb-4"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={handlePayment}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Pay Now
      </button>
    </div>
  );
}
