import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import api from "../../api";
import { Stack, TextField, OutlinedInput, IconButton, Button, Divider } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import CategorySelectorModal from "./CategorySelectorModal";



export default function CategoryForm({categories, editCategory, onSuccess}){
    const [tenDanhMuc, setTenDanhMuc] = useState("");
    const [moTa, setMoTa] = useState("");
    const [selectCategory, setSelectCategory] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const token = getToken();

    const findParentCategory = (tree, childId) => {
        for (const node of tree) {
            if (node.danh_muc_con?.some(child => child.ma_danh_muc === childId)) {
                return node;
            }
            const deepSearch = findParentCategory(node.danh_muc_con || [], childId);
            if (deepSearch) return deepSearch;
        }
        return null;
    };

    useEffect(() => {
        if(editCategory){
            setTenDanhMuc(editCategory.ten_danh_muc);
            setMoTa(editCategory.mo_ta);
            setImagePreview(editCategory.hinh_anhs?.[0]?.duong_dan || "");
            setImageFile(null);

            // Nếu editCategory có danh_muc_cha, lấy trực tiếp từ categoriesFull
            const parentCat = categories.find(cat => cat.ma_danh_muc === editCategory.danh_muc_cha);
            // setSelectCategory(parentCat || null);

            // Nếu muốn dùng cây con như trước, có thể fallback
            const parentFromTree = findParentCategory(categories, editCategory.ma_danh_muc);
            setSelectCategory(parentCat || parentFromTree || null);
        } else {
            setTenDanhMuc("");
            setMoTa("");
            setSelectCategory(null);
            setImageFile(null);
            setImagePreview("");
        }
    }, [editCategory, categories]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!tenDanhMuc) {
            alert("Tên danh mục không được để trống");
            return;
        }
        const formData = new FormData();
        formData.append("ten_danh_muc", tenDanhMuc);
        formData.append("mo_ta", moTa || "");
        formData.append("danh_muc_cha", selectCategory ? selectCategory.ma_danh_muc : "");

        if (imageFile) {
            formData.append("hinh_anh", imageFile);
        } else {
            formData.append("hinh_anh", new Blob([]), ""); 
        }

        try {
        let res;
        if (editCategory) {
            res = await api.put(`/admins/cap-nhat-danh-muc/${editCategory.ma_danh_muc}`, formData, {
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
            alert(editCategory ? "Cập nhật thành công!" : "Tạo danh mục thành công!");
            onSuccess?.();
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
            {console.log("Danh mục cha:", selectCategory)}
            <OutlinedInput
                value={selectCategory ? selectCategory.ten_danh_muc : ""}
                placeholder="Chọn danh mục cha..."
                readOnly
                fullWidth
                endAdornment={
                <IconButton onClick={() => setCategoryModalOpen(true)}>
                    <ArrowDropDownIcon />
                </IconButton>
                }
            />

            <Stack>
                {imagePreview && (
                <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }}
                />
                )}
                <TextField type="file" onChange={handleImageChange} />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleSubmit}>
                {editCategory ? "Lưu thay đổi" : "Tạo danh mục"}
            </Button>

            <CategorySelectorModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                categories={categories}
                onSelect={(cat) => {
                setSelectCategory(cat);
                setCategoryModalOpen(false); // đóng modal khi chọn
                }}
            />
        </Stack>
    );
}