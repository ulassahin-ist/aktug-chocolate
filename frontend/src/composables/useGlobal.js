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
