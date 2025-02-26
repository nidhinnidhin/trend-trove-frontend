import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Rating,
  Divider,
  CircularProgress,
  Avatar,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const ProductReviews = ({
  productId,
  selectedVariantId,
  selectedSizeVariantId,
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(
          `/user/review/get/${productId}`
        );

        const filteredReviews = response.data.reviews.filter(
          (review) =>
            review.variant._id === selectedVariantId &&
            review.sizeVariant._id === selectedSizeVariantId
        );
        console.log("Reviewwww", filteredReviews);

        setReviews(filteredReviews);
        setLoading(false);
      } catch (err) {
        setError("Failed to load reviews");
        setLoading(false);
      }
    };

    if (productId && selectedVariantId && selectedSizeVariantId) {
      fetchReviews();
    }
  }, [productId, selectedVariantId, selectedSizeVariantId]);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#2c3e50",
          }}
        >
          Product Reviews ({reviews.length})
        </Typography>

        {reviews.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#f0f2f5",
              padding: "8px 16px",
              borderRadius: "20px",
            }}
          >
            <Rating
              value={Number(calculateAverageRating())}
              readOnly
              precision={0.1}
              size="small"
            />
            <Typography
              variant="body2"
              sx={{ color: "#2c3e50", fontWeight: 500 }}
            >
              {calculateAverageRating()} / 5
            </Typography>
          </Box>
        )}
      </Box>

      {reviews.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            No reviews yet for this variant. Be the first to review!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reviews.map((review, index) => (
            <Paper
              key={review._id}
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", margin:"10px 0px" }}>
                <Avatar
                  src={review.user.image}
                  sx={{ height: "30px", width: "30px", borderRadius: "50%" }}
                />

                {review.user?.username && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      margin: "0px 10px",
                      // mt: 2,
                      fontStyle: "italic",
                    }}
                  >
                    {review.user.username}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Rating value={review.rating} readOnly precision={0.5} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      mt: 0.5,
                    }}
                  >
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#2c3e50",
                    fontWeight: 500,
                  }}
                >
                  Verified Purchase
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: "#2c3e50",
                  lineHeight: 1.6,
                }}
              >
                {review.comment}
              </Typography>
              {index < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductReviews;
