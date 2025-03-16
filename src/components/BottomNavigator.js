import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import AddIcon from "@mui/icons-material/Add";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import TimerIcon from "@mui/icons-material/Timer";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import QueueIcon from "@mui/icons-material/PeopleAlt";

export default function BottomNavigator() {
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to their respective indices
  const pathToIndex = {
    "/": 0,
    "/add-appointment": 1,
    "/mobile-appointments": 2,
    "/mobile-queue": 3,
  };

  const [value, setValue] = React.useState(pathToIndex[location.pathname] || 0);

  return (
    <Box sx={{ position: "fixed", bottom: "0", width: "100%", zIndex: 1000 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          const paths = ["/", "/add-appointment", "/mobile-appointments", "/mobile-queue"];
          navigate(paths[newValue]);
        }}
      >
        <BottomNavigationAction label="Home" icon={<TimerIcon />} />
        <BottomNavigationAction label="Add New" icon={<AddIcon />} />
        <BottomNavigationAction
          label="Appointments"
          icon={<CalendarTodayIcon />}
        />
        <BottomNavigationAction
          label="Queue"
          icon={<QueueIcon />}
        />
      </BottomNavigation>
    </Box>
  );
}
