import { Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fade, FormControl, FormControlLabel, Grid, IconButton, InputLabel, Skeleton, Tab, TextField, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CustomDatePicker } from "../common/Commoncomponent.js";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getGetLedgerAnalysis1 } from "../../state/GetLedgerAnalysis1/Action.js";
import { getGetLedgerAnalysis2 } from "../../state/GetLedgerAnalysis2/Action.js";
import dayjs from "dayjs";
import TabList from "@mui/lab/TabList";
import { TabContext, TabPanel } from "@mui/lab";
import { useError } from "../../context/Error.js";
import { selectBranchData, selectBranchLoading } from "../../state/Selectors/GetCompanyBranch.js";
import { selectProjectData, selectProjectLoading } from "../../state/Selectors/GetProjects.js";
import { selectAnalysis1Data, selectAnalysis1Loading } from "../../state/Selectors/GetLedgerAnalysis1.js";
import { selectAnalysis2Data, selectAnalysis2Loading } from "../../state/Selectors/GetLedgerAnalysis2.js";
import { selectTaxGroupData, selectTaxGroupLoading } from "../../state/Selectors/GetTaxGroups.js";
import { selectFixedassetINUSEDataData, selectFixedassetINUSEDataLoading } from "../../state/Selectors/GetFixedAssetsByStatus/inUse.js";
import PaymentsGridModal from "./PaymentsGridModal.jsx";
import PaymentDocumentModal from "./PaymentDocumentModal.jsx";

