import { Box, Typography, Breadcrumbs, Link } from '@mui/material';

export const PageHeader = ({ title, breadcrumbs }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {breadcrumbs && (
        <Breadcrumbs>
          {breadcrumbs.map((item, index) => (
            <Link
              key={index}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={item.href}
            >
              {item.text}
            </Link>
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
}; 