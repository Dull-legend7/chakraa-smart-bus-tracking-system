export const formatAndValidatePhone = (phone: string): string => {
  // Remove all non-digits
  let clean = phone.replace(/[^0-9]/g, '');

  // Remove country code prefix if duplicate/double (common issue)
  // For India: expect 10 digits after +91, remove if starts with country code again
  if (clean.length > 10 && (clean.slice(0, 2) === '91' || clean.slice(0, 1) === '1')) {
    clean = clean.slice(clean.startsWith('91') ? 2 : 1);
  }

  // Handle leading 0 for local numbers (remove it)
  if (clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  // Now expect 10 digits for India/other common carriers
  if (clean.length !== 10) {
    throw new Error(`Invalid phone number length: ${clean.length} digits. Expected 10 digits like 9182548149`);
  }

  // Prepend country code (default India +91 - CHANGE IF NEEDED)
  const countryCode = '+91';
  const formatted = countryCode + clean;

  // Validate E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  if (!e164Regex.test(formatted)) {
    throw new Error(`Invalid E.164 format: ${formatted}. See https://www.twilio.com/docs/usage/tutorials/how-to-use-node-js-verify-api#invalid-phonenumber`);
  }

  return formatted;
};
