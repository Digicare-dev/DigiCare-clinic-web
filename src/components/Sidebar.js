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
import { NavLink, useLocation } from "react-router-dom";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";

const drawerWidth = 240;

export default function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { text: "Home", path: "/", icon: HomeIcon },
    { text: "Appointments", path: "/appointments", icon: AddIcon },
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
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                component={NavLink}
                to={item.path}
                sx={{
                  cursor: "pointer",
                  backgroundColor: isActive ? "#ddd" : "inherit",
                  color: isActive ? "#007bff" : "black",
                  fontWeight: isActive ? "bold" : "normal",
                  "&:hover": {
                    color: "#007bff",
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "#007bff" : "inherit" }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
