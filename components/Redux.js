import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { paymentReducer } from "./reducers/paymentReducer";

const rootReducer = combineReducers({
  payment: paymentReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));

const initialState = {
    transactions: [],
    loading: false,
    error: null,
  };
  
  export const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
      case "PAYMENT_REQUEST":
        return { ...state, loading: true };
      case "PAYMENT_SUCCESS":
        return { ...state, loading: false, transactions: action.payload };
      case "PAYMENT_FAIL":
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  import axios from "axios";

const API_URL = "https://payment-api.onrender.com/api/pay/transactions";

export const fetchTransactions = () => async (dispatch) => {
  dispatch({ type: "PAYMENT_REQUEST" });

  try {
    const res = await axios.get(API_URL);
    dispatch({ type: "PAYMENT_SUCCESS", payload: res.data });
  } catch (error) {
    dispatch({ type: "PAYMENT_FAIL", payload: error.message });
  }
};

//
import { Provider } from "react-redux";
import { store } from "../store";

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

//transaction table.js
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTransactions } from "../store/actions/paymentActions";

export default function TransactionTable() {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
