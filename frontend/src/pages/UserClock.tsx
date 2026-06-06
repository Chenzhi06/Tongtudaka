import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MyTasksCard from '../components/MyTasksCard';
import FriendTasksCards from '../components/FriendTasksCards';

const UserClock: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(false);
  }, [user]);

  const handleError = (msg: string) => {
    setError(msg);
  };

  const handleClearError = () => {
    setError('');
  };

  const isToday = selectedDate.isSame(dayjs(), 'day');
  const isFuture = selectedDate.isAfter(dayjs(), 'day');

  const minDate = dayjs('2026-06-01');
  const maxDate = dayjs();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">互督打卡</Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label=""
            value={selectedDate}
            onChange={(newValue) => newValue && setSelectedDate(newValue)}
            minDate={minDate}
            maxDate={maxDate}
            showDaysOutsideCurrentMonth
            slotProps={{
              textField: {
                sx: {
                  width: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                },
              },
              day: {
                sx: {
                  '&.Mui-selected': {
                    backgroundColor: isToday ? '#ef4444' : '#1976d2',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: isToday ? '#dc2626' : '#1565c0',
                    },
                  },
                  '&[aria-label="今天"]': {
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #fff',
                    '&:hover': {
                      backgroundColor: '#dc2626',
                    },
                  },
                  '&.Mui-disabled': {
                    color: '#9ca3af',
                    cursor: 'not-allowed',
                  },
                  '&:not(.Mui-disabled):not(.Mui-selected)': {
                    color: isFuture ? '#9ca3af' : '#000',
                  },
                },
              },
            }}
            slots={{
              openPickerIcon: CalendarToday,
            }}
          />
        </LocalizationProvider>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={4}>
          <MyTasksCard
            selectedDate={selectedDate}
            onError={handleError}
            onClearError={handleClearError}
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <FriendTasksCards
            selectedDate={selectedDate}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserClock;
