import { setTenantContext, clearTenantContext } from "../config/db-client.js";

export const tenantContextMiddleware = (req, res, next) => {
  if (req.user && req.user.hospitalId) {
    req.hospitalId = req.user.hospitalId;
    setTenantContext(req.user.hospitalId);
  } else {
    req.hospitalId = null;
    clearTenantContext();
  }

  // Clear context on response end to prevent cross-request context leakage
  res.on("finish", () => {
    clearTenantContext();
  });

  next();
};
