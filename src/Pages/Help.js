import React from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const Help = () => {
  return (
    <Box sx={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Help Page
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the help page. Here you can find answers to frequently asked
        questions and best practices for using the DigiCare Reception Dashboard.
      </Typography>

      <Divider sx={{ margin: "20px 0" }} />

      <Typography variant="h5" gutterBottom>
        How to Use the Website
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="1. Logging In"
            secondary="To access the dashboard, you need to log in with your credentials. Enter your username and password on the login page and click 'Submit'."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="2. Navigating the Dashboard"
            secondary="Use the sidebar or bottom navigation to switch between different sections of the dashboard, such as Home, Add Appointment, and Patient Details."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="3. Adding an Appointment"
            secondary="Go to the 'Add Appointment' section, fill in the patient's details, and click 'Submit' to add a new appointment."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="4. Viewing Patient Details"
            secondary="In the 'Patient Details' section, you can view detailed information about the current patient, add remarks, and mark the patient as done or late."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="5. Managing the Queue"
            secondary="In the 'Queue' section, you can view the list of patients, reorder them by dragging and dropping, and mark patients as done or late."
          />
        </ListItem>
      </List>

      <Divider sx={{ margin: "20px 0" }} />

      <Typography variant="h5" gutterBottom>
        Best Practices
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="1. Keep Patient Information Up-to-Date"
            secondary="Ensure that all patient information is accurate and up-to-date to provide the best care possible."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="2. Use Secure Passwords"
            secondary="Use strong, unique passwords for your account to protect patient data and maintain security."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="3. Log Out When Not in Use"
            secondary="Always log out of the dashboard when you are not using it to prevent unauthorized access."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="4. Regularly Review the Queue"
            secondary="Regularly review the patient queue to ensure that patients are seen in a timely manner and that the queue is managed efficiently."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="5. Provide Clear Remarks"
            secondary="When adding remarks to a patient's record, be clear and concise to ensure that all staff members understand the patient's status and needs."
          />
        </ListItem>
      </List>

      <Divider sx={{ margin: "20px 0" }} />

      <Typography variant="h5" gutterBottom>
        Contact Support
      </Typography>
      <Typography variant="body1" paragraph>
        If you have any questions or need further assistance, please contact our
        support team at support@digicare.com.
      </Typography>
    </Box>
  );
};

export default Help;
