function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];

    const hasAccess = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}

module.exports = { authorize };
