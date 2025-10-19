# Error State Patterns Library

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0

---

## 1. Network Error

```tsx
<Banner tone="critical">
  Unable to connect. Check your network.
  <Button onClick={retry}>Retry</Button>
</Banner>
```

---

## 2. Validation Error

```tsx
<Banner tone="critical" role="alert">
  <Stack gap="small">
    <Text fontWeight="semibold">Validation Errors</Text>
    <ul>
      {errors.map((e) => (
        <li key={e.field}>{e.message}</li>
      ))}
    </ul>
  </Stack>
</Banner>
```

---

## 3. Permission Error

```tsx
<Banner tone="critical">Access denied. Contact your administrator.</Banner>
```

---

## 4. Not Found Error

```tsx
<Box padding="large">
  <Stack gap="base" align="center">
    <Icon type="search" size="large" tone="subdued" />
    <Text variant="headingMd">Page not found</Text>
    <Text tone="subdued">The page you're looking for doesn't exist.</Text>
    <Button url="/" variant="primary">
      Go to Dashboard
    </Button>
  </Stack>
</Box>
```

---

## 5. Generic Error Fallback

```tsx
<Banner tone="critical">
  Something went wrong. Please try again or contact support.
  <ButtonGroup>
    <Button onClick={retry}>Retry</Button>
    <Button onClick={contactSupport}>Contact Support</Button>
  </ButtonGroup>
</Banner>
```

---

## Change Log

- **2025-10-19:** v1.0 - Error state patterns library
