import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Paper,
  Box,
  TablePagination,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Add, Block, Search, Edit as EditIcon } from "@mui/icons-material";
import axios from "axios";
import AddBrandModal from "../../modals/addBrandModal";
import EditBrandModal from "../../modals/editBrandModal";

const Brand = () => {
  const [brandsData, setBrandsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [brandToBlock, setBrandToBlock] = useState(null);

  // Fetch brands data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:9090/api/admin/brands/get/admin");
        setBrandsData(response.data);
      } catch (err) {
        setError("Failed to fetch brands data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleBrandUpdated = (updatedBrand) => {
    if (updatedBrand && updatedBrand._id) {
      setBrandsData((prevData) =>
        prevData.map((brand) =>
          brand._id === updatedBrand._id ? updatedBrand : brand
        )
      );
    }
  };

  const handleEditModalOpen = (brand) => {
    setSelectedBrand(brand);
    setIsEditModalOpen(true);
  };
  const handleEditModalClose = () => {
    setSelectedBrand(null);
    setIsEditModalOpen(false);
  };

  const handleBlockBrand = (brandId) => {
    setBrandToBlock(brandId);
    setConfirmationModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:9090/api/admin/brands/block/${brandToBlock}`
      );
      setBrandsData((prevData) =>
        prevData.map((brand) =>
          brand._id === brandToBlock ? { ...brand, isDeleted: true } : brand
        )
      );
      setSnackbarMessage("Brand successfully blocked!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to block brand.");
      setSnackbarOpen(true);
    }
    setConfirmationModalOpen(false);
  };

  const handleUnBlockBrand = async (brandId) => {
    try {
      const response = await axios.patch(
        `http://localhost:9090/api/admin/brands/unblock/${brandId}`
      );
      setBrandsData((prevData) =>
        prevData.map((brand) =>
          brand._id === brandId ? { ...brand, isDeleted: false } : brand
        )
      );
      setSnackbarMessage("Brand successfully unblocked!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to unblock brand.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setConfirmationModalOpen(false);

  if (loading) {
    return <Box sx={{ color: "#FF9800" }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ color: "#FF9800" }}>Error: {error}</Box>;
  }

  return (
    <Box sx={{ padding: 3, backgroundColor: "#212121" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#333", // Dark background
          borderRadius: 2,
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Box>
          <Box
            component="span"
            sx={{ fontSize: "20px", fontWeight: "bold", color: "#FF9800" }}
          >
            Brands
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: "white",
            color: "#FF9800",
            "&:hover": { backgroundColor: "white" },
            border: "1px solid #FF9800",
          }}
          onClick={handleModalOpen}
        >
          Add New Brand
        </Button>
        <Box>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            InputProps={{
              endAdornment: (
                <IconButton>
                  <Search sx={{ color: "#FF9800" }} />
                </IconButton>
              ),
            }}
            sx={{
              backgroundColor: "#424242", // Dark background for input
              color: "#ffffff", // White text
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "#ffffff", // White text inside input
                "& fieldset": {
                  borderColor: "#FF9800", // Orange border for the input
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          padding: 2,
          backgroundColor: "#333", // Dark background for table container
          borderRadius: 3,
        }}
      >
        <Table sx={{ width: "100%", backgroundColor: "#424242" }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Brand Image
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Brand Name
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Created At
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Edit
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brandsData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell sx={{ color: "#ffffff" }}>
                    <img src={brand.image} alt={brand.name} width={50} />
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>{brand.name}</TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {new Date(brand.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{
                        backgroundColor: "#FF9800", // Orange color for edit button
                        color: "white",
                      }}
                      onClick={() => handleEditModalOpen(brand)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell>
                    {brand.isDeleted ? (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Block />}
                        sx={{
                          backgroundColor: "black",
                          color: "gray",
                        }}
                        onClick={() => handleUnBlockBrand(brand._id)}
                      >
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Block />}
                        sx={{
                          backgroundColor: "black",
                          color: "#FF9800", // Orange color for block button
                        }}
                        onClick={() => handleBlockBrand(brand._id)}
                      >
                        Block
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={brandsData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: "#333", // Dark background for pagination
          color: "#FF9800", // Orange color for pagination
        }}
      />

      {/* Add/Edit Brand Modals */}
      <AddBrandModal open={isModalOpen} handleClose={handleModalClose} />
      <EditBrandModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        brand={selectedBrand}
        handleBrandUpdated={handleBrandUpdated}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Modal */}
      <Dialog
        open={confirmationModalOpen}
        onClose={handleConfirmationModalClose}
      >
        <DialogTitle>Confirm Block</DialogTitle>
        <DialogContent>
          Are you sure you want to block this brand?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationModalClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmBlock} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Brand;
