import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

const paymentTypes = ["Payment", "Vendor Payment"];
const paymentModes = ["Cash", "Cheque", "Bank Transfer"];

export default function PaymentTable() {
  const { control, handleSubmit, reset } = useForm();
  const [rows, setRows] = useState([]);

  const addRow = (data) => {
    setRows([...rows, data]);
    reset();
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <>
      <form onSubmit={handleSubmit(addRow)} style={{ marginBottom: 20 }}>
        <FormControl style={{ marginRight: 10, minWidth: 150 }}>
          <InputLabel>Payment Type</InputLabel>
          <Controller
            name="paymentType"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select {...field}>
                {paymentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <FormControl style={{ marginRight: 10, minWidth: 150 }}>
          <InputLabel>Payment Mode</InputLabel>
          <Controller
            name="paymentMode"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select {...field}>
                {paymentModes.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {mode}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <Controller
          name="amount"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField {...field} label="Amount" type="number" style={{ marginRight: 10 }} />
          )}
        />

        <Button type="submit" variant="contained" color="primary">
          Add Payment
        </Button>
      </form>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment Type</TableCell>
              <TableCell>Payment Mode</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.paymentType}</TableCell>
                <TableCell>{row.paymentMode}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeRow(index)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
