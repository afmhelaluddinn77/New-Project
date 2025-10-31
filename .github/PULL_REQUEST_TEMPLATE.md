# Pull Request Security Review

## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Security fix (addresses a security vulnerability)

---

## 🔒 Security Checklist

### Frontend Changes
- [ ] All new protected routes use `<ProtectedRoute>` wrapper
- [ ] Token validation includes expiration check
- [ ] Token validation includes portal claim check
- [ ] Invalid tokens are cleared from localStorage
- [ ] No sensitive data stored in localStorage (except token)
- [ ] No hardcoded secrets or API keys
- [ ] CORS origins are explicitly defined (no wildcards)

### Backend Changes
- [ ] All user inputs validated
- [ ] Portal authorization check implemented
- [ ] JWT includes portal claim
- [ ] HIPAA audit logging added for patient data access
- [ ] SQL queries use parameterized statements
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting considered/implemented

### Authentication/Authorization
- [ ] User credentials properly validated
- [ ] Portal type validation implemented
- [ ] JWT expiration set appropriately
- [ ] Cross-portal access prevented
- [ ] Session management secure

---

## ✅ Testing Checklist

### Manual Testing
- [ ] Tested direct URL access without login → redirects to login
- [ ] Tested with expired token → redirects and clears token
- [ ] Tested cross-portal access → redirects to login
- [ ] Tested login with correct portal → success
- [ ] Tested login with wrong portal → error message
- [ ] All dev servers restarted after changes
- [ ] Browser cache cleared during testing

### Automated Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Security tests pass

---

## 📋 Code Review Focus Areas

### Please review carefully:
- [ ] Route protection implementation
- [ ] Token validation logic
- [ ] CORS configuration
- [ ] Error handling
- [ ] Input validation
- [ ] Audit logging

### Potential Issues to Check:
- [ ] No unprotected routes added
- [ ] No security shortcuts taken
- [ ] No debug code left in
- [ ] No console.log of sensitive data

---

## 📄 Documentation
- [ ] README updated (if needed)
- [ ] SECURITY.md reviewed and followed
- [ ] API documentation updated (if needed)
- [ ] Comments added for complex security logic

---

## 🔄 Deployment Notes
<!-- Any special considerations for deployment? -->

---

## Related Issues
<!-- Link to related issues or tickets -->

Closes #

---

## Reviewer Notes
<!-- Additional context for reviewers -->

---

**⚠️ REMINDER:** This is a healthcare application handling PHI. All security guidelines in SECURITY.md must be followed.

