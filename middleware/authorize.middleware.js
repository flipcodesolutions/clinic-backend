function authorize(...allowedRoles) {
  return (req, res, next) => {
    let userRoles = req.user?.roles || [];

    if (typeof userRoles === "string") {
      try {
        userRoles = JSON.parse(userRoles);
      } catch (e) {
        userRoles = [userRoles];
      }
    }

    const rolesArray = Array.isArray(userRoles) ? userRoles : [];

    const hasAccess = allowedRoles.some((role) => rolesArray.includes(role));
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
