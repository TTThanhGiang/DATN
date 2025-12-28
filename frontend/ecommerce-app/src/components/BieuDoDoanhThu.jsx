import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Stack, Typography, Paper } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import api from '../api';

/* =======================
   CUSTOM LEGEND
======================= */
function RevenueLegend({ color }) {
  return (
    <Stack direction="row" spacing={4} justifyContent="center">
      {/* Kỳ này */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: '50%' }} />
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Kỳ này
        </Typography>
      </Stack>

      {/* Kỳ trước */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: `2px dashed ${color}`,
            opacity: 0.7,
          }}
        />
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Kỳ trước
        </Typography>
      </Stack>
    </Stack>
  );
}

export default function RevenueChart({  data, loading  }) {
  const chartData = data || {
    labels: [],
    hien_tai: [],
    ky_truoc: [],
  };

  const MAIN_COLOR = '#0050B3';
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        height: '100%',
        position: 'relative',
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2} color="primary">
        📊 Phân tích doanh thu
      </Typography>

      <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
        {loading ? (
          <Stack height="100%" alignItems="center" justifyContent="center">
            <CircularProgress size={30} />
          </Stack>
        ) : (
          <>
            <LineChart
              xAxis={[{ scaleType: 'point', data: chartData.labels }]}
              yAxis={[
                {
                  valueFormatter: (v) =>
                    `${(v / 1_000_000).toLocaleString()}M ₫`,
                },
              ]}
              series={[
                {
                  id: 'curr',
                  data: chartData.hien_tai,
                  label: 'Kỳ này',
                  color: MAIN_COLOR,
                  area: true,
                  showMark: false,
                },
                {
                  id: 'prev',
                  data: chartData.ky_truoc,
                  label: 'Kỳ trước',
                  color: MAIN_COLOR,
                  showMark: false,
                },
              ]}
              slotProps={{
                legend: { hidden: true },
                tooltip: {
                  trigger: 'axis',
                  valueFormatter: (v) =>
                    `${v.toLocaleString()} ₫`,
                },
              }}
              sx={{
                '& .MuiLineElement-series-curr': { strokeWidth: 3 },
                '& .MuiLineElement-series-prev': {
                  strokeDasharray: '6 4',
                  strokeWidth: 2,
                  opacity: 0.6,
                },
                '& .MuiAreaElement-series-curr': {
                  fill: "url('#revenueGradient')",
                  opacity: 0.25,
                },
                /* Tooltip mark tuỳ chỉnh */
                '& .MuiChartsTooltip-mark[data-seriesid="curr"]': {
                  stroke: MAIN_COLOR,
                  strokeWidth: 3,
                  fill: MAIN_COLOR,
                },
                '& .MuiChartsTooltip-mark[data-seriesid="prev"]': {
                  stroke: MAIN_COLOR,
                  strokeDasharray: '6 4',
                  strokeWidth: 2,
                  fill: 'none',
                  opacity: 0.7,
                },
              }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MAIN_COLOR} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={MAIN_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
            </LineChart>

            {/* Legend nằm trong chart container */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <RevenueLegend color={MAIN_COLOR} />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}