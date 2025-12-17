import { useState } from "react";
import { Button } from "@mui/material";

function NutLayMa({ maCode }) {
  const [daHienMa, setDaHienMa] = useState(false);

  const xuLyClick = async () => {
    if (!daHienMa) {
      setDaHienMa(true);
    } else {
      await navigator.clipboard.writeText(maCode);
      alert("Đã sao chép mã!");
    }
  };

  return (
    <Button
      size="small"
      sx={{
        mt: 0.5,
        alignSelf: "flex-start",
        height: 26,
        fontSize: 10,
        backgroundColor: daHienMa ? "#E6FFF0" : "#F0FFF3",
        border: "1px solid #dcdcdc",
        color: "#007E42",
        borderRadius: 1,
        whiteSpace: "nowrap",
      }}
      onClick={xuLyClick}
    >
      {daHienMa ? maCode : "Lấy mã"}
    </Button>
  );
}

export default NutLayMa;
