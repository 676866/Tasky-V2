export const generateInviteCode = (orgName: string): string => {
  const prefix = orgName.toUpperCase().replace(/\s+/g, "").slice(0, 4);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
};
