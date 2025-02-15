import React from "react";
import "./Sidebar.css";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";

import { NavLink } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import HelpIcon from "@mui/icons-material/Help";

const drawerWidth = 240;

export default function Sidebar() {
  const menuItems = [
    { text: "Home", path: "/", icon: HomeIcon },
    { text: "Add Appointment", path: "/add-appointment", icon: AddIcon },
    {
      text: "Patient Details",
      path: "/patient-details",
      icon: MedicalInformationIcon,
    },
    // { text: "Settings", path: "/settings", icon: SettingsIcon },
    { text: "Help", path: "/help", icon: HelpIcon },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          marginTop: "72px",
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={NavLink}
              to={item.path}
              sx={{
                "&.active": {
                  backgroundColor: "#ddd",
                  color: "#007bff",
                  fontWeight: "bold",
                },
                "&:hover": {
                  // color: "black",
                  color: "#007bff",

                  backgroundColor: "#f5f5f5",
                },
                color: "black",
              }}
              className={({ isActive }) => (isActive ? "active" : "inactive")}
            >
              <ListItemIcon
                sx={{
                  color: ({ isActive }) => (isActive ? "#007bff" : "inherit"), // Change icon color when active
                }}
              >
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
