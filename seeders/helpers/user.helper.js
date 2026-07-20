const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker/locale/en_IN");
const { User } = require("../../models");
const { DEFAULT_PASSWORD } = require("../data/constants");

let phoneSeq = 9000000000;

async function hashDefaultPassword() {
  return bcrypt.hash(DEFAULT_PASSWORD, 10);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

/** Stable emails so re-seed is idempotent */
function stableEmail(...parts) {
  return `${parts.map(slugify).join(".")}@clinic.local`;
}

function uniquePhone() {
  phoneSeq += 1;
  return String(phoneSeq);
}

function indianName(gender = null) {
  const sex =
    gender === "female" ? "female" : gender === "male" ? "male" : undefined;
  return {
    first_name: faker.person.firstName(sex),
    last_name: faker.person.lastName(),
  };
}

async function upsertUser({
  first_name,
  last_name,
  email,
  phone,
  roles,
  passwordHash,
  profile_image = null,
}) {
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    await existing.update({
      first_name,
      last_name,
      roles,
      status: "active",
      password: passwordHash,
      profile_image: profile_image || existing.profile_image,
      email_verified_at: existing.email_verified_at || new Date(),
    });
    return existing;
  }

  // Avoid phone unique collisions on re-seed when email is new
  let safePhone = phone;
  const phoneTaken = await User.findOne({ where: { phone: safePhone } });
  if (phoneTaken) {
    safePhone = uniquePhone();
  }

  return User.create({
    first_name,
    last_name,
    email,
    phone: safePhone,
    password: passwordHash,
    roles,
    profile_image,
    status: "active",
    email_verified_at: new Date(),
    phone_verified_at: new Date(),
  });
}

function randomYesNo() {
  return faker.helpers.arrayElement(["yes", "no"]);
}

function randomAadhaar() {
  return faker.string.numeric(12);
}

module.exports = {
  faker,
  hashDefaultPassword,
  slugify,
  stableEmail,
  uniquePhone,
  indianName,
  upsertUser,
  randomYesNo,
  randomAadhaar,
};
