import { useFormik } from "formik";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import TextField from "@mui/material/TextField";
import * as yup from "yup";

import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserProvider";

const validationSchema = yup.object({
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string("Enter your password")
    .min(3, "Password should be of minimum 3 characters length")
    .required("Password is required"),
});

export const LoginForm = () => {
  const { login } = useUser();
  const navigateTo = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "garry@mysu.pro",
      password: "sgba",
    },
    validationSchema: validationSchema,

    onSubmit: async (values) => {
      const success = await login(values);

      if (success) {
        navigateTo("/main");
      }
    },
  });
  // garry@mysu.pro
  // sgba
  return (
    <Box sx={{ display: "flex" }}>
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: "flex", minWidth: "600px", gap: 2, mb: 5 }}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formik.values.password}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Box>
        <Button color="primary" variant="contained" fullWidth type="submit">
          Autorize
        </Button>
      </form>
    </Box>
  );
};
