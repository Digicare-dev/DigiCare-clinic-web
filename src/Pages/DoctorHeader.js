import React, { useState, useEffect } from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";
import styles from "./DoctorHeader.module.css";

const DoctorHeader = ({ doctorName }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString();
  };

  return (
    <Box className={styles.headerContainer}>
      <Typography variant="h6" className={styles.doctorName}>
        Doctor: {doctorName}
      </Typography>
      <Typography variant="h6" className={styles.date}>
        Date: {formatDate(currentTime)}
      </Typography>
      <Typography variant="h6" className={styles.time}>
        Time: {formatTime(currentTime)}
      </Typography>
    </Box>
  );
};

export default DoctorHeader;
