/**
 * Sanitizes user documents returned to the client.
 * Removes Mongoose metadata (__v, updatedAt), unused/empty fields (signatureScent),
 * and masks admin phone numbers to protect against shoulder-surfing leaks.
 */
export const sanitizeUser = (user: any): any => {
  if (!user) return user;

  // Convert Mongoose document to a plain JavaScript object
  const userObj = user.toObject ? user.toObject() : { ...user };

  // Mask admin phone number (e.g., keeping first 5 and last 2 digits, masking the middle)
  let maskedPhone = userObj.phone;
  if (
    userObj.role === 'admin' &&
    typeof maskedPhone === 'string' &&
    maskedPhone.length >= 7
  ) {
    const prefix = maskedPhone.slice(0, 5);
    const suffix = maskedPhone.slice(-2);
    const maskLength = Math.max(0, maskedPhone.length - 7);
    maskedPhone = `${prefix}${'*'.repeat(maskLength)}${suffix}`;
  }

  // Construct sanitized object containing only required storefront & dashboard properties
  return {
    _id: userObj._id,
    name: userObj.name,
    email: userObj.email,
    phone: maskedPhone,
    role: userObj.role,
    addresses: userObj.addresses || [],
    createdAt: userObj.createdAt,
  };
};

/**
 * Sanitizes an array of user documents
 */
export const sanitizeUsers = (users: any[]): any[] => {
  if (!users || !Array.isArray(users)) return [];
  return users.map(sanitizeUser);
};
