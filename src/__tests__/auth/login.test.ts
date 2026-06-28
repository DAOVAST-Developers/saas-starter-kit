describe("Login Form Validations", () => {
  it("should validate correct email input shapes", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("developer@saas.com")).toBe(true);
    expect(emailRegex.test("developer-at-saas-dot-com")).toBe(false);
  });

  it("should enforce passwords length parameters", () => {
    const enforceLength = (pass: string) => pass.length >= 8;
    expect(enforceLength("short")).toBe(false);
    expect(enforceLength("secure-developer-password")).toBe(true);
  });
});
