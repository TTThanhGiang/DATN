import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  IconButton,
  Pagination,
} from "@mui/material";
import { EditOutlined, DeleteOutlined } from "@mui/icons-material";

import PageWrapper from "../../components/PageWrapper";
import ProductForm from "../../components/Admin/ProductForm";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function ProductManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;
  const token = getToken();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page]);

  const fetchProducts = async () => {
    try {
      const offset = (page - 1) * limit;
      const res = await api.get(`/admins/danh-sach-san-pham?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProducts(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/users/danh-muc");
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };
  
  const handleTabChange = (_, value) => {
    setActiveTab(value);
    setEditProduct(null);
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setActiveTab(1); // chuyển sang tab chỉnh sửa
  };

  const handleDelete = async (product) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const res = await api.delete(`/admins/xoa-san-pham/${product.ma_san_pham}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("Xóa sản phẩm thành công!");
        fetchProducts();
      } else {
        alert("Xóa thất bại: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sản phẩm!");
    }
  };

  return (
    <PageWrapper title="Quản lý sản phẩm">
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Danh sách sản phẩm" />
          <Tab label={editProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm"} />
        </Tabs>
      </Box>

      {/* Tab danh sách */}
      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Giảm giá</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.ma_san_pham} hover>
                  <TableCell>
                    <img
                      src={product.hinh_anhs?.[0]?.duong_dan || ""}
                      alt={product.ten_san_pham}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell>{product.ten_san_pham}</TableCell>
                  <TableCell>{product.ten_danh_muc}</TableCell>
                  <TableCell>{product.don_gia}</TableCell>
                  <TableCell>{product.giam_gia}</TableCell>
                  <TableCell>{product.don_vi}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton color="primary" onClick={() => handleEditClick(product)}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(product)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Stack>
        </TableContainer>
      )}

      {/* Tab Thêm / Sửa */}
      {activeTab === 1 && (
        <ProductForm
          categories={categories}
          editProduct={editProduct}
          onSuccess={() => {
            setActiveTab(0);
            setEditProduct(null);
            fetchProducts();
          }}
        />
      )}
    </PageWrapper>
  );
}
