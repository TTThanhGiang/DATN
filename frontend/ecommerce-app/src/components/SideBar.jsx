import { ListItemButton, List, ListItem, ListItemText } from "@mui/material";

const categories = ["Fruits", "Vegetables", "Dairy", "Snacks", "Beverages"];
function Sidebar({ open, onSelectCategory }) {
  return (
    <>
      <List>
        {categories.map((cat) => (
          <ListItem button key={cat} onClick={() => onSelectCategory(cat)}>
            <ListItemText primary={cat} />
          </ListItem>
        ))}
      </List>
    </>
  );
}

export default Sidebar;



