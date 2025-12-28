import React, { useState, useEffect } from "react";
import { Stack, TextField, OutlinedInput, IconButton, Button, Divider } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import CategorySelectorModal from "./ModalChonDanhMuc";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function FormSanPham({ danhSachDanhMuc, sanPhamSua, khiThanhCong }) {
  const [tenSanPham, setTenSanPham] = useState("");
  const [gia, setGia] = useState("");
  const [giamGia, setGiamGia] = useState("");
  const [donVi, setDonVi] = useState("");
  const [mota, setMoTa] = useState("");
  const [selectCategory, setSelectCategory] = useState(null);


  const [fileAnh, setFileAnh] = useState(null);
  const [xemTruocAnh, setXemTruocAnh] = useState("");
  const [modalDanhMucMo, setModalDanhMucMo] = useState(false);

  const token = getToken();

  // Khi editProduct thay đổi => set dữ liệu form và danh mục
  useEffect(() => {
    if (sanPhamSua) {
      setTenSanPham(sanPhamSua.ten_san_pham || "");
      setGia(sanPhamSua.don_gia || "");
      setGiamGia(sanPhamSua.giam_gia || "");
      setDonVi(sanPhamSua.don_vi || "");
      setMoTa(sanPhamSua.mo_ta || "");
      setXemTruocAnh(sanPhamSua.hinh_anhs?.[0]?.duong_dan || "");

      const danhMuc = danhSachDanhMuc.find(d => d.ma_danh_muc == sanPhamSua.ma_danh_muc)
      setSelectCategory(danhMuc || null);
    } else {
      // reset form khi thêm mới
      setTenSanPham("");
      setGia("");
      setGiamGia("");
      setDonVi("");
      setMoTa("");
      setSelectCategory(null);
      setFileAnh(null);
      setXemTruocAnh("");
    }
  }, [sanPhamSua, danhSachDanhMuc]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnh(file);
      setXemTruocAnh(URL.createObjectURL(file));
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
      if (fileAnh) {
        formData.append("hinh_anh", fileAnh);
      } else {
        formData.append("hinh_anh", new Blob([]), ""); 
      }

      let res;
      if (sanPhamSua) {
        // update
        res = await api.put(`/admins/cap-nhat-san-pham/${sanPhamSua.ma_san_pham}`, formData, {
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
        alert(sanPhamSua ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
        if (khiThanhCong) khiThanhCong();
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
            <IconButton onClick={() => setModalDanhMucMo(true)}>
              <ArrowDropDownIcon />
            </IconButton>
          }
          onClick={() => setModalDanhMucMo(true)}
        />
      </Stack>

      <Stack>
        {xemTruocAnh && <img src={xemTruocAnh} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }} />}
        <TextField type="file" onChange={handleImageChange} />
      </Stack>

      <TextField fullWidth label="Mô tả" multiline minRows={3} value={mota} onChange={(e) => setMoTa(e.target.value)} />

      <Divider sx={{ my: 2 }} />
      <Stack justifyContent="center">
        <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleSubmit}>
          {sanPhamSua ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </Button>
      </Stack>

      <CategorySelectorModal
        mo={modalDanhMucMo}
        dong={() => setModalDanhMucMo(false)}
        danhSachDanhMuc={danhSachDanhMuc}
        khiChon={(cat) => setSelectCategory(cat)}
      />
    </Stack>
  );
}
