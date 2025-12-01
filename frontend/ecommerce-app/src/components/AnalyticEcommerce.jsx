import PropTypes from "prop-types";
// Material UI
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
// Icons
import { RiseOutlined, FallOutlined } from "@ant-design/icons";

// Custom style cho icon nhỏ trong chip
const iconSX = { fontSize: "0.75rem", color: "inherit", marginLeft: 0, marginRight: 0 };

export default function AnalyticEcommerce({
  color = "primary",
  title,
  count,
  percentage,
  isLoss = false,
  extra
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Stack spacing={1}>
        {/* Tiêu đề nhỏ */}
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>

        {/* Giá trị + phần trăm tăng/giảm */}
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="h4" color="text.primary">
              {count}
            </Typography>
          </Grid>

          {percentage !== undefined && (
            <Grid item>
              <Chip
                color={color}
                icon={
                  isLoss ? (
                    <FallOutlined style={iconSX} />
                  ) : (
                    <RiseOutlined style={iconSX} />
                  )
                }
                label={`${percentage}%`}
                sx={{
                  fontWeight: 500,
                  pl: 0.5,
                  pr: 0.5,
                  height: 24,
                }}
                size="small"
              />
            </Grid>
          )}
        </Grid>

        {/* Extra text */}
        {extra && (
          <Typography variant="caption" color="text.secondary">
            <Typography
              component="span"
              variant="caption"
              sx={{ color: `${color}.main`, fontWeight: 500 }}
            >
              {extra}
            </Typography>{" "}
            trong năm nay
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

AnalyticEcommerce.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string.isRequired,
  count: PropTypes.string.isRequired,
  percentage: PropTypes.number,
  isLoss: PropTypes.bool,
  extra: PropTypes.string,
};
