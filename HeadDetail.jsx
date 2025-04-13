import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BreadCrumb from "../common/BreadCrumb.jsx";
import { Box, Button, Typography, Grid, Menu, CircularProgress, useTheme, MenuItem } from "@mui/material";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { CustomerCare, DownloadIcon, MainCloseIcon } from "../../asset/images/Icons.js";
import Workflow from "../common/Workflow.jsx";
import { getCurrency } from "../../state/currency/Action.js";
import { getCashbookBank } from "../../state/getcashbookbanks/Action.js";
import { getTaxGroup } from "../../state/taxgroup/Action.js";
import { initialPaymentLine, initialPaymentTabData, initialVendorList, intialCustomerFeilds, intialcustomerTabData, intialPaymentRequireFields, useDebounce } from "../../utils/Utilsfunciton.js";
import { getPaymentClass } from "../../state/GetPaymentTypes/Action.js";
import { getTransectionModule } from "../../state/GetTransactionTypesByModule/Action.js";
import api, { TOKEN } from "../../api/apiConfig.js";
import { useError } from "../../context/Error.js";
import { useToast } from "../../context/Toast.js";
import { useNonClick } from "../../context/NonClick.js";
import { getCompanyBranch } from "../../state/GetCompanyBranch/Action.js";
import { getProjects } from "../../state/GetProjects/Action.js";
import { getFixedAsset } from "../../state/GetFixedAssetsByStatus/Action.js";
import { getGetLedgerAnalysis1 } from "../../state/GetLedgerAnalysis1/Action.js";
import { getGetLedgerAnalysis2 } from "../../state/GetLedgerAnalysis2/Action.js";
import { getBudgets } from "../../state/BudgetId/Action.js";
import { FetchPaymentApprovals } from "../../state/PaymentApproval/Action.js";
import { FetchAuditApprovals } from "../../state/AuditPaymentApproval/Action.js";

// Selectors
import {
  selectPaymentByIdData,
  selectPaymentByIdLoading,
  selectPaymentByIdprocessStatus,
  selectPaymentByIdStatus,
} from "../../state/Selectors/getPaymentById.js";
import {
  selectAuthUsername,
} from "../../state/Selectors/Login.js";
import {
  selectTransectionModulepaymentData,
} from "../../state/Selectors/GetTransactionTypesByModule/payment.js";
import {
  selectBankData,
} from "../../state/Selectors/GetCashbookBanks.js";
import {
  selectCurrencyData,
} from "../../state/Selectors/GetCurrencies.js";
import {
  selectTaxGroupData,
} from "../../state/Selectors/GetTaxGroups.js";
import {
  selectPclassData,
} from "../../state/Selectors/GetPaymentTypes.js";
import {
  selectBranchData,
} from "../../state/Selectors/GetCompanyBranch.js";
import {
  selectProjectData,
} from "../../state/Selectors/GetProjects.js";
import {
  selectAnalysis1Data,
} from "../../state/Selectors/GetLedgerAnalysis1.js";
import {
  selectAnalysis2Data,
} from "../../state/Selectors/GetLedgerAnalysis2.js";
import {
  selectFixedassetINUSEDataData,
} from "../../state/Selectors/GetFixedAssetsByStatus/inUse.js";
import {
  selectGetPaymentApproversData,
  selectGetPaymentApproversError,
} from "../../state/Selectors/GetPaymentApprovers.js";
import {
  selectBudgetData,
  selectBudgetLoading,
} from "../../state/Selectors/GetBudgetId.js";

// Components
import ReusableHeaderUpperPart from "../common/ReusableHeaderUpperPart.jsx";
import VendorGridModal from "../inventory/Modals/VendorGridModal.jsx";
import PaymentsDetailGrid from "./PaymentsDetailGrid.jsx";
import CloseWarning from "../quote/Modals/CloseWarning.jsx";
import ChangeQuoteModal from "../quote//Modals/ChangeQuoteModal.jsx";
import SendAsEmailModal from "../quote/Modals/SendAsEmailModal.jsx";
import UploadViewDocumentModal from "../quote/Modals/UploadViewDocumentModal.jsx";
import QuoteTypeChange from "../quote/Modals/QuoteTypeChange.jsx";
import CustomerRequired from "../quote/Modals/CustomerRequired.jsx";
import QuoteDateChangeModal from "../quote/Modals/QuoteDateChangeModal.jsx";

