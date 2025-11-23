#!/bin/bash

# Script to create HR and Engineering portals with full structure

echo "=========================================="
echo "Creating HR and Engineering Portals"
echo "=========================================="

# Create HR Portal (Port 5182)
echo ""
echo "📂 Creating HR Portal structure..."

mkdir -p hr-portal/src/{components,contexts,pages,styles,services,hooks,utils,types}
mkdir -p hr-portal/public

# Create package.json for HR Portal
cat > hr-portal/package.json << 'EOF'
{
  "name": "hr-portal",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5182",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "@mui/x-charts": "^7.3.1",
    "@mui/x-data-grid": "^7.3.1",
    "@mui/x-date-pickers": "^7.3.1",
    "@tanstack/react-query": "^5.12.2",
    "axios": "^1.6.2",
    "chart.js": "^4.4.1",
    "date-fns": "^3.0.0",
    "formik": "^2.4.5",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "recharts": "^2.10.3",
    "socket.io-client": "^4.5.4",
    "yup": "^1.3.3",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

# Create Engineering Portal (Port 5183)
echo ""
echo "⚙️ Creating Engineering Portal structure..."

mkdir -p engineering-portal/src/{components,contexts,pages,styles,services,hooks,utils,types}
mkdir -p engineering-portal/public

# Create package.json for Engineering Portal
cat > engineering-portal/package.json << 'EOF'
{
  "name": "engineering-portal",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5183",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "@mui/x-charts": "^7.3.1",
    "@mui/x-data-grid": "^7.3.1",
    "@mui/x-date-pickers": "^7.3.1",
    "@tanstack/react-query": "^5.12.2",
    "axios": "^1.6.2",
    "chart.js": "^4.4.1",
    "date-fns": "^3.0.0",
    "formik": "^2.4.5",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "recharts": "^2.10.3",
    "socket.io-client": "^4.5.4",
    "yup": "^1.3.3",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
EOF

echo ""
echo "✅ Portal directories created successfully!"
echo ""
echo "HR Portal: Port 5182"
echo "Engineering Portal: Port 5183"
echo ""
