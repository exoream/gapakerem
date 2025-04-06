function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "false",
      message: "Hanya admin yang dapat membuat guide",
    });
  }
  next();
}

module.exports = { isAdmin };
