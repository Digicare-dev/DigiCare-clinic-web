import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import TimerIcon from "@mui/icons-material/Timer";

export default function BottomNavigator() {
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to their respective indices
  const pathToIndex = {
    "/add-appointment": 0,
    "/": 1,
    "/patient-details": 2,
  };

  const [value, setValue] = React.useState(pathToIndex[location.pathname] || 0);

  return (
    <Box sx={{ position: "fixed", bottom: 0, width: "100%", zIndex: 1000 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          const paths = ["/add-appointment", "/", "/patient-details"];
          navigate(paths[newValue]);
        }}
      >
        <BottomNavigationAction label="Add New" icon={<AddIcon />} />
        <BottomNavigationAction label="Queue" icon={<TimerIcon />} />

        <BottomNavigationAction
          label="Current Patient"
          icon={<MedicalInformationIcon />}
        />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
        <BottomNavigationAction label="Help" icon={<HelpIcon />} />
      </BottomNavigation>
    </Box>
  );
}
