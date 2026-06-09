import { forwardRef } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate as useRouterNavigate,
} from "react-router-dom";

export function navigate(to, options) {
  const nextPath = to || "/";
  const method = options?.replace ? "replaceState" : "pushState";
  if (window.location.pathname !== nextPath) {
    window.history[method]({}, "", nextPath);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function usePathname() {
  return useLocation().pathname;
}

export function useNavigate() {
  return useRouterNavigate();
}

export const Link = forwardRef(function Link(
  { to, replace, onClick, href, target, ...props },
  ref
) {
  return (
    <RouterLink
      {...props}
      ref={ref}
      to={href ?? to}
      replace={replace}
      target={target}
      onClick={(event) => {
        onClick?.(event);
      }}
    />
  );
});
