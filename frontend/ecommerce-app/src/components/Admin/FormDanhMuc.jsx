import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import api from "../../api";
import { Stack, TextField, OutlinedInput, IconButton, Button, Divider } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import ModalChonDanhMuc from "./ModalChonDanhMuc";

export default function FormDanhMuc({ danhSachDanhMuc, danhMucChinhSua, khiThanhCong }) {
    const [tenDanhMuc, setTenDanhMuc] = useState("");
    const [moTa, setMoTa] = useState("");
    const [danhMucChaDaChon, setDanhMucChaDaChon] = useState(null);

    const [fileHinhAnh, setFileHinhAnh] = useState(null);
    const [previewHinhAnh, setPreviewHinhAnh] = useState("");
    const [modalChonDanhMucMo, setModalChonDanhMucMo] = useState(false);

    const token = getToken();

    const timDanhMucCha = (cayDanhMuc, maCon) => {
        for (const node of cayDanhMuc) {
            if (node.danh_muc_con?.some(con => con.ma_danh_muc === maCon)) {
                return node;
            }
            const ketQua = timDanhMucCha(node.danh_muc_con || [], maCon);
            if (ketQua) return ketQua;
        }
        return null;
    };

    useEffect(() => {
        if (danhMucChinhSua) {
            setTenDanhMuc(danhMucChinhSua.ten_danh_muc);
            setMoTa(danhMucChinhSua.mo_ta);
            setPreviewHinhAnh(danhMucChinhSua.hinh_anhs?.[0]?.duong_dan || "");
            setFileHinhAnh(null);

            const danhMucCha = danhSachDanhMuc.find(dm => dm.ma_danh_muc === danhMucChinhSua.danh_muc_cha);
            const danhMucChaTuCay = timDanhMucCha(danhSachDanhMuc, danhMucChinhSua.ma_danh_muc);
            setDanhMucChaDaChon(danhMucCha || danhMucChaTuCay || null);
        } else {
            setTenDanhMuc("");
            setMoTa("");
            setDanhMucChaDaChon(null);
            setFileHinhAnh(null);
            setPreviewHinhAnh("");
        }
    }, [danhMucChinhSua, danhSachDanhMuc]);

    const xuLyThayDoiHinhAnh = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileHinhAnh(file);
            setPreviewHinhAnh(URL.createObjectURL(file));
        }
    };

    const xuLyLuuDanhMuc = async () => {
        if (!tenDanhMuc) {
            alert("Tên danh mục không được để trống");
            return;
        }

        const formData = new FormData();
        formData.append("ten_danh_muc", tenDanhMuc);
        formData.append("mo_ta", moTa || "");
        formData.append("danh_muc_cha", danhMucChaDaChon ? danhMucChaDaChon.ma_danh_muc : 0);

        if (fileHinhAnh) {
            formData.append("hinh_anh", fileHinhAnh);
        } else {
            formData.append("hinh_anh", new Blob([]), ""); 
        }
        console.log(formData)

        try {
            let res;
            if (danhMucChinhSua) {
                res = await api.put(`/admins/cap-nhat-danh-muc/${danhMucChinhSua.ma_danh_muc}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                res = await api.post(`/admins/them-danh-muc`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            if (res.data.success) {
                alert(danhMucChinhSua ? "Cập nhật thành công!" : "Tạo danh mục thành công!");
                khiThanhCong?.();
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu danh mục!");
        }
    };

    return (
        <Stack spacing={3}>
            <TextField fullWidth label="Tên danh mục" value={tenDanhMuc} onChange={(e) => setTenDanhMuc(e.target.value)} />
            <TextField fullWidth label="Mô tả" value={moTa} onChange={(e) => setMoTa(e.target.value)} />

            {/* Chọn danh mục cha */}
            <OutlinedInput
                value={danhMucChaDaChon ? danhMucChaDaChon.ten_danh_muc : ""}
                placeholder="Chọn danh mục cha..."
                readOnly
                fullWidth
                endAdornment={
                    <IconButton onClick={() => setModalChonDanhMucMo(true)}>
                        <ArrowDropDownIcon />
                    </IconButton>
                }
                onClick={() => setModalChonDanhMucMo(true)}
            />

            {/* Upload hình ảnh */}
            <Stack>
                {previewHinhAnh && (
                    <img
                        src={previewHinhAnh}
                        alt="preview"
                        style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }}
                    />
                )}
                <TextField type="file" onChange={xuLyThayDoiHinhAnh} />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={xuLyLuuDanhMuc}>
                {danhMucChinhSua ? "Lưu thay đổi" : "Tạo danh mục"}
            </Button>

            <ModalChonDanhMuc
                mo={modalChonDanhMucMo}
                dong={() => setModalChonDanhMucMo(false)}
                danhSachDanhMuc={danhSachDanhMuc}
                khiChon={(cat) => {
                    setDanhMucChaDaChon(cat);
                    setModalChonDanhMucMo(false);
                }}
            />
        </Stack>
    );
}
