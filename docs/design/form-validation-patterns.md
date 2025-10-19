# Form Validation Patterns

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0

---

## 1. Inline Validation

### Email Field

```tsx
<TextField
  label="Email Address"
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
  autoComplete="email"
/>
```

**Error Messages:**

- Empty: "Email address is required"
- Invalid format: "Email must include @ symbol"
- Already exists: "This email is already registered"

---

## 2. Real-Time Validation

```tsx
const validateEmail = (value: string) => {
  if (!value) return "Email address is required";
  if (!value.includes("@")) return "Email must include @ symbol";
  if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email format";
  return undefined;
};

<TextField
  label="Email"
  value={email}
  onChange={(v) => {
    setEmail(v);
    setEmailError(validateEmail(v));
  }}
  error={emailError}
/>;
```

---

## 3. Form Error Summary

```tsx
{
  errors.length > 0 && (
    <Banner tone="critical" role="alert">
      <Stack gap="small">
        <Text fontWeight="semibold">
          Please fix {errors.length} error{errors.length > 1 ? "s" : ""}
        </Text>
        <ul>
          {errors.map((e, i) => (
            <li key={i}>
              <Link onClick={() => focusField(e.field)}>{e.message}</Link>
            </li>
          ))}
        </ul>
      </Stack>
    </Banner>
  );
}
```

---

## Change Log

- **2025-10-19:** v1.0 - Form validation patterns
