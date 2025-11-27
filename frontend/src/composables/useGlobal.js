import { useAuth } from "./useAuth";
import { useBranch } from "./useBranch";
import { useBasket } from "./useBasket";
import { useFormatters } from "./useFormatters";

export function useGlobal() {
  return {
    // Auth
    ...useAuth(),

    // Branch/Table
    ...useBranch(),

    // Basket
    ...useBasket(),

    // Formatting
    ...useFormatters(),
  };
}

// import { useGlobal } from "@/composables";

// const {
//   // Auth
//   token, user, role, isLoggedIn, isAdmin, isStaff, isStaffOrAdmin, isCustomer, login, logout, validateToken, requireAdmin, requireStaffOrAdmin,

//   // Branch / Table
//   branchId, tableId, tableIdText, setBranch, setTableId, getBranchId,

//   // Basket
//  items, total, itemCount,  addItem,  increaseQty,  decreaseQty,   removeItem, clearBasket, validateBasket,

//   // Formatters
//   formatPrice, formatDate, formatName,
// } = useGlobal();
