
export const getNum = (val, max) => {
  if (val === "" || val === null) return 0;

  let n = Number(val);
  if (isNaN(n)) return 0;

  if (n < 0) n = 0;
  if (n > max) n = max;

  return n;
};

export const validateField = (val, min, max) => {
  if (val === "") return true;

  const n = Number(val);
  if (isNaN(n)) return false;

  if (min !== null && n < min) return false;
  if (max !== null && n > max) return false;

  return true;
};

export const validateAll = (data, limits) => {
  let ok = true;
  const errors = {};

  Object.keys(data).forEach((key) => {
    const valid = validateField(data[key], 0, limits[key]);
    if (!valid) ok = false;
    errors[key] = !valid;
  });

  return { ok, errors };
};