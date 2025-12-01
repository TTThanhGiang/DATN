import React, { useState, useEffect } from "react";
import { Stack, TextField, OutlinedInput, IconButton, Button, Divider } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import CategorySelectorModal from "./CategorySelectorModal";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function ProductForm({ categories, editProduct, onSuccess }) {
  const [tenSanPham, setTenSanPham] = useState("");
  const [gia, setGia] = useState("");
  const [giamGia, setGiamGia] = useState("");
  const [donVi, setDonVi] = useState("");
  const [mota, setMoTa] = useState("");
  const [selectCategory, setSelectCategory] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const token = getToken();

  // Khi editProduct thay đổi => set dữ liệu form và danh mục
  useEffect(() => {
    if (editProduct) {
      setTenSanPham(editProduct.ten_san_pham || "");
      setGia(editProduct.don_gia || "");
      setGiamGia(editProduct.giam_gia || "");
      setDonVi(editProduct.don_vi || "");
      setMoTa(editProduct.mo_ta || "");
      setImagePreview(editProduct.hinh_anhs?.[0]?.duong_dan || "");

      // Tìm danh mục theo ma_danh_muc
      let selectedCat = null;
      for (const cat of categories) {
        if (cat.danh_muc_con) {
          selectedCat = cat.danh_muc_con.find(dc => dc.ma_danh_muc === editProduct.ma_danh_muc);
          if (selectedCat) break;
        }
      }
      setSelectCategory(selectedCat || null);
    } else {
      // reset form khi thêm mới
      setTenSanPham("");
      setGia("");
      setGiamGia("");
      setDonVi("");
      setMoTa("");
      setSelectCategory(null);
      setImageFile(null);
      setImagePreview("");
    }
  }, [editProduct, categories]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!tenSanPham || !gia || !donVi || !selectCategory) {
      alert("Vui lòng nhập đầy đủ thông tin và chọn danh mục!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ten_san_pham", tenSanPham);
      formData.append("don_gia", gia);
      formData.append("giam_gia", giamGia || 0);
      formData.append("don_vi", donVi);
      formData.append("ma_danh_muc", selectCategory.ma_danh_muc);
      formData.append("mo_ta", mota || "");
      if (imageFile) {
        formData.append("hinh_anh", imageFile);
      } else {
        formData.append("hinh_anh", new Blob([]), ""); 
      }

      let res;
      if (editProduct) {
        // update
        res = await api.put(`/admins/cap-nhat-san-pham/${editProduct.ma_san_pham}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // create
        res = await api.post("/admins/them-san-pham", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (res.data.success) {
        alert(editProduct ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
        if (onSuccess) onSuccess();
      } else {
        alert("Thất bại: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu sản phẩm!");
    }
  };

  return (
    <Stack spacing={3}>
      <TextField fullWidth label="Tên sản phẩm" value={tenSanPham} onChange={(e) => setTenSanPham(e.target.value)} />
      <TextField fullWidth label="Giá" value={gia} onChange={(e) => setGia(e.target.value)} />
      <TextField fullWidth label="Giảm giá / %" value={giamGia} onChange={(e) => setGiamGia(e.target.value)} />
      <TextField fullWidth label="Đơn vị" value={donVi} onChange={(e) => setDonVi(e.target.value)} />

      <Stack sx={{ gap: 1 }}>
        <OutlinedInput
          value={selectCategory ? selectCategory.ten_danh_muc : ""}
          placeholder="Chọn danh mục..."
          readOnly
          fullWidth
          endAdornment={
            <IconButton onClick={() => setCategoryModalOpen(true)}>
              <ArrowDropDownIcon />
            </IconButton>
          }
          onClick={() => setCategoryModalOpen(true)}
        />
      </Stack>

      <Stack>
        {imagePreview && <img src={imagePreview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }} />}
        <TextField type="file" onChange={handleImageChange} />
      </Stack>

      <TextField fullWidth label="Mô tả" multiline minRows={3} value={mota} onChange={(e) => setMoTa(e.target.value)} />

      <Divider sx={{ my: 2 }} />
      <Stack justifyContent="center">
        <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleSubmit}>
          {editProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </Stack>

      <CategorySelectorModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onSelect={(cat) => setSelectCategory(cat)}
      />
    </Stack>
  );
}