const PaymentsEditModal = ({ 
  open, 
  handleClose, 
  row, 
  paymentTransactionType, 
  selectedRowId, 
  handleEditSave, 
  setParentError, 
  parentErrors, 
  touch, 
  setTouch, 
  vendorId, 
  quoteDate, 
  itemPricingCode,
  isAccountDisabled,
  isTaxDisabled,
  handleHeaderFieldChange,
  cleared,
  setOpenModal,
  setSelectedRowId,
  setInventory
}) => {
  const theme = useTheme();
  const { isEditable } = useError();
  const dispatch = useDispatch();

  const AssetStatusInUseData = useSelector(selectFixedassetINUSEDataData);
  const AssetStatusInUseLoading = useSelector(selectFixedassetINUSEDataLoading);

  const taxGrp = useSelector(selectTaxGroupData);
  const taxGrpLoading = useSelector(selectTaxGroupLoading);

  const branch = useSelector(selectBranchData);
  const branchLoading = useSelector(selectBranchLoading);

  const project = useSelector(selectProjectData);
  const projectLoading = useSelector(selectProjectLoading);

  const analysis1 = useSelector(selectAnalysis1Data);
  const analysis1Loading = useSelector(selectAnalysis1Loading);

  const analysis2 = useSelector(selectAnalysis2Data);
  const analysis2Loading = useSelector(selectAnalysis2Loading);

  const [inventoryModal, setInventoryModal] = useState(false);
  const [documentModal, setDocumentModal] = useState(false);
  const [formData, setFormData] = useState({
    ...row,
    DocumentDate: row?.DocumentDate ? dayjs(row.DocumentDate) : null,
  });

  const [initialData, setInitialData] = useState(row || {});
  const [tabvalue, setTabValue] = React.useState("1");
  const prevFormDataRef = useRef(formData);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        !analysis1.length && dispatch(getGetLedgerAnalysis1()),
        !analysis2.length && dispatch(getGetLedgerAnalysis2()),
      ]);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    setFormData({
      ...row,
      DocumentDate: row?.DocumentDate ? dayjs(row.DocumentDate) : null,
    });
    setInitialData({
      ...row,
      DocumentDate: row?.DocumentDate ? dayjs(row.DocumentDate) : null,
    });
    prevFormDataRef.current = { ...row };
  }, [row]);

  const handleInventoryClose = () => {
    setInventoryModal(false);
    setInventory(false);
  };

  const handleDocumentClose = () => {
    setDocumentModal(false);
    setInventory(false);
  };

  const handleBlur = useCallback((fieldName, validationMessage) => {
    if (formData[fieldName] === "") {
      setTouch(prev => ({
        ...prev,
        [fieldName]: true,
      }));
    } else {
      setParentError((prevState) => {
        const { [fieldName]: _, ...rest } = prevState;
        return rest;
      });
    }
  }, [formData]);

  const handleChange = useCallback((field, value) => {
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [field]: value,
      };

      // Calculate tax amount if tax group or amount changes
      if ((field === 'taxGroupId' || field === 'Amount') && !isTaxDisabled) {
        const selectedTaxGroup = taxGrp?.find(tax => tax.taxGroupId === (field === 'taxGroupId' ? value : updatedData.taxGroupId));
        const amount = field === 'Amount' ? (value ? Number(value) : 0) : Number(updatedData.Amount || 0);
        const taxPercent = selectedTaxGroup ? Number(selectedTaxGroup.totalPercent) : 0;
        const taxAmount = (amount * taxPercent) / 100;

        updatedData.taxAmount = taxAmount;
        
        // Update parent header if amount changes
        if (field === 'Amount' && handleHeaderFieldChange) {
          handleHeaderFieldChange('Amount', value);
          handleHeaderFieldChange('taxAmount', taxAmount);
        } else if (field === 'taxGroupId' && handleHeaderFieldChange) {
          handleHeaderFieldChange('taxAmount', taxAmount);
        }
      }

      return updatedData;
    });

    setParentError((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (value !== "") {
        delete newErrors[field];
      } else {
        newErrors[field] = `${field} is required`;
      }
      return newErrors;
    });
  }, [taxGrp, isTaxDisabled, handleHeaderFieldChange]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleDateChange = useCallback((newDate) => {
    setFormData((prevData) => ({
      ...prevData,
      DocumentDate: newDate,
    }));
  }, []);

  const handleCancel = useCallback(() => {
    setFormData(initialData);
    handleClose();
    setTimeout(() => {
      prevFormDataRef.current = null;
    }, 500);
  }, [handleClose, initialData]);

  const handleAccountRowUpdate = useCallback((updatedRow) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      AccountNumber: updatedRow.AccountNumber,
      AccountName: updatedRow.AccountName,
    }));
    setInventoryModal(false);
  }, []);

  const handleDocumentRowUpdate = useCallback((updatedRow) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      DocumentNumber: updatedRow.DocumentNumber,
      DocumentDate: updatedRow.DocumentDate,
    }));
    setDocumentModal(false);
  }, []);

  const handleSaveClick = useCallback(() => {
    const requiredFields = [
      'AccountNumber',
      'AccountName',
      'notes',
      'DocumentNumber',
      'DocumentDate',
      'Amount',
      'branchCode'
    ];
    
    let hasError = false;
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === "") {
        newErrors[field] = `${field} is required`;
        hasError = true;
      }
    });
    
    if (hasError) {
      setParentError((prevState) => ({
        ...prevState,
        [selectedRowId]: {...newErrors},
      }));
    } else {
      setParentError((prevState) => {
        const newState = { ...prevState };
        delete newState[selectedRowId];
        return newState;
      });
      
      // Ensure we pass the updated DocumentDate as a Dayjs object
      const saveData = {
        ...formData,
        DocumentDate: formData.DocumentDate || null
      };
      
      handleEditSave(saveData);
      handleClose();
    }
  }, [formData, selectedRowId, handleEditSave, handleClose, setParentError]);

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleCancel}
        TransitionComponent={Fade}
        transitionDuration={{ enter: 600, exit: 500 }}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx:{
            maxHeight:'70vh',
            height:'70vh'
          }
        }}
      >
        <DialogTitle className="dialogTitle1">
          <Box className="warnmodal-title-content">
            <Typography variant="modalTitleWarning">
              Payment Details
                <IconButton
                    className="closeIconButton"
                    onClick={handleCancel}
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </Typography>
            <TabContext value={tabvalue}>
              <TabList
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  TabIndicatorProps={{
                    style: {
                      display: "none",
                    },
                  }}
                  sx={{
                    marginTop:'18px',
                    marginBottom: '-8px',
                  }}
                >
                  <Tab value="1" label="Main Details" />
                  <Tab value="2" label="Memo" />
              </TabList>
            </TabContext>
          </Box>
        </DialogTitle>

        <DialogContent className="dialogContent1">
          <TabContext value={tabvalue} >
              <TabPanel value="1" sx={{paddingLeft:0,paddingRight:0}}>
                <Grid container columnSpacing={4}>
                <Grid item xs={12}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="AccountNumber">Account</InputLabel>
                      <Button
                        disabled={cleared || isAccountDisabled || isEditable}
                        variant="text"
                        fullWidth
                        sx={{
                          textAlign: "left",
                          justifyContent: 'flex-start',
                          color: formData.AccountNumber?.trim() ? "default" : "red",
                          border: '1px solid rgba(0, 0, 0, 0.23)',
                          padding: '16.5px 14px',
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'transparent'
                          }
                        }}
                        onClick={() => {
                          setSelectedRowId(row.id);
                          setInventoryModal(true);
                          setInventory(true);
                        }}
                      >
                        {formData.AccountNumber?.trim() ? formData.AccountNumber : "Select Account"}
                      </Button>
                      {parentErrors.AccountNumber && !formData.AccountNumber && (
                        <Typography color="error" variant="caption">
                          {parentErrors.AccountNumber}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="AccountName">Account Name</InputLabel>
                      <TextField
                        required
                        id='AccountName'
                        name='AccountName'
                        autoComplete='AccountName'
                        disabled
                        fullWidth
                        value={formData.AccountName || ''}
                        error={parentErrors.AccountName && !formData.AccountName}
                        helperText={parentErrors.AccountName && !formData.AccountName ? parentErrors?.AccountName : ''}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="notes">Narratives</InputLabel>
                      <TextField
                        id='notes'
                        name='notes'
                        autoComplete='notes'
                        fullWidth
                        disabled={cleared || isEditable}
                        value={formData.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="DocumentNumber">Document Number</InputLabel>
                      <Button
                        disabled={cleared || isEditable}
                        variant="text"
                        fullWidth
                        sx={{
                          textAlign: "left",
                          justifyContent: 'flex-start',
                          color: formData.DocumentNumber?.trim() ? "default" : "red",
                          border: '1px solid rgba(0, 0, 0, 0.23)',
                          padding: '16.5px 14px',
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'transparent'
                          }
                        }}
                        onClick={() => {
                          setSelectedRowId(row.id);
                          setOpenModal("document");
                          setDocumentModal(true);
                          setInventory(true);
                        }}
                      >
                        {formData.DocumentNumber || "Select Document"}
                      </Button>
                      {parentErrors.DocumentNumber && !formData.DocumentNumber && (
                        <Typography color="error" variant="caption">
                          {parentErrors.DocumentNumber}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="DocumentDate">Document Date</InputLabel>
                      <FormControl fullWidth>
                        <CustomDatePicker
                          fullWidth
                          id="DocumentDate"
                          disabled
                          value={formData.DocumentDate || null}
                          onChange={(newDate) => handleDateChange(newDate)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="Amount">Amount</InputLabel>
                      <TextField
                        required
                        id='Amount'
                        name='Amount'
                        type="number"
                        disabled={cleared || isEditable}
                        fullWidth
                        value={formData.Amount || ''}
                        onBlur={() => handleBlur('Amount', 'Amount is required')}
                        onChange={(e) => handleChange('Amount', e.target.value ? Number(e.target.value) : '')}
                        error={parentErrors.Amount && !formData.Amount}
                        helperText={parentErrors.Amount && !formData.Amount ? parentErrors?.Amount : ''}
                      />
                    </Grid>

                    {!isTaxDisabled && (
                      <>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="taxGroupId">Tax Type</InputLabel>
                          {taxGrpLoading ? (
                            <Skeleton variant="rectangular" animation="wave" width="100%" />
                          ) : (
                            <Autocomplete
                              id="taxGroupId"
                              name="taxGroupId"
                              fullWidth
                              disabled={cleared || isEditable}
                              options={taxGrp || []}
                              getOptionLabel={(option) =>
                                option ? `${option.taxGroupDetailId} (${option.taxGroupId})` : ''
                              }
                              value={
                                taxGrp?.find(tax => tax.taxGroupId === formData.taxGroupId) || null
                              }
                              onChange={(event, newValue) => {
                                const taxPercent = newValue ? Number(newValue.totalPercent) : 0;
                                const amount = Number(formData.Amount || 0);
                                const taxAmount = (amount * taxPercent) / 100;
                                
                                handleChange('taxGroupId', newValue ? newValue.taxGroupId : '');
                                handleChange('taxAmount', taxAmount);
                                
                                if (handleHeaderFieldChange) {
                                  handleHeaderFieldChange('taxAmount', taxAmount);
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                />
                              )}
                              isOptionEqualToValue={(option, value) => option.taxGroupId === value.taxGroupId}
                            />
                          )}
                        </Grid>

                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="taxAmount">Tax Amount</InputLabel>
                          <TextField
                            disabled
                            fullWidth
                            id='taxAmount'
                            name='taxAmount'
                            type="number"
                            value={formData.taxAmount || 0}
                          />
                        </Grid>

                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="taxable">Use Tax Flat Rate</InputLabel>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.taxable || false}
                                onChange={(e) => handleChange('taxable', e.target.checked)}
                                disabled={cleared || isEditable}
                              />
                            }
                            label="Tax Incl"
                          />
                        </Grid>
                      </>
                    )}

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="branchCode">Branch</InputLabel>
                      {branchLoading ? (
                        <Skeleton variant="rectangular" animation="wave" width="100%" />
                      ) : (
                        <Autocomplete
                          id="branchCode"
                          name="branchCode"
                          fullWidth
                          disabled={cleared || isEditable}
                          options={branch || []}
                          getOptionLabel={(option) => option?.branchName || ''}
                          value={
                            branch?.find(
                              branch => branch.branchCode?.toLowerCase() === formData.branchCode?.toLowerCase()
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            handleChange('branchCode', newValue ? newValue.branchCode : '');
                          }}
                          onBlur={() => handleBlur('branchCode', 'Branch is required')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              error={parentErrors.branchCode && !formData.branchCode}
                              helperText={parentErrors.branchCode && !formData.branchCode ? parentErrors?.branchCode : ''}
                            />
                          )}
                          isOptionEqualToValue={(option, value) =>
                            option.branchCode?.toLowerCase() === value.branchCode?.toLowerCase()
                          }
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="projectId">Project ID</InputLabel>
                      {projectLoading ? (
                        <Skeleton variant="rectangular" animation="wave" width="100%" />
                      ) : (
                        <Autocomplete
                          id="projectId"
                          name="projectId"
                          fullWidth
                          disabled={cleared || isEditable}
                          options={project || []}
                          getOptionLabel={(option) => option?.projectName || ''}
                          value={
                            project?.find(
                              project => project.projectId?.toLowerCase() === formData.projectId?.toLowerCase()
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            handleChange('projectId', newValue ? newValue.projectId : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                            />
                          )}
                          isOptionEqualToValue={(option, value) =>
                            option.projectId?.toLowerCase() === value.projectId?.toLowerCase()
                          }
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="glanalysisType1">Analysis 1</InputLabel>
                      {analysis1Loading ? (
                        <Skeleton variant="rectangular" animation="wave" width="100%" />
                      ) : (
                        <Autocomplete
                          id="glanalysisType1"
                          name="glanalysisType1"
                          fullWidth
                          disabled={cleared || isEditable}
                          options={analysis1 || []}
                          getOptionLabel={(option) => option?.glanalysisTypeDescription || ''}
                          value={
                            analysis1?.find(
                              analysis => analysis.glanalysisType?.toLowerCase() === formData.glanalysisType1?.toLowerCase()
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            handleChange('glanalysisType1', newValue ? newValue.glanalysisType : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                            />
                          )}
                          isOptionEqualToValue={(option, value) =>
                            option.glanalysisType?.toLowerCase() === value.glanalysisType?.toLowerCase()
                          }
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="glanalysisType2">Analysis 2</InputLabel>
                      {analysis2Loading ? (
                        <Skeleton variant="rectangular" animation="wave" width="100%" />
                      ) : (
                        <Autocomplete
                          id="glanalysisType2"
                          name="glanalysisType2"
                          fullWidth
                          disabled={cleared || isEditable}
                          options={analysis2 || []}
                          getOptionLabel={(option) => option?.glanalysisTypeDescription || ''}
                          value={
                            analysis2?.find(
                              analysis => analysis.glanalysisType?.toLowerCase() === formData.glanalysisType2?.toLowerCase()
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            handleChange('glanalysisType2', newValue ? newValue.glanalysisType : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                            />
                          )}
                          isOptionEqualToValue={(option, value) =>
                            option.glanalysisType?.toLowerCase() === value.glanalysisType?.toLowerCase()
                          }
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={6} lg={4} xl={4}>
                      <InputLabel htmlFor="assetId">Asset ID</InputLabel>
                      {AssetStatusInUseLoading ? (
                        <Skeleton variant="rectangular" animation="wave" width="100%" />
                      ) : (
                        <Autocomplete
                          id="assetId"
                          name="assetId"
                          fullWidth
                          disabled={cleared || isEditable}
                          options={AssetStatusInUseData || []}
                          getOptionLabel={(option) => option?.assetName || ''}
                          value={
                            AssetStatusInUseData?.find(
                              asset => asset.assetId?.toLowerCase() === formData.assetId?.toLowerCase()
                            ) || null
                          }
                          onChange={(event, newValue) => {
                            handleChange('assetId', newValue ? newValue.assetId : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                            />
                          )}
                          isOptionEqualToValue={(option, value) =>
                            option.assetId?.toLowerCase() === value.assetId?.toLowerCase()
                          }
                        />
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                </Grid>
              </TabPanel>
              <TabPanel value="2" sx={{paddingLeft:0,paddingRight:0}}>
                <Box>
                  <Grid container columnSpacing={4}>
                    <Grid item xs={12}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="detailMemo1">Memo 1</InputLabel>
                          <TextField
                            id='detailMemo1'
                            name='detailMemo1'
                            autoComplete='Memo 1'
                            fullWidth
                            disabled={cleared || isEditable}
                            value={formData.detailMemo1 || ''}
                            onChange={(e) => handleChange('detailMemo1', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="detailMemo2">Memo 2</InputLabel>
                          <TextField
                            id='detailMemo2'
                            name='detailMemo2'
                            autoComplete='Memo 2'
                            fullWidth
                            disabled={cleared || isEditable}
                            value={formData.detailMemo2 || ''}
                            onChange={(e) => handleChange('detailMemo2', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="detailMemo3">Memo 3</InputLabel>
                          <TextField
                            id='detailMemo3'
                            name='detailMemo3'
                            autoComplete='Memo 3'
                            fullWidth
                            disabled={cleared || isEditable}
                            value={formData.detailMemo3 || ''}
                            onChange={(e) => handleChange('detailMemo3', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="detailMemo4">Memo 4</InputLabel>
                          <TextField
                            id='detailMemo4'
                            name='detailMemo4'
                            autoComplete='Memo 4'
                            fullWidth
                            disabled={cleared || isEditable}
                            value={formData.detailMemo4 || ''}
                            onChange={(e) => handleChange('detailMemo4', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} lg={4} xl={4}>
                          <InputLabel htmlFor="detailMemo5">Memo 5</InputLabel>
                          <TextField
                            id='detailMemo5'
                            name='detailMemo5'
                            autoComplete='Memo 5'
                            fullWidth
                            disabled={cleared || isEditable}
                            value={formData.detailMemo5 || ''}
                            onChange={(e) => handleChange('detailMemo5', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
          </TabContext>  
        </DialogContent>

        <DialogActions className="dialogAction1" sx={{ backgroundColor : "#f2eeee5e"}}>
          <Button onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveClick} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      <PaymentsGridModal
        open={inventoryModal}
        handleClose={handleInventoryClose}
        paymentTransactionType={paymentTransactionType}
        onRowSelect={handleAccountRowUpdate}
      />

      <PaymentDocumentModal
        open={documentModal}
        handleClose={handleDocumentClose}
        paymentTransactionType={paymentTransactionType}
        onRowSelect={handleDocumentRowUpdate}
        vendorId={vendorId}
      />
    </React.Fragment>
  );
};

export default React.memo(PaymentsEditModal);