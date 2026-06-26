// TODO: In production, use Redis for rate limiting across multiple instances
const loginAttempts = new Map<string, { count: number, lockUntil: number }>();

export const checkRateLimit = (ip: string, username: string): boolean => {
  const normUser = username.trim().toLowerCase();
  const key = `${ip}:${normUser}`;
  const record = loginAttempts.get(key);
  if (record && record.lockUntil > Date.now()) {
    return false;
  }
  if (record && record.lockUntil <= Date.now()) {
    loginAttempts.delete(key);
  }
  return true;
};

export const recordFailedLogin = (ip: string, username: string): void => {
  const normUser = username.trim().toLowerCase();
  const key = `${ip}:${normUser}`;
  const record = loginAttempts.get(key) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
  }
  loginAttempts.set(key, record);
};

export const resetLoginAttempts = (ip: string, username: string): void => {
  const normUser = username.trim().toLowerCase();
  loginAttempts.delete(`${ip}:${normUser}`);
};
