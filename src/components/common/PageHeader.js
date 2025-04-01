import { Box, Typography, Breadcrumbs, Link, IconButton, Button } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

export const PageHeader = ({ 
  title, 
  breadcrumbs,
  showBackButton = false,
  backButtonText,
  backButtonVariant = 'icon', // 'icon' or 'button'
  onBackButtonClick
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {showBackButton && backButtonVariant === 'icon' && (
          <IconButton 
            color="primary" 
            onClick={onBackButtonClick}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        )}
        
        {showBackButton && backButtonVariant === 'button' && (
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onBackButtonClick}
            startIcon={<ArrowBack />}
            size="small"
            sx={{ mr: 2, py: 1, px: 2 }}
          >
            {backButtonText || 'Back'}
          </Button>
        )}
        
        <Typography variant="h4">
          {title}
        </Typography>
      </Box>
      
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