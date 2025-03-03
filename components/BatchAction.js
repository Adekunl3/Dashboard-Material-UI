import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { Button1} from "../common/Commoncomponent";
import { NestedMenuItem } from "mui-nested-menu";
import jsPDF from "jspdf";
import { download, generateCsv, mkConfig } from "export-to-csv";
import * as XLSX from 'xlsx';
// import './QuoteHeaderList.css'
import { API_BASE_URL, TOKEN } from "../../api/apiConfig";

const BatchActionButtonForPayment = ({ table, columns }) => {
      const handleExportRows = (rows, exportAll) => {
        let tableData;
      
        // Handle exporting all rows or selected rows
        if (exportAll) {
          tableData = rows.map((row) => Object.values(row)); // All data
        } else {
          tableData = rows.map((row) => Object.values(row.original)); // Selected rows
        }
      
        // Custom headers
        const customHeaders = ["Item ID", "Description", "Qty", "Unit Price", "Total"];
      
        // Initialize jsPDF
        const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      
        // Iterate through each row to create a new page for each
        rows.forEach((row, index) => {
          // Add new page if it's not the first row
          if (index > 0) {
            doc.addPage();
          }
      
          // Define box positions for each page
          const boxX = 30; 
          const boxY = 40; 
          const boxWidth = 144;
          const boxHeight = 55;
          const borderRadius = 5; 
        
          // Add Border whole content
          doc.roundedRect(13, 13,  420, 605, 5, 5);

          // Title/Header
          doc.setFontSize(16);
          doc.text('INVOICED ORDERS', 220, 27, { align: 'center' });
      
          // Client Information
          doc.setFontSize(10);
doc.roundedRect(boxX, boxY, boxWidth, boxHeight, borderRadius, borderRadius);
doc.text(`Order Number: ${row.original.orderno}`, boxX + 10, boxY + 15);
doc.text(`Invoice Number: ${row.original.invoiceNumber}`, boxX + 10, boxY + 25);
doc.text(`Invoice Date: ${row.original.invoiceDate}`, boxX + 10, boxY + 35);
doc.text(`Tracking Number: ${row.original.trackingNumber}`, boxX + 10, boxY + 45);

          
          // Table Headers and Data for the selected row
          const HeadersData = ["Item ID", "Description", "Qty", "Unit Price", "Total"];
          const tableData = [
            [
              row.original.ItemId || "No record",      
              row.original.description || "No Record",  
              row.original.Quantity || "No Record",     
              row.original.itemUnitPrice || "No Record",
              row.original.total || "No Record"     
            ]
          ];

          // Add autoTable for each page
          doc.autoTable({
            startY: 120,
            startX: 20,
            head: [HeadersData],
            body: tableData,
            theme: 'grid',
            styles: {
              fontSize: 10,
              cellPadding: 3,
              halign: 'center',
              width:120,
            },
            headStyles: {
              fillColor: [0, 102, 204],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
            },
          });
      
          // Footer: Subtotal, Freight, Total, Discount, Balance Due
          const box3X = 270; 
          const box3Y = 420; 
          const box3Width = 144; 
          const box3Height = 65; 
          const border3Radius = 5;
          
          doc.roundedRect(box3X, box3Y, box3Width, box3Height, border3Radius, border3Radius);
          doc.setFontSize(10);
          doc.text('Subtotal: 512,000.00', box3X + 10 , box3Y + 15);
          doc.text('Freight: 0.00',box3X + 10 , box3Y + 25);
          doc.text('Total: 512,000.00',  box3X + 10 , box3Y + 35);
          doc.text('Discount: 0.00', box3X + 10 , box3Y + 45);
          doc.text('Balance Due: 0.00',  box3X + 10 , box3Y + 55);
          
          // Draw footer elements
          const pageWidth = doc.internal.pageSize.getWidth();
          const footerStartY = doc.internal.pageSize.getHeight() - 45; // Adjust this value if needed
          doc.line(12, footerStartY - 20, pageWidth - 12, footerStartY - 20);
          
          // Amount in Words
          doc.setFontSize(10);
          doc.text('Amount in Words: Five hundred and twelve thousand Cedi Zero Pesewa', 20, footerStartY - 10);
          // Signature and Authorization Sections
          doc.setFontSize(10);
          doc.text('Received By: ______________________', 20, footerStartY);
          doc.text('Date and Signature: ______________________', 20, footerStartY + 10);
          doc.text('Authorised By: ______________________', 20, footerStartY + 20);
        });
      
        // Save the PDF after all pages have been created
        doc.save('Quotelisting.pdf');
      };

     // const handleExportRows = (rows, exportAll) => {
    //     let tableData;
    //     if (exportAll) {
    //       tableData = rows.map((row) => Object.values(row));
    //     } else {
    //       tableData = rows.map((row) => Object.values(row.original));
    //     }
    
    //     const tableHeaders = columns.map((c) => c.header).filter((header) => header !== 'Action');
    //     const HeadersData = ["Item ID","Description","Qty","Unit Price","Total"];
    //     const doc = new jsPDF();
    //     if (typeof doc.autoTable === 'function') {
    //       doc.autoTable({
    //         head: [HeadersData],
    //         body: tableData,
    //       });
    //       doc.save('Quotelisting.pdf');
    //     }
    //   };

      const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
      });
      const handleExportCsvRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
      };
      const handleExportCsvData = (data) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
      };
      const handleXLSRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const worksheet = XLSX.utils.json_to_sheet(rowData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
        const filename = Quotedetail.xls;
        XLSX.writeFile(workbook, filename);
      };
      const handleXLSAlldata = (rows) => {
        console.log("rows", rows);
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
        const filename = Quotedetail.xls;
        XLSX.writeFile(workbook, filename);
      };
      const handleXLSXRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const worksheet = XLSX.utils.json_to_sheet(rowData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
        const filename = Quotedetail.xlsx;
        XLSX.writeFile(workbook, filename);
      };
      const handleXLSXAlldata = (rows) => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
        const filename = 'Quotedetail.xlsx';
        XLSX.writeFile(workbook, filename);
      };
      const [anchorEl, setAnchorEl] = useState(null);
      const open = Boolean(anchorEl);
      const handleClick = (e = MouseEvent) => setAnchorEl(e.currentTarget);
      const handleClose = () => setAnchorEl(null);
  return (
    <>
    <Button variant="outlined" disableElevation onClick={handleClick}>
      Batch Actions
    </Button>
    <Menu className="quote-menuwrap" anchorEl={anchorEl} open={open} onClose={handleClose}>
      <MenuItem onClick={handleClose} sx={{ padding: "8px" }}>Book</MenuItem>
      <MenuItem onClick={handleClose} sx={{ padding: "8px" }}>Audit</MenuItem>
      <MenuItem onClick={handleClose} sx={{ padding: "8px" }}>Approve</MenuItem>
      <MenuItem onClick={handleClose} sx={{ padding: "8px" }}>Post</MenuItem>
      <MenuItem onClick={handleClose} sx={{ padding: "8px" }}>Recalc</MenuItem>
      <NestedMenuItem className="parentmenu-list" label="Reports" parentMenuOpen={open} >
        <MenuItem onClick={handleClose}>Import Payment Voucher</MenuItem>
        <MenuItem onClick={handleClose}>Voucher Payment Listing</MenuItem>
        <MenuItem onClick={handleClose}>Payment Listing</MenuItem>
        <MenuItem onClick={handleClose}>Remittance Listing</MenuItem>
      </NestedMenuItem>
      <NestedMenuItem className="parentmenu-list" label="Export" parentMenuOpen={open} >
        <NestedMenuItem className="parentmenu-list" label="Export to PDF" parentMenuOpen={open} >
          <MenuItem
            onClick={() => {
              const accessToken = localStorage.getItem('accessToken');
              const apiUrl = $`{API_BASE_URL}api/GetPayment/${TOKEN}`;
              fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Authorization': Bearer `${accessToken}`,
                  'Content-Type': 'application/json'
                }
              })
                .then(response => {
                  return response.json();
                })
                .then(data => {
                  // Extract specific keys from the response data
                  const filteredData = data.data.map(item => ({
                    orderNumber: item.orderNumber,
                    orderTypeId: item.orderTypeId,
                    orderDate: item.orderDate,
                    customerId: item.customerId,
                    shippingName: item.shippingName,
                    currencyId: item.currencyId,
                    reference: item?.reference,
                    bankId: item?.bankId                             ,
                    currencyId: item?.currencyId                      ,
                    currencyExchangeRate: item?.currencyExchangeRate ,
                    amount: item?.amount                              ,
                    vendorName: item?.vendorName                     ,
                    payeeName: item?.payeeName                       ,
                    notes: item?.notes                               ,
                    PaymentStatus: item?.PaymentStatus                ,
                  }));

                  handleExportRows(filteredData, true);
                })
                .catch(error => {
                  console.error('Error:', error);
                });
            }}
          >
            Export All Rows
          </MenuItem>
          <MenuItem onClick={() => handleExportRows(table.getRowModel().rows, false)}>Export Page Rows</MenuItem>
          <MenuItem
            disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={() => handleExportRows(table.getSelectedRowModel().rows, false)}>Export Selected Rows</MenuItem>
        </NestedMenuItem>
        <NestedMenuItem className="parentmenu-list" label="Export to CSV" parentMenuOpen={open} >
          <MenuItem
            onClick={() => {
              const accessToken = localStorage.getItem('accessToken');
              const apiUrl = $`{API_BASE_URL}api/Gents/${TOKEN}`;
              fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Authorization': Bearer `${accessToken}`,
                  'Content-Type': 'application/json'
                }
              })
                .then(response => {
                  return response.json();
                })
                .then(data => {
                  // Extract specific keys from the response data
                  const filteredData = data.data.map(item => ({
                    orderNumber: item.orderNumber,
                    orderTypeId: item.orderTypeId,
                    orderDate: item.orderDate,
                    customerId: item.customerId,
                    shippingName: item.shippingName,
                    currencyId: item.currencyId,
                    currencyExchangeRate: item.currencyExchangeRate,
                    total: item.total,
                    shipDate: item.shipDate,
                    trackingNumber: item.trackingNumber,
                    status: item.status,
                    orderDueDate: item.orderDueDate,
                    balanceDue: item.balanceDue,
                    postedDate: item.postedDate,
                    signature: item.signature,
                    termsId: item.termsId,
                    subtotal: item.subtotal,
                    branchCode: item.branchCode
                  }));

                  handleExportCsvData(filteredData);
                })
                .catch(error => {
                  console.error('Error:', error);
                });
            }}
          >Export All Rows</MenuItem>
          <MenuItem onClick={() => handleExportCsvRows(table.getPrePaginationRowModel().rows)}>Export Page Rows</MenuItem>
          <MenuItem
            disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={() => handleExportCsvRows(table.getSelectedRowModel().rows)}
          >Export Selected Rows</MenuItem>
        </NestedMenuItem>
        <NestedMenuItem className="parentmenu-list" label="Export to XLS" parentMenuOpen={open} >
          <MenuItem
            onClick={() => {
              const accessToken = localStorage.getItem('accessToken');
              const apiUrl = `${API_BASE_URL}api/GetQuotes/${TOKEN}`;
              fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Authorization': Bearer `${accessToken}`,
                  'Content-Type': 'application/json'
                }
              })
                .then(response => {
                  return response.json();
                })
                .then(data => {
                  // Extract specific keys from the response data
                  const filteredData = data.data.map(item => ({
                    orderNumber: item.orderNumber,
                    orderTypeId: item.orderTypeId,
                    orderDate: item.orderDate,
                    customerId: item.customerId,
                    shippingName: item.shippingName,
                    currencyId: item.currencyId,
                    currencyExchangeRate: item.currencyExchangeRate,
                    total: item.total,
                    shipDate: item.shipDate,
                    trackingNumber: item.trackingNumber,
                    status: item.status,
                    orderDueDate: item.orderDueDate,
                    balanceDue: item.balanceDue,
                    postedDate: item.postedDate,
                    signature: item.signature,
                    termsId: item.termsId,
                    subtotal: item.subtotal,
                    branchCode: item.branchCode
                  }));

                  handleXLSAlldata(filteredData);
                })
                .catch(error => {
                  console.error('Error:', error);
                });
            }}
          >Export All Rows</MenuItem>
          <MenuItem onClick={() => handleXLSRows(table.getPrePaginationRowModel().rows)}>Export Page Rows</MenuItem>
          <MenuItem
            disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={() => handleXLSRows(table.getSelectedRowModel().rows)}
          >Export Selected Rows</MenuItem>
        </NestedMenuItem>
        <NestedMenuItem className="parentmenu-list" label="Export to XLSX" parentMenuOpen={open} >
          <MenuItem
            onClick={() => {
              const accessToken = localStorage.getItem('accessToken');
              const apiUrl = `${API_BASE_URL}api/GetPayments/${TOKEN}`;
              fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Authorization': Bearer `${accessToken}`,
                  'Content-Type': 'application/json'
                }
              })
                .then(response => {
                  return response.json();
                })
                .then(data => {
                  // Extract specific keys from the response data
                  const filteredData = data.data.map(item => ({
                    orderNumber: item.orderNumber,
                    orderTypeId: item.orderTypeId,
                    orderDate: item.orderDate,
                    customerId: item.customerId,
                    shippingName: item.shippingName,
                    currencyId: item.currencyId,
                    currencyExchangeRate: item.currencyExchangeRate,
                    total: item.total,
                    shipDate: item.shipDate,
                    trackingNumber: item.trackingNumber,
                    status: item.status,
                    orderDueDate: item.orderDueDate,
                    balanceDue: item.balanceDue,
                    postedDate: item.postedDate,
                    signature: item.signature,
                    termsId: item.termsId,
                    subtotal: item.subtotal,
                    branchCode: item.branchCode
                  }));

                  handleXLSXAlldata(filteredData);
                })
                .catch(error => {
                  console.error('Error:', error);
                });
            }}
          >Export All Rows</MenuItem>
          <MenuItem onClick={() => handleXLSXRows(table.getPrePaginationRowModel().rows)}>Export Page Rows</MenuItem>
          <MenuItem
            disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onClick={() => handleXLSXRows(table.getSelectedRowModel().rows)}
          >Export Selected Rows</MenuItem>
        </NestedMenuItem>
      </NestedMenuItem>
    </Menu>
  </>
  )
}

export default BatchActionButtonForPayment