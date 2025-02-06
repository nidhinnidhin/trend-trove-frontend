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
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from "@mui/material";
import { Add, Block, Search } from "@mui/icons-material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import AddProductModal from "../../modals/addProductModal";
import AddVariantModal from "../../modals/addVariantModal"; // Fixed duplicate import issue
import EditProductModal from "../../modals/editProductModal";
import AddSizeVariantModal from "../../modals/addSizeVariantModal";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditVariantModal from "../../modals/editVariantModel";

const Product = () => {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isEditVariantModalOpen, setIsEditVariantModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // Confirmation modal state
  const [productToBlock, setProductToBlock] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [variantsData, setVariantsData] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [sizeVariantModalOpen, setSizeVariantModalOpen] = useState(false);
  const [variantId, setVariantId] = useState("");
  const [sizeVariantsData, setSizeVariantsData] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});

  // Fetch products data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:9090/api/products/get"
        );
        console.log("Response data", response.data);

        if (response.data && Array.isArray(response.data)) {
          setProductsData((prevData) =>
            JSON.stringify(prevData) !== JSON.stringify(response.data)
              ? response.data
              : prevData
          );
        } else {
          setError("No products found");
        }
      } catch (err) {
        setError("Failed to fetch product data");
        console.error(err);
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
    setPage(0); // Reset to the first page when changing rows per page
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleVariantModalOpen = () => setIsVariantModalOpen(true);
  const handleVariantModalClose = () => setIsVariantModalOpen(false);

  const handleEditModalOpen = (product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditVariant = (variant) => {
    setCurrentVariant(variant); // Set the current variant
    setIsEditVariantModalOpen(true); // Open the edit variant modal
  };

  const handleEditVariantModalClose = () => {
    setIsVariantModalOpen(false);
    setCurrentProduct(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setCurrentProduct(null);
  };

  const handleProductUpdated = (product) => {
    if (product && product._id) {
      setProductsData((prevData) =>
        prevData.map((pro) => (pro._id === product._id ? product : pro))
      );
    } else {
      console.error("Invalid updated product:", product);
    }
  };

  const handleBlockProduct = (productId) => {
    setProductToBlock(productId);
    setIsConfirmationModalOpen(true); // Open confirmation modal
  };

  const handleConfirmBlock = async () => {
    if (!productToBlock) return; // Make sure there's a product ID before proceeding

    try {
      const response = await axios.patch(
        `http://localhost:9090/api/products/block/${productToBlock}` // Use productToBlock directly
      );

      if (response.status === 200) {
        setProductsData((prevData) =>
          prevData.map((product) =>
            product._id === productToBlock
              ? { ...product, isDeleted: true }
              : product
          )
        );
        setSnackbarMessage("Product successfully blocked!");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error blocking product:", error);
      setSnackbarMessage("Failed to block product.");
      setSnackbarOpen(true);
    }
  };

  const handleUnBlockProduct = async (productId) => {
    try {
      const response = await axios.patch(
        `http://localhost:9090/api/products/unblock/${productId}`
      );
      if (response.status === 200) {
        setProductsData((prevData) =>
          prevData.map((product) =>
            product._id === productId
              ? { ...product, isDeleted: false }
              : product
          )
        );
        setSnackbarMessage("Product successfully unblocked!");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error unblocking product:", error);
      setSnackbarMessage("Failed to unblock product.");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleConfirmationModalClose = () => setIsConfirmationModalOpen(false);

  const handleCloseVariantModal = () => {
    setShowVariantModal(false); // Close the AddVariantModal
  };

  const handleOpenVariantModal = (productId) => {
    setShowVariantModal(true); // Open the AddVariantModal
    setSelectedProductId(productId);
  };

  const handleToggleVariants = async (productId) => {
    if (expandedRows[productId]) {
      setExpandedRows((prev) => ({ ...prev, [productId]: false }));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:9090/api/variants/variant/get/${productId}`
      );
      const data = await response.json();
      if (response.ok) {
        setVariantsData((prev) => ({
          ...prev,
          [productId]: data.variants, // Store variants for this product
        }));
        setExpandedRows((prev) => ({ ...prev, [productId]: true }));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error fetching variants.");
    } finally {
      setLoading(false);
    }
  };

  const closeSizeVariantModal = () => {
    setSizeVariantModalOpen(false);
  };

  const handleOpenSizeVariantModal = () => {};

  const openSizeVariantModal = (variantId) => {
    console.log("VariantId", variantId);
    setVariantId(variantId);
    setSizeVariantModalOpen(true);
  };

  const handleToggleSizes = async (variantId) => {
    if (expandedSizes[variantId]) {
      setExpandedSizes((prev) => ({ ...prev, [variantId]: false }));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9090/api/sizes/sizes/${variantId}`
      );
      const data = response.data;

      if (response.status === 200) {
        setSizeVariantsData((prev) => ({
          ...prev,
          [variantId]: data.sizeVariants, // Store size variants for this variant
        }));
        setExpandedSizes((prev) => ({ ...prev, [variantId]: true }));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error fetching size variants.");
    } finally {
      setLoading(false);
    }
  };

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
            Products
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
          Add New Product
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
          backgroundColor: "#333", // Dark background for table
          borderRadius: 3,
        }}
      >
        <Table
          sx={{
            width: "100%",
            backgroundColor: "#424242", // Light black background for table
            overflow: "auto",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Name
              </TableCell>

              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Brand
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
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Add variant
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: "#212121",
                  color: "#FF9800",
                  fontWeight: "bold",
                }}
              >
                Variants
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productsData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <React.Fragment key={product._id}>
                  <TableRow>
                    <TableCell sx={{ color: "#ffffff" }}>
                      {product.name ? product.name.slice(0, 30) : "N/A"}...
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      {product.category.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      {product.brand.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff" }}>
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditModalOpen(product)}
                        sx={{
                          backgroundColor: "#FF9800",
                          color: "white",
                          "&:hover": { backgroundColor: "#FFB74D" },
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>
                      {product.isDeleted ? (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Block />}
                          sx={{
                            backgroundColor: "black",
                            color: "gray",
                          }}
                          onClick={() => handleUnBlockProduct(product._id)}
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
                            color: "#FF9800",
                          }}
                          onClick={() => handleBlockProduct(product._id)}
                        >
                          Block
                        </Button>
                      )}
                    </TableCell>

                    {/* Add Variant Button */}
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenVariantModal(product._id)}
                        sx={{
                          backgroundColor: "#FF9800",
                          width: "100px",
                          color: "white",
                          "&:hover": { backgroundColor: "#FFB74D" },
                        }}
                      >
                        +Variant
                      </Button>
                    </TableCell>

                    {/* Show Variants Button */}
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleToggleVariants(product._id)}
                        sx={{
                          backgroundColor: "#FF9800",
                          width: "150px",
                          color: "white",
                          "&:hover": { backgroundColor: "#FFB74D" },
                        }}
                      >
                        {expandedRows[product._id]
                          ? "Hide Variants"
                          : "Variants"}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Row for Variants - Collapse below the clicked row */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ paddingBottom: 0 }}>
                      <Collapse
                        in={expandedRows[product._id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ marginTop: 2 }}>
                          {loading && <p>Loading variants...</p>}
                          {error && <p>{error}</p>}
                          {variantsData[product._id] &&
                          variantsData[product._id].length > 0 ? (
                            <Table sx={{ width: "100%" }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ color: "#FF9800" }}>
                                    Color
                                  </TableCell>
                                  <TableCell sx={{ color: "#FF9800" }}>
                                    Main Image
                                  </TableCell>
                                  <TableCell sx={{ color: "#FF9800" }}>
                                    Color Image
                                  </TableCell>
                                  <TableCell sx={{ color: "#FF9800" }}>
                                    Edit Sizes
                                  </TableCell>
                                  <TableCell sx={{ color: "#FF9800" }}>
                                    Add Sizes
                                  </TableCell>
                                  <TableCell sx={{ color: "#FF9800" }}>
                                    Available Sizes
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {variantsData[product._id].map((variant) => (
                                  <TableRow key={variant._id}>
                                    <TableCell sx={{ color: "#ffffff" }}>
                                      {variant.color || "N/A"}
                                    </TableCell>
                                    <TableCell sx={{ color: "#ffffff" }}>
                                      {variant.mainImage ? (
                                        <img
                                          src={variant.mainImage}
                                          alt={variant.color}
                                          width="90"
                                          height="90"
                                          style={{ objectFit: "contain" }}
                                        />
                                      ) : (
                                        "N/A"
                                      )}
                                    </TableCell>
                                    <TableCell sx={{ color: "#ffffff" }}>
                                      {variant.colorImage ? (
                                        <img
                                          src={variant.colorImage}
                                          alt={variant.color}
                                          width="90"
                                          height="90"
                                          style={{ objectFit: "contain" }}
                                        />
                                      ) : (
                                        "N/A"
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<EditIcon />}
                                        onClick={() =>
                                          handleEditVariant(variant)
                                        } 
                                        sx={{
                                          backgroundColor: "#FF9800",
                                          width: "100px",
                                          color: "white",
                                          "&:hover": {
                                            backgroundColor: "#FFB74D",
                                          },
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() =>
                                          openSizeVariantModal(variant._id)
                                        }
                                        sx={{
                                          backgroundColor: "#FF9800",
                                          width: "100px",
                                          color: "white",
                                          "&:hover": {
                                            backgroundColor: "#FFB74D",
                                          },
                                        }}
                                      >
                                        +Size
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      {variant.sizes &&
                                      variant.sizes.length > 0 ? (
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          onClick={() =>
                                            handleToggleSizes(variant._id)
                                          }
                                          sx={{
                                            backgroundColor: "#FF9800",
                                            width: "100px",
                                            color: "white",
                                            "&:hover": {
                                              backgroundColor: "#FFB74D",
                                            },
                                          }}
                                        >
                                          Sizes
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="contained"
                                          color="primary"
                                          disabled
                                          sx={{
                                            backgroundColor: "gray",
                                            width: "100px",
                                            color: "white",
                                          }}
                                        >
                                          No Sizes
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} sx={{ color: "#ffffff" }}>
                                No variants available for this product.
                              </TableCell>
                            </TableRow>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>

                  {/* Sizes collapse for each variant */}
                  {variantsData[product._id]?.map((variant) => (
                    <TableRow key={variant._id}>
                      <TableCell colSpan={8} sx={{ paddingBottom: 0 }}>
                        <Collapse
                          in={expandedSizes[variant._id]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ marginTop: 2 }}>
                            {sizeVariantsData[variant._id] &&
                            sizeVariantsData[variant._id].length > 0 ? (
                              <Table sx={{ width: "100%" }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      Size
                                    </TableCell>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      Price
                                    </TableCell>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      Discount Price
                                    </TableCell>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      In Stock
                                    </TableCell>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      Stock Count
                                    </TableCell>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      Description
                                    </TableCell>
                                    <TableCell sx={{ color: "#FF9800" }}>
                                      Edit
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sizeVariantsData[variant._id].map(
                                    (sizeVariant, index) => (
                                      <TableRow key={index}>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          {sizeVariant.size}
                                        </TableCell>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          {sizeVariant.price}
                                        </TableCell>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          {sizeVariant.discountPrice}
                                        </TableCell>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          {sizeVariant.inStock ? "Yes" : "No"}
                                        </TableCell>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          {sizeVariant.stockCount}
                                        </TableCell>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          {sizeVariant.description}
                                        </TableCell>
                                        <TableCell sx={{ color: "#ffffff" }}>
                                          <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<EditIcon />}
                                            // onClick={() =>
                                            //   handleEditModalOpen(product)
                                            // }
                                            sx={{
                                              backgroundColor: "#FF9800",
                                              color: "white",
                                              "&:hover": {
                                                backgroundColor: "#FFB74D",
                                              },
                                            }}
                                          >
                                            Edit
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  sx={{ color: "#ffffff" }}
                                >
                                  No size variants available for this variant.
                                </TableCell>
                              </TableRow>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={productsData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          backgroundColor: "#333", // Dark background for pagination
          color: "#FF9800", // Orange color for pagination
        }}
      />

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmationModalOpen}
        onClose={handleConfirmationModalClose}
      >
        <DialogTitle>Confirm Block</DialogTitle>
        <DialogContent>
          Are you sure you want to block this Product?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleConfirmationModalClose}
            sx={{ color: "#FF9800" }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmBlock} sx={{ color: "#FF9800" }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modals */}
      <AddProductModal open={isModalOpen} onClose={handleModalClose} />
      <EditProductModal
        open={isEditModalOpen}
        handleClose={handleEditModalClose}
        product={currentProduct}
        handleProductUpdated={handleProductUpdated}
      />
      <AddVariantModal
        open={showVariantModal} // Control the visibility
        onClose={handleCloseVariantModal} // Close the variant modal
        productId={selectedProductId}
      />
      <AddSizeVariantModal
        open={sizeVariantModalOpen}
        onClose={closeSizeVariantModal}
        variantId={variantId}
      />
      <EditVariantModal
        open={isEditVariantModalOpen}
        onClose={handleEditVariantModalClose}
        variant={currentVariant}
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
    </Box>
  );
};

export default Product;
