import { useState, useEffect } from "react";
import {
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Box,
  Typography,
  ListItemIcon,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useNavigate } from "react-router-dom";
import api from "../../../api";

export default function Sidebar({ onSelectCategory }) {
  const [categories, setCategories] = useState([]); // state danh mục
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/users/danh-muc"); // API của bạn
        if (res.data.success) {
          setCategories(res.data.data); // lưu danh sách danh mục cha
        }
      } catch (error) {
        console.error("Lấy danh mục thất bại:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSelectSubCategory = (cat, subcat) => {
    navigate(`/danh-muc/${cat.ma_danh_muc}/${subcat.ma_danh_muc}`);
    onSelectCategory?.(`${cat.ten_danh_muc} / ${subcat.ten_danh_muc}`);
  };
  const handleGoToMegaSale = () => {
    navigate("/khuyen-mai");
  };
  return (
    <Box>
      <List disablePadding>
        {categories.map((cat, index) => (
          <Box key={cat.ma_danh_muc}>
            {/* --- Danh mục cha --- */}
            <ListItemButton
              onClick={() => handleToggle(index)}
              sx={{
                py: 1,
                px: 2,
                "&:hover": { bgcolor: "#F0FFF3" },
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #f2f2f2",
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#0c0f0dff", textTransform: "uppercase" }}
                  >
                    {cat.ten_danh_muc}
                  </Typography>
                }
              />
              {openIndex === index ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            {/* --- Danh mục con --- */}
            <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
              <List
                component="div"
                disablePadding
                sx={{
                  bgcolor: "#FAFAFA",
                  borderLeft: "3px solid #E6F9EE",
                  transition: "all 0.3s ease",
                }}
              >
                {cat.danh_muc_con?.map((subcat) => (
                  <ListItemButton
                    key={subcat.ma_danh_muc}
                    onClick={() => handleSelectSubCategory(cat, subcat)}
                    sx={{
                      py: 0.8,
                      borderRadius: 1,
                      "&:hover": { bgcolor: "#E6F9EE" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: 13, color: "#333" }}>
                          {subcat.ten_danh_muc}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Box>
  );
}
