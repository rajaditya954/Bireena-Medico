export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role(s): ${allowedRoles.join(", ")}` 
      });
    }

    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

export const isDoctor = (req, res, next) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json({ error: "Doctor access required" });
  }
  next();
};

export const isPatient = (req, res, next) => {
  if (req.user?.role !== "patient") {
    return res.status(403).json({ error: "Patient access required" });
  }
  next();
};
