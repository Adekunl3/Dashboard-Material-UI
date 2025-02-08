import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Grid,
  Container,
  Typography,
} from "@mui/material";
import axios from "axios";

// Redux slice for payments
const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    paymentTypes: [],
    banks: [],
    vendors: [],
    currencies: [],
    budgets: [],
  },
  reducers: {
    setPaymentTypes: (state, action) => {
      state.paymentTypes = action.payload;
    },
    setBanks: (state, action) => {
      state.banks = action.payload;
    },
    setVendors: (state, action) => {
      state.vendors = action.payload;
    },
    setCurrencies: (state, action) => {
      state.currencies = action.payload;
    },
    setBudgets: (state, action) => {
      state.budgets = action.payload;
    },
  },
});

const {
  setPaymentTypes,
  setBanks,
  setVendors,
  setCurrencies,
  setBudgets,
} = paymentSlice.actions;

const store = configureStore({
  reducer: {
    payment: paymentSlice.reducer,
  },
});

const fetchDropdownData = async (dispatch) => {
  try {
    const responses = await Promise.all([
      axios.get("/api/payment-types"),
      axios.get("/api/banks"),
      axios.get("/api/vendors"),
      axios.get("/api/currencies"),
      axios.get("/api/budgets"),
    ]);

    dispatch(setPaymentTypes(responses[0].data));
    dispatch(setBanks(responses[1].data));
    dispatch(setVendors(responses[2].data));
    dispatch(setCurrencies(responses[3].data));
    dispatch(setBudgets(responses[4].data));
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
  }
};

const PaymentForm = () => {
  const dispatch = useDispatch();
  const { paymentTypes, banks, vendors, currencies, budgets } = useSelector(
    (state) => state.payment
  );

  const { handleSubmit, control, setValue } = useForm();

  useEffect(() => {
    fetchDropdownData(dispatch);
  }, [dispatch]);

  const onSubmit = (data) => {
    console.log("Form Submitted", data);
    // Perform API call to submit the form
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Payment Form
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Type</InputLabel>
              <Controller
                name="paymentTypeId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Payment Type">
                    {paymentTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Bank</InputLabel>
              <Controller
                name="bankId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Bank">
                    {banks.map((bank) => (
                      <MenuItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Vendor</InputLabel>
              <Controller
                name="vendorId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Vendor">
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Controller
                name="currencyId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Currency">
                    {currencies.map((currency) => (
                      <MenuItem key={currency.id} value={currency.id}>
                        {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Budget</InputLabel>
              <Controller
                name="budgetId"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Budget">
                    {budgets.map((budget) => (
                      <MenuItem key={budget.id} value={budget.id}>
                        {budget.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Amount" type="number" />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Payment Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Notes" multiline rows={3} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit Payment
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

const App = () => (
  <Provider store={store}>
    <PaymentForm />
  </Provider>
);

export default App;
