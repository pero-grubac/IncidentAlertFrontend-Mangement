// Mirrors the password policy configured for ASP.NET Identity in the Management API.
// Returns the rules the password still breaks, as i18n keys under auth.register.rules.
export function passwordProblems(password) {
  const problems = [];
  if (password.length < 6) problems.push("length");
  if (!/[a-z]/.test(password)) problems.push("lower");
  if (!/[A-Z]/.test(password)) problems.push("upper");
  if (!/\d/.test(password)) problems.push("digit");
  if (!/[^a-zA-Z0-9]/.test(password)) problems.push("symbol");
  return problems;
}
