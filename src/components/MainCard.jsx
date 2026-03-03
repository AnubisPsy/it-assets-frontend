import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";

export default function MainCard({
  title,
  secondary,
  children,
  content = true,
  contentSX = {},
  sx = {},
  ...others
}) {
  return (
    <Card
      sx={{
        border: "1px solid #f0f0f0",
        borderRadius: 2,
        boxShadow: "0px 1px 4px rgba(0,0,0,0.08)",
        ...sx,
      }}
      {...others}
    >
      {title && (
        <CardHeader
          sx={{ p: 2.5 }}
          title={title}
          action={secondary}
          slotProps={{
            title: { variant: "h5" },
            action: { sx: { m: "0px auto", alignSelf: "center" } },
          }}
        />
      )}
      {title && <Divider />}
      {content ? (
        <CardContent sx={contentSX}>{children}</CardContent>
      ) : (
        children
      )}
    </Card>
  );
}

MainCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  secondary: PropTypes.any,
  children: PropTypes.node,
  content: PropTypes.bool,
  contentSX: PropTypes.object,
  sx: PropTypes.object,
};
