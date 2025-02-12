import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Select, MenuItem, TextField, IconButton, Collapse, Box, Button
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, Delete, Add } from "@mui/icons-material";

const paymentTypes = ["Payment", "Vendor Payment"];
const paymentModes = ["Cash", "Cheque", "Bank Transfer"];

const ComplexTable = () => {
  const [rows, setRows] = useState([]);

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), paymentType: "", paymentMode: "", amount: "", detailsOpen: false }]);
  };

  const handleRemoveRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const toggleDetails = (id) => {
    setRows(rows.map(row => row.id === id ? { ...row, detailsOpen: !row.detailsOpen } : row));
  };

  return (
    <TableContainer component={Paper}>
      <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddRow} sx={{ m: 2 }}>
        Add Payment
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Payment Type</TableCell>
            <TableCell>Payment Mode</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow>
                <TableCell>
                  <IconButton size="small" onClick={() => toggleDetails(row.id)}>
                    {row.detailsOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Select value={row.paymentType} onChange={(e) => handleChange(row.id, "paymentType", e.target.value)} fullWidth>
                    {paymentTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select value={row.paymentMode} onChange={(e) => handleChange(row.id, "paymentMode", e.target.value)} fullWidth>
                    {paymentModes.map((mode) => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField type="number" value={row.amount} onChange={(e) => handleChange(row.id, "amount", e.target.value)} fullWidth />
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleRemoveRow(row.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                  <Collapse in={row.detailsOpen} timeout="auto" unmountOnExit>
                    <Box margin={2}>
                      <h4>Payment Details</h4>
                      <TextField label="Reference Number" fullWidth sx={{ mb: 2 }} />
                      <TextField label="Notes" multiline rows={3} fullWidth sx={{ mb: 2 }} />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComplexTable;
