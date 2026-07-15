const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../../models");

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { id: user.id, uuid: user.uuid, email: user.email, roles: user.roles },
    process.env.JWT_SECRET || "clinic_jwt_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

function publicUser(user) {
  const data = user.toJSON();
  delete data.password;
  return data;
}

const register = async (req, res) => {
  try {
    const body = req.body || {};
    const { first_name, last_name, email, phone, password, roles } = body;

    const requiredFields = {
      first_name,
      email,
      phone,
      password,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({
          success: false,
          message: `${field.replace("_", " ")} is required`,
        });
      }
    }

    const existingEmail = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingEmail) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const existingPhone = await User.findOne({
      where: { phone: phone.trim() },
    });
    if (existingPhone) {
      return res
        .status(409)
        .json({ success: false, message: "Phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      first_name: first_name.trim(),
      last_name: last_name ? last_name.trim() : null,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      roles: Array.isArray(roles) && roles.length ? roles : ["patient"],
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: { user: publicUser(user), token: signToken(user) },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const body = req.body || {};
    const { email, phone, password } = body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({
        success: false,
        message: "Provide email or phone, and password",
      });
    }

    const where = email
      ? { email: email.toLowerCase().trim() }
      : { phone: phone.trim() };

    const user = await User.findOne({ where });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    await user.update({ last_login: new Date() });

    return res.json({
      success: true,
      message: "Login successful",
      data: { user: publicUser(user), token: signToken(user) },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const me = async (req, res) => {
  const user = req.user;
  res.json({ success: true, message: "User information", data: { user } });
};
module.exports = {
  login,
  register,
  me,
};
