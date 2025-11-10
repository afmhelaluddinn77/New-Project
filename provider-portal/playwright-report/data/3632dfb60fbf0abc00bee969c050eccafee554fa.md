# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "Welcome Back" [level=2] [ref=e7]
      - paragraph [ref=e8]: Sign in to continue to your dashboard
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]: Email Address
        - generic [ref=e12]:
          - img
          - textbox "Email Address" [ref=e13]:
            - /placeholder: provider@example.com
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - generic [ref=e16]:
          - img
          - textbox "Password" [ref=e17]:
            - /placeholder: Enter your password
      - generic [ref=e18]:
        - generic [ref=e19] [cursor=pointer]:
          - checkbox "Remember me" [ref=e20]
          - generic [ref=e21]: Remember me
        - link "Forgot password?" [ref=e22] [cursor=pointer]:
          - /url: "#"
      - button "Sign In" [ref=e23] [cursor=pointer]
    - paragraph [ref=e25]:
      - text: Need help?
      - link "Contact Support" [ref=e26] [cursor=pointer]:
        - /url: "#"
  - generic [ref=e27]:
    - img [ref=e29]
    - button "Open Tanstack query devtools" [ref=e77] [cursor=pointer]:
      - img [ref=e78]
```