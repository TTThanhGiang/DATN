import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Autocomplete,
} from "@mui/material";

export default function DiaChiDialog({ mo, dong, onXacNhan }) {
  const [danhSachTinhThanh, setDanhSachTinhThanh] = useState([]);
  const [danhSachXa, setDanhSachXa] = useState([]);

  const [tinhThanh, setTinhThanh] = useState(null);
  const [xaPhuong, setXaPhuong] = useState(null);
  const [diaChiChiTiet, setDiaChiChiTiet] = useState("");

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/?depth=2")
      .then((res) => res.json())
      .then((data) => setDanhSachTinhThanh(data))
      .catch((err) => console.error("Lỗi tải tỉnh thành:", err));
  }, []);

  const xuLyXacNhan = () => {
    if (!tinhThanh || !xaPhuong || !diaChiChiTiet.trim()) {
      alert("Vui lòng nhập đầy đủ địa chỉ");
      return;
    }

    const diaChiDayDu = `${diaChiChiTiet}, ${xaPhuong.name}, ${tinhThanh.name}`;
    onXacNhan(diaChiDayDu);
    dong();
  };

  return (
    <Dialog open={mo} onClose={dong} fullWidth maxWidth="sm">
      <DialogTitle>📍 Chọn địa chỉ giao hàng</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

            <Autocomplete
                options={danhSachTinhThanh}
                getOptionLabel={option => option.name}
                value={tinhThanh}
                onChange={(e, giaTriMoi) => {
                    setTinhThanh(giaTriMoi);
                    setDanhSachXa(giaTriMoi?.wards || []);
                    setXaPhuong(null);
                }}
                renderInput={params => <TextField {...params} label="Tỉnh / Thành phố" />}
            />
            <Autocomplete
                options={danhSachXa}
                getOptionLabel={option => option.name}
                value={xaPhuong}
                onChange={(e, giaTriMoi) => setXaPhuong(giaTriMoi)}
                renderInput={params => <TextField {...params} label="Xã / Phường" />}
            />

          <TextField
            label="Địa chỉ chi tiết"
            placeholder="Số nhà, tên đường..."
            value={diaChiChiTiet}
            onChange={(e) => setDiaChiChiTiet(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={dong}>Hủy</Button>
        <Button variant="contained" onClick={xuLyXacNhan}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}
