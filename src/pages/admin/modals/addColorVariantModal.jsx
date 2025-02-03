// import React, { useState } from "react";
// import {
//   Modal,
//   Box,
//   TextField,
//   Button,
//   Grid,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { Controller, useForm } from "react-hook-form";

// const AddColorVariantModal = ({ open, onClose }) => {
//   const [colors, setColors] = useState(["Red", "Blue", "Green", "Black", "White"]); // Example color list

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = (data) => {
//     console.log("Color Variant Data:", data);
//     // Handle creating the color variant logic here (e.g., API call)
//     alert("Color variant added!");
//     onClose(); // Close the modal after adding the color variant
//   };

//   return (
//     <Modal open={open} onClose={onClose}>
//       <Box
//         sx={{
//           width: "40%",
//           margin: "auto",
//           backgroundColor: "white",
//           padding: 4,
//           borderRadius: 2,
//           marginTop: "5%",
//         }}
//       >
//         <Box sx={{ fontSize: "24px", fontWeight: "bold", marginBottom: 2 }}>
//           Add Color Variant
//         </Box>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <Grid container spacing={2}>
//             {/* Select Color */}
//             <Grid item xs={12}>
//               <Controller
//                 name="color"
//                 control={control}
//                 rules={{ required: "Color is required" }}
//                 render={({ field }) => (
//                   <FormControl fullWidth error={!!errors.color}>
//                     <InputLabel>Color</InputLabel>
//                     <Select {...field} label="Color">
//                       {colors.map((color, index) => (
//                         <MenuItem key={index} value={color}>
//                           {color}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.color && <p>{errors.color.message}</p>}
//                   </FormControl>
//                 )}
//               />
//             </Grid>

//             {/* SKU */}
//             <Grid item xs={12}>
//               <Controller
//                 name="sku"
//                 control={control}
//                 rules={{ required: "SKU is required" }}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="SKU"
//                     fullWidth
//                     error={!!errors.sku}
//                     helperText={errors.sku?.message}
//                     placeholder="Enter SKU for the color variant"
//                   />
//                 )}
//               />
//             </Grid>

//             {/* Submit Button */}
//             <Grid item xs={12}>
//               <Button
//                 variant="contained"
//                 type="submit"
//                 fullWidth
//                 sx={{
//                   backgroundColor: "orange",
//                   "&:hover": { backgroundColor: "darkorange" },
//                 }}
//               >
//                 Add Color Variant
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </Box>
//     </Modal>
//   );
// };

// export default AddColorVariantModal;