// Actions
import {
  FetchPaymentById,
  ResetFetchPaymentById,
} from "../../state/getPaymentById/Action.js";
import {
  getVendorById,
  resetVendorFieldsdispatch,
} from "../../state/getVendorById/Action.js";

const usePaymentState = (mode, id) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Payment data from Redux
  const paymentByIdData = useSelector(selectPaymentByIdData);
  const paymentByIdStatus = useSelector(selectPaymentByIdStatus);
  const paymentByIDProcessStatus = useSelector(selectPaymentByIdprocessStatus);
  const paymentByIdDataLoading = useSelector(selectPaymentByIdLoading);
  
  // Other selectors
  const authUsername = useSelector(selectAuthUsername);
  const AllApproval = useSelector(selectGetPaymentApproversData);
  const AllApprovalError = useSelector(selectGetPaymentApproversError);
  const project = useSelector(selectProjectData);
  const PaymentTransactionData = useSelector(selectTransectionModulepaymentData);
  const branch = useSelector(selectBranchData);
  const budgets = useSelector(selectBudgetData);
  const budgetDataLoading = useSelector(selectBudgetLoading);
  const AssetStatusInUseData = useSelector(selectFixedassetINUSEDataData);
  const bankData = useSelector(selectBankData);
  const currencyData = useSelector(selectCurrencyData);
  const taxGroupData = useSelector(selectTaxGroupData);
  const pclassData = useSelector(selectPclassData);
  const analysis1 = useSelector(selectAnalysis1Data);
  const analysis2 = useSelector(selectAnalysis2Data);

  // State initialization
  const [paymentState, setPaymentState] = useState({
    selectedBudget: "",
    checkNumber: "",
    payeeName: "",
    auditComment: "",
    auditedBy: "",
    cleared: false,
    approvedBy: "",
    vendorId: "",
    vendorName: "",
    paymentDate: dayjs(new Date()),
    paymentTransactionType: "Vendor Payment",
    rowVersion: "",
    paymentId: "",
    paymentHeaderDetail: { Amount: 0.0, BranchCode: "" },
    paymentFields: initialPaymentLine,
    data: [],
    paymentTabData: initialPaymentTabData,
    customerFields: intialCustomerFeilds,
    customerTabData: intialcustomerTabData,
    isSubmitting: intialPaymentRequireFields,
    isChanged: false,
    fieldsInitialized: false,
    taxGroupId: "DEFAULT",
    initialVendorId: "",
    isVendorTouched: false,
    trackingNumber: "",
    invoiceNumber: "",
    Quoteopen: false,
    sendEmailModal: false,
    uploadViewModal: false,
    showConfirmationModal: false,
    modalOpen: false,
    modalMessage: "",
    closeButtonText: "Close",
    confirmButtonText: "Ok",
    showCustomerIdModal: false,
    initialapproval: "",
    saveLoading: false,
    batchAction: null,
  });

  // Derived state
  const isApprover = useMemo(() => (
    !AllApprovalError && AllApproval && AllApproval.length > 0 && 
    AllApproval.some(approval => authUsername.includes(approval.employeeId))
  ), [AllApproval, AllApprovalError, authUsername]);

  const workFlowTrail = paymentByIdData?.[0]?.workFlowTrail || [];
  const currentStep = Array.isArray(workFlowTrail) && workFlowTrail.length > 0
    ? workFlowTrail.find(step => !step.isCompleted)
    : null;
  const currentStatus = currentStep?.status || "";

  // Memoized handlers
  const handleTransactionTypeChange = useCallback((newType) => {
    setPaymentState(prev => ({
      ...prev,
      paymentTransactionType: newType,
      data: prev.data.map(item => ({
        ...item,
        AccountName: newType === "Vendor Payment" ? "" : item.AccountName
      }))
    }));
  }, []);

  const handleBudgetChange = useCallback((value) => {
    setPaymentState(prev => ({ ...prev, selectedBudget: value }));
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setPaymentState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePaymentTabFieldChange = useCallback((field, value) => {
    setPaymentState(prev => ({
      ...prev,
      paymentTabData: { ...prev.paymentTabData, [field]: value }
    }));
  }, []);

  const handleCustomerFieldChange = useCallback((field, value) => {
    setPaymentState(prev => {
      let updatedFields = { ...prev.customerFields };
      
      if (field === "currencyId") {
        const selectedCurrency = currencyData?.find(
          currency => currency.currencyId === value
        );
        updatedFields = {
          ...updatedFields,
          currencyId: value,
          currencyExchangeRate: selectedCurrency
            ? Number(selectedCurrency.currencyExchangeRate)
            : 0,
        };
      } else if (field === "tradeDiscount") {
        let discountValue = value;
        if (discountValue > 100) discountValue = 100;
        if (discountValue < 0) discountValue = 0;
        const sanitizedValue = discountValue.toString().match(/^\d+(\.\d{0,2})?/);
        discountValue = sanitizedValue ? sanitizedValue[0] : 0;
        updatedFields = {
          ...updatedFields,
          tradeDiscount: discountValue.length > 0 ? Number(discountValue) : discountValue,
        };
      } else {
        updatedFields = { ...updatedFields, [field]: value };
      }

      return {
        ...prev,
        customerFields: updatedFields,
        isChanged: mode === "edit" && intialCustomerFeilds[field] !== updatedFields[field]
      };
    });
  }, [currencyData, mode]);

  // Data fetching
  useEffect(() => {
    const fetchData = async (paymentId) => {
      try {
        dispatch(FetchPaymentById(paymentId));
      } catch (error) {
        console.error("Failed to fetch payment:", error);
      }
    };

    if (mode === "edit" && id) {
      const newid = id.replace("-", "/");
      fetchData(newid);
    } else if (mode === "create") {
      dispatch(resetVendorFieldsdispatch());
      dispatch(ResetFetchPaymentById());
    }
  }, [id, dispatch, mode]);

  // Initialize fields when data loads
  useEffect(() => {
    if (mode === "edit" && paymentByIdData && !paymentState.fieldsInitialized) {
      const mappedData = paymentByIdData.detailsList?.map((orderLine, index) => ({
        id: Date.now() + index,
        AccountNumber: orderLine.glbankAccount2 || "",
        AccountName: orderLine.glAccountName || "",
        DocumentNumber: orderLine.documentNumber || orderLine.batchControlNumber || "",
        DocumentDate: orderLine.documentDate || "",
        AppliedAmount: orderLine.appliedAmount || 0,
        taxAmount: orderLine.taxAmount || 0,
        taxGroupId: orderLine.taxGroupId || "",
        Amount: orderLine.transactionAmount ?? orderLine.appliedAmount,
        notes: orderLine.notes || "",
        projectId: orderLine.projectId || "",
        glanalysisType1: orderLine.glanalysisType1 || "",
        glanalysisType2: orderLine.glanalysisType2 || "",
        assetId: orderLine.assetId || "",
        branchCode: orderLine.branchCode || "",
        paymentDetailId: orderLine.paymentDetailId || 0,
        bankTransactionDetailId: orderLine.bankTransactionDetailId || 0,
        vendorId: orderLine.vendorId || "",
        bankTransactionId: orderLine.bankTransactionId || "",
      }));

      setPaymentState(prev => ({
        ...prev,
        rowVersion: paymentByIdData.rowVersion,
        paymentId: paymentByIdData.paymentId || paymentByIdData.bankTransactionId,
        paymentFields: {
          ...prev.paymentFields,
          AccountName: paymentByIdData.glbankAccount2 || "",
          Narratives: paymentByIdData.notes || "",
          checkNumber: paymentByIdData.reference || "",
          DocDate: dayjs(paymentByIdData.paymentDate) || dayjs("01/02/1900"),
          Amount: paymentByIdData.amount || paymentByIdData.transactionAmount || "",
          vendorId: paymentByIdData.vendorId || "",
          branchCode: paymentByIdData.branchCode || "",
        },
        paymentTabData: {
          ...prev.paymentTabData,
          checkNumber: paymentByIdData.reference || "",
          bankId: paymentByIdData.bankId || "",
          notes: paymentByIdData.notes || "",
          paymentTypeId: paymentByIdData.paymentTypeId || "",
          reference: paymentByIdData.reference || "",
        },
        customerFields: {
          ...prev.customerFields,
          currencyId: paymentByIdData.currencyId || "",
          currencyExchangeRate: paymentByIdData.currencyExchangeRate || 0,
        },
        paymentHeaderDetail: {
          ...prev.paymentHeaderDetail,
          Amount: paymentByIdData.amount || "",
        },
        auditComment: paymentByIdData.auditComments || "",
        vendorName: paymentByIdData.vendorName || "",
        vendorId: paymentByIdData.vendorId || "",
        paymentDate: dayjs(paymentByIdData.paymentDate) || dayjs(new Date()),
        paymentTransactionType: paymentByIdData.transactionTypeId || "Vendor Payment",
        payeeName: paymentByIdData.payeeName || "",
        checkNumber: paymentByIdData.reference || "",
        approvedBy: paymentByIdData.approvedBy,
        auditedBy: paymentByIdData.auditedBy,
        cleared: paymentByIdData.cleared,
        data: mappedData || [],
        fieldsInitialized: true,
      }));
    }
  }, [mode, paymentByIdData]);

  // Fetch additional data
  useEffect(() => {
    const fetchData = async () => {
      dispatch(FetchPaymentApprovals());
      
      await Promise.all([
        !currencyData.length && dispatch(getCurrency()),
        !bankData.length && dispatch(getCashbookBank()),
        !taxGroupData.length && dispatch(getTaxGroup()),
        !pclassData.length && dispatch(getPaymentClass()),
        !PaymentTransactionData.length && dispatch(getTransectionModule(undefined, undefined, "Payments")),
        !branch.length && dispatch(getCompanyBranch()),
        !project.length && dispatch(getProjects()),
        !budgets.length && dispatch(getBudgets()),
        !AssetStatusInUseData.length && dispatch(getFixedAsset(undefined, undefined, "In Use")),
        !AllApproval.length && dispatch(FetchAuditApprovals()),
        !analysis1.length && dispatch(getGetLedgerAnalysis1()),
        !analysis2.length && dispatch(getGetLedgerAnalysis2()),
      ]);
    };

    fetchData();
  }, [dispatch]);

  return {
    ...paymentState,
    setPaymentState,
    handleTransactionTypeChange,
    handleBudgetChange,
    handleFieldChange,
    handlePaymentTabFieldChange,
    handleCustomerFieldChange,
    isApprover,
    currentStatus,
    paymentByIdData,
    paymentByIdStatus,
    paymentByIDProcessStatus,
    paymentByIdDataLoading,
    AllApproval,
    PaymentTransactionData,
    bankData,
    currencyData,
    taxGroupData,
    pclassData,
    analysis1,
    analysis2,
    budgets,
    budgetDataLoading,
    navigate,
    dispatch,
  };
};

const PaymentsHeaderDetails = () => {
  const { mode, id } = useParams();
  const theme = useTheme();
  const { setLoading } = useNonClick();
  const { showToast } = useToast();
  const { errors, setErrors, setIsEditable } = useError();
  
  const {
    // State
    paymentState,
    setPaymentState,
    // Handlers
    handleTransactionTypeChange,
    handleBudgetChange,
    handleFieldChange,
    handlePaymentTabFieldChange,
    handleCustomerFieldChange,
    // Derived values
    isApprover,
    currentStatus,
    // Redux data
    paymentByIdData,
    paymentByIdStatus,
    paymentByIDProcessStatus,
    paymentByIdDataLoading,
    AllApproval,
    PaymentTransactionData,
    bankData,
    currencyData,
    taxGroupData,
    pclassData,
    analysis1,
    analysis2,
    budgets,
    budgetDataLoading,
    // Utilities
    navigate,
    dispatch,
  } = usePaymentState(mode, id);

  const {
    selectedBudget,
    checkNumber,
    payeeName,
    auditComment,
    auditedBy,
    cleared,
    approvedBy,
    vendorId,
    vendorName,
    paymentDate,
    paymentTransactionType,
    rowVersion,
    paymentId,
    paymentHeaderDetail,
    paymentFields,
    data,
    paymentTabData,
    customerFields,
    isSubmitting,
    isChanged,
    fieldsInitialized,
    taxGroupId,
    initialVendorId,
    isVendorTouched,
    trackingNumber,
    invoiceNumber,
    Quoteopen,
    sendEmailModal,
    uploadViewModal,
    showConfirmationModal,
    modalOpen,
    modalMessage,
    closeButtonText,
    confirmButtonText,
    showCustomerIdModal,
    initialapproval,
    saveLoading,
    batchAction,
  } = paymentState;

  // Memoized values
  const isLoading = saveLoading;
  const buttonText = isLoading
    ? mode === "create" ? "Creating..." : "Saving..."
    : mode === "create" ? "Create" : "Save";

  const isAccountDisabled = paymentTransactionType === "Vendor Payment";

  // Handlers
  const handleMainSave = async () => {
    // Validation and save logic...
  };

  const handleMainClose = () => {
    // Close handling logic...
  };

  const handleConfirmation = useCallback(() => {
    // Confirmation handling logic...
  }, [modalMessage]);

  // Render logic...
  return (
    <React.Fragment>
      {paymentByIdDataLoading ? (
        <Box className="flex items-center justify-center" sx={{ minHeight: "100vh" }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box>
          {mode === "edit" &&
          (paymentByIdStatus === "Success" || paymentByIdStatus === "Failed") &&
          Array.isArray(paymentByIdData) &&
          paymentByIdData?.length === 0 ? (
            <Box className="flex items-center justify-center min-h-screen px-4 bg-gray-100 sm:px-6 lg:px-8">
              <Box className="w-full max-w-2xl p-8 text-center bg-white shadow-lg rounded-2xl">
                <Typography variant="h4" className="font-bold text-gray-900 sm:text-5xl">
                  No Payment found with this Payment {id}
                </Typography>
                <Typography variant="body1" className="mt-4 text-gray-600">
                  The Payment you are looking for does not exist. Please check
                  the Payment number and try again.
                </Typography>
                <Box className="flex justify-center mt-6">
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    className="px-6 py-3 rounded-lg shadow-md"
                    onClick={() => navigate("/EnterpriseASPAR/OrderProcessing/QuoteHeaderList")}
                  >
                    Back To List Page
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <React.Fragment>
              <Box className="flex flex-col pb-20 md:flex-row">
                <Box
                  className="order-2 display lg:pr-10 sm:pr-5 xs:pr-0 md:order-1 content-box-left"
                  sx={{ width: { md: "calc(100% - 60px)" } }}
                >
                  <Box className="lg:pl-10 sm:pl-5 xs:pl-0">
                    <BreadCrumb />
                    <Box
                      className="flex justify-between z-10 items-center pb-2.5 pt-2.5 sm:pb-5 sm:pt-5 mb-4 md:pt-4 flex-col md:flex-row gap-y-3 md:gap-y-4 sticky top-[44px] sm:top-[53.88px] md:top-[89px] section-2"
                      sx={{
                        background: "#fcfcfc",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          zIndex: -1,
                          height: "100%",
                          background: "#fcfcfc",
                          top: 0,
                          [theme.breakpoints.down("sm")]: {
                            width: "20px",
                            right: "-20px",
                          },
                          [theme.breakpoints.between("sm", "md")]: {
                            width: "40px",
                            right: "-40px",
                          },
                          [theme.breakpoints.between("md", "lg")]: {
                            width: "100px",
                            right: "-100px",
                          },
                          [theme.breakpoints.up("lg")]: {
                            width: "120px",
                            right: "-120px",
                          },
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          zIndex: -1,
                          height: "100%",
                          background: "#fcfcfc",
                          top: 0,
                          [theme.breakpoints.down("sm")]: {
                            width: "20px",
                            left: "-20px",
                          },
                          [theme.breakpoints.between("sm", "lg")]: {
                            width: "40px",
                            left: "-40px",
                          },
                          [theme.breakpoints.up("lg")]: {
                            width: "60px",
                            left: "-60px",
                          },
                        },
                      }}
                    >
                      <Typography variant="PageTitle">
                        {mode === "edit" && id ? `Edit ${id}` : "Creating New Payment"}
                      </Typography>
                      <Box className="flex justify-center md:justify-between items-center flex-wrap gap-[5px] md:gap-[15px] lg:gap-[16px]">
                        {!cleared && paymentByIdData.paymentStatus === "Draft" && (
                          <Button
                            variant="outlined"
                            onClick={BookAfterMainSave}
                            disabled={paymentByIdData.cleared}
                          >
                            Book
                          </Button>
                        )}

                        {cleared && paymentByIdData.paymentStatus === "Cleared" && (
                          <>
                            <Button
                              variant="contained"
                              onClick={handleVendorFocus}
                              disabled={isChanged || cleared}
                            >
                              Audit
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleVendorFocus}
                              disabled={isChanged || cleared}
                            >
                              Return
                            </Button>
                          </>
                        )}

                        <Button
                          id="BatchAction"
                          aria-controls={batchAction ? "Batch-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={batchAction ? "true" : undefined}
                          onClick={(e) => setPaymentState(prev => ({ ...prev, batchAction: e.currentTarget }))}
                          variant="outlined"
                        >
                          Batch Actions
                        </Button>

                        <Menu
                          anchorEl={batchAction}
                          open={Boolean(batchAction)}
                          onClose={() => setPaymentState(prev => ({ ...prev, batchAction: null }))}
                          variant="selectedMenu"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                        >
                          <MenuItem
                            disabled={mode === "create"}
                            onClick={() => setPaymentState(prev => ({ ...prev, sendEmailModal: true }))}
                          >
                            Preview Payment
                          </MenuItem>
                          <MenuItem
                            disabled={mode === "create"}
                            onClick={() => setPaymentState(prev => ({ ...prev, sendEmailModal: true }))}
                          >
                            Send Payment As E-mail
                          </MenuItem>
                          <MenuItem
                            disabled={mode === "create"}
                            onClick={() => setPaymentState(prev => ({ ...prev, sendEmailModal: true }))}
                          >
                            Recalc
                          </MenuItem>
                          <MenuItem
                            disabled={mode === "create"}
                            onClick={() => setPaymentState(prev => ({ ...prev, uploadViewModal: true }))}
                          >
                            Upload & View Document
                          </MenuItem>
                          <MenuItem onClick={() => setPaymentState(prev => ({ ...prev, Quoteopen: true }))}>
                            Change Payment
                          </MenuItem>
                        </Menu>

                        <Button
                          onClick={handleMainSave}
                          variant="contained"
                          disabled={isLoading || cleared || (mode === "edit" && !isChanged)}
                          startIcon={isLoading && <CircularProgress size={20} />}
                        >
                          {buttonText}
                        </Button>
                      </Box>
                    </Box>
                    <Grid container columnSpacing={2.25}>
                      <Grid item xs={12} xl={12} lg={12}>
                        <Box className="mb-5 p-[15px] md:p-5 shadowBox">
                          <ReusableHeaderUpperPart
                            paymentId={paymentId || paymentByIdData?.paymentId || paymentByIdData?.bankTransactionId}
                            setPaymentId={(value) => handleFieldChange("paymentId", value)}
                            Amount={paymentHeaderDetail.Amount}
                            vendorName={vendorName}
                            handleVendorIdChange={(value) => handleFieldChange("vendorId", value)}
                            setVendorName={(value) => handleFieldChange("vendorName", value)}
                            mode={mode}
                            isSubmitting={isSubmitting}
                            paymentTransactionType={paymentTransactionType}
                            handleTransactionTypeChange={handleTransactionTypeChange}
                            setIsSubmitting={(value) => handleFieldChange("isSubmitting", value)}
                            paymentDate={paymentDate}
                            handlePaymentDateChange={(value) => handleFieldChange("paymentDate", value)}
                            handlePaymentDateAccept={handlePaymentDateAccept}
                            bankData={bankData}
                            handlePaymentTabFieldChange={handlePaymentTabFieldChange}
                            handleCustomerFieldChange={handleCustomerFieldChange}
                            setCustomerFields={(value) => handleFieldChange("customerFields", value)}
                            customerFields={customerFields}
                            vendorId={vendorId}
                            setVendorId={(value) => handleFieldChange("vendorId", value)}
                            handleCustomerIdChange={(value) => handleFieldChange("vendorId", value)}
                            handleCustomerFocus={() => handleFieldChange("initialVendorId", vendorId)}
                            setAllCustomer={(value) => handleFieldChange("allCustomer", value)}
                            allVendor={initialVendorList}
                            setIsVendorTouched={(value) => handleFieldChange("isVendorTouched", value)}
                            payeeName={payeeName}
                            setPayeeName={(value) => handleFieldChange("payeeName", value)}
                            approvedBy={approvedBy}
                            auditedBy={auditedBy}
                            setApprovedBy={(value) => handleFieldChange("approvedBy", value)}
                            setAuditedBy={(value) => handleFieldChange("auditedBy", value)}
                            checkNumber={checkNumber}
                            setCheckNumber={(value) => handleFieldChange("checkNumber", value)}
                            setPaymentTabData={(value) => handleFieldChange("paymentTabData", value)}
                            paymentTabData={paymentTabData}
                            paymentFields={paymentFields}
                            auditComment={auditComment}
                            onAuditCommentChange={() => handleFieldChange("isChanged", true)}
                            setAuditComment={(value) => handleFieldChange("auditComment", value)}
                            cleared={cleared}
                            posted={false}
                            pclassData={pclassData}
                            narratives={paymentTabData.notes}
                            budgetDataLoading={budgetDataLoading}
                            budgetData={budgets}
                            selectedBudget={selectedBudget}
                            handleBudgetChange={handleBudgetChange}
                          />
                        </Box>

                        <Box className="mb-5 p-[12px] md:p-5 shadowBox">
                          <PaymentsDetailGrid
                            paymentTransactionType={paymentTransactionType}
                            mustRequired={{
                              paymentDate: paymentDate,
                              paymentTransactionType: paymentTransactionType,
                              currencyId: customerFields.currencyId,
                              bankId: paymentTabData.bankId,
                              checkNumber: paymentTabData.checkNumber,
                              approvedBy: approvedBy,
                              auditedBy: auditedBy,
                              paymentTypeId: paymentTabData.paymentTypeId,
                              narratives: paymentTabData.notes,
                              ...(paymentTransactionType === "Vendor Payment" && { vendorId }),
                              ...(paymentTransactionType === "GL Expense" && { payeeName }),
                            }}
                            mode={mode}
                            fieldsInitialized={fieldsInitialized}
                            initinventorydata={data}
                            setIsChanged={(value) => handleFieldChange("isChanged", value)}
                            isSubmitting={isSubmitting}
                            setIsSubmitting={(value) => handleFieldChange("isSubmitting", value)}
                            data={data}
                            setData={(value) => handleFieldChange("data", value)}
                            handleHeaderFieldChange={(field, value) => 
                              handleFieldChange("paymentHeaderDetail", { ...paymentHeaderDetail, [field]: value })
                            }
                            paymentDate={paymentDate}
                            touched={{}}
                            setTouched={() => {}}
                            vendorId={vendorId}
                            setVendorId={(value) => handleFieldChange("vendorId", value)}
                            isAccountDisabled={isAccountDisabled}
                            onFieldChange={(rowId, field, value) => {
                              if (field === "taxGroupId") {
                                handleFieldChange("taxGroupId", value);
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Box className="z-10 content-box-right pt-6 px-[10px] mb-1 sm:mb-6 md:mb-0 md:w-[60px] md:order-2 order-1 flex md:flex-col gap-3 justify-center md:justify-normal md:fixed md:right-[20px]">
                  <Button
                    variant="contained"
                    className="flex !p-0 items-center justify-center h-[40px] sm:w-fit !min-w-[40px]"
                    sx={{ width: "40px" }}
                  >
                    <DownloadIcon />
                  </Button>
                  <Button
                    variant="contained"
                    className="flex !p-0 items-center justify-center h-[40px] sm:w-fit !min-w-[40px]"
                    sx={{ width: "40px" }}
                    onClick={() => window.open("https://www.pow.com/manual?mo", "_blank")}
                  >
                    <CustomerCare />
                  </Button>
                  <Button
                    variant="contained"
                    className="flex !p-0 items-center justify-center h-[40px] sm:w-fit !min-w-[40px]"
                    onClick={handleMainClose}
                    sx={{ width: "40px" }}
                  >
                    <MainCloseIcon />
                  </Button>
                </Box>
              </Box>
            </React.Fragment>
          )}
        </Box>
      )}

      <VendorGridModal
        open={vendorModal}
        handleClose={() => setPaymentState(prev => ({ ...prev, vendorModal: false }))}
        handleRowDoubleClick={handleRowDoubleClick}
      />
      <ChangeQuoteModal 
        open={Quoteopen} 
        handleClose={() => setPaymentState(prev => ({ ...prev, Quoteopen: false }))} 
      />
      <SendAsEmailModal
        sendEmailModal={sendEmailModal}
        handleEmailClose={() => setPaymentState(prev => ({ ...prev, sendEmailModal: false }))}
        preventDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      />
      <CloseWarning
        open={modalOpen}
        title={"Warning"}
        message={modalMessage}
        confirmButtonText={confirmButtonText}
        closeButtonText={closeButtonText}
        handleConfirmation={handleConfirmation}
        handleClose={() => setPaymentState(prev => ({ 
          ...prev, 
          modalMessage: "",
          confirmButtonText: "",
          closeButtonText: "",
          modalOpen: false 
        }))}
      />
      <QuoteTypeChange
        open={showConfirmationModal}
        onClose={() => setPaymentState(prev => ({ ...prev, showConfirmationModal: false }))}
        handleconfirm={() => {
          setPaymentState(prev => ({ 
            ...prev, 
            data: [],
            paymentTransactionType: newPaymentType,
            showConfirmationModal: false 
          }));
          setErrors({});
        }}
      />
      <CustomerRequired
        open={showCustomerIdModal}
        onClose={() => setPaymentState(prev => ({ ...prev, showCustomerIdModal: false }))}
        handleCancel={() => setPaymentState(prev => ({ 
          ...prev, 
          showCustomerIdModal: false,
          showModal: false 
        }))}
      />
      <QuoteDateChangeModal
        open={showQuoteModal}
        onClose={() => setPaymentState(prev => ({ ...prev, showQuoteModal: false }))}
        handleCancel={() => setPaymentState(prev => ({ ...prev, showQuoteModal: false }))}
        handleconfirm={() => {
          setPaymentState(prev => ({ 
            ...prev, 
            paymentDate: pendingPaymentDate,
            showQuoteModal: false 
          }));
        }}
      />
    </React.Fragment>
  );
};

export default React.memo(PaymentsHeaderDetails);