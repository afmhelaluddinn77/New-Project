#!/bin/bash

echo "=========================================="
echo "Setting up Engineering Portal & Updates"
echo "=========================================="

# Copy HR portal structure to Engineering portal
echo "📂 Creating Engineering Portal from HR template..."
cp -r hr-portal/* engineering-portal/
cp hr-portal/.* engineering-portal/ 2>/dev/null

# Update Engineering portal specific files
echo "⚙️ Customizing Engineering Portal..."

# Update package.json name and port
sed -i '' 's/"name": "hr-portal"/"name": "engineering-portal"/' engineering-portal/package.json
sed -i '' 's/5182/5183/g' engineering-portal/package.json
sed -i '' 's/5182/5183/g' engineering-portal/vite.config.ts

# Update LoginPage
sed -i '' 's/HRLoginPage/EngineeringLoginPage/g' engineering-portal/src/pages/LoginPage.tsx
sed -i '' 's/HR Portal/Engineering Portal/g' engineering-portal/src/pages/LoginPage.tsx
sed -i '' 's/Human Resources Management/System Engineering \& Development/g' engineering-portal/src/pages/LoginPage.tsx
sed -i '' 's/"HR"/"ENGINEERING"/g' engineering-portal/src/pages/LoginPage.tsx
sed -i '' 's/#764ba2/#10b981/g' engineering-portal/src/pages/LoginPage.tsx
sed -i '' 's/#667eea/#059669/g' engineering-portal/src/pages/LoginPage.tsx
sed -i '' 's/HR professionals/Engineering teams/g' engineering-portal/src/pages/LoginPage.tsx

# Update Dashboard
sed -i '' 's/HRDashboard/EngineeringDashboard/g' engineering-portal/src/pages/HRDashboard.tsx
mv engineering-portal/src/pages/HRDashboard.tsx engineering-portal/src/pages/EngineeringDashboard.tsx
sed -i '' 's/HR Portal/Engineering Portal/g' engineering-portal/src/pages/EngineeringDashboard.tsx
sed -i '' 's/HR Management/Engineering/g' engineering-portal/src/pages/EngineeringDashboard.tsx
sed -i '' 's/#764ba2/#10b981/g' engineering-portal/src/pages/EngineeringDashboard.tsx

# Update App.tsx
sed -i '' 's/HRDashboard/EngineeringDashboard/g' engineering-portal/src/App.tsx
sed -i '' 's/hrTheme/engineeringTheme/g' engineering-portal/src/App.tsx

# Update theme
sed -i '' 's/hrTheme/engineeringTheme/g' engineering-portal/src/styles/theme.ts
sed -i '' 's/#764ba2/#10b981/g' engineering-portal/src/styles/theme.ts
sed -i '' 's/#667eea/#059669/g' engineering-portal/src/styles/theme.ts

# Update HTML title
sed -i '' 's/HR Portal/Engineering Portal/g' engineering-portal/index.html

echo ""
echo "✅ Engineering Portal created successfully!"
echo ""

# Create comprehensive user seed file
echo "📝 Creating comprehensive user seed file..."
cat > services/authentication-service/seed-all-portal-users.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ALL portal users (12 portals)...');
  console.log('');

  const users = [
    // Provider Portal
    {
      email: 'provider@example.com',
      password: 'password123',
      firstName: 'Dr. John',
      lastName: 'Smith',
      role: 'PROVIDER',
      portal: 'PROVIDER',
    },
    // Patient Portal
    {
      email: 'patient@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'PATIENT',
      portal: 'PATIENT',
    },
    // Admin Portal
    {
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      portal: 'ADMIN',
    },
    // Lab Portal
    {
      email: 'labtech@example.com',
      password: 'password123',
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'LAB_TECH',
      portal: 'LAB',
    },
    // Pharmacy Portal
    {
      email: 'pharmacist@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'PHARMACIST',
      portal: 'PHARMACY',
    },
    // Billing Portal
    {
      email: 'billing@example.com',
      password: 'password123',
      firstName: 'Robert',
      lastName: 'Martinez',
      role: 'BILLING',
      portal: 'BILLING',
    },
    // Radiology Portal
    {
      email: 'radiologist@example.com',
      password: 'password123',
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      role: 'RADIOLOGIST',
      portal: 'RADIOLOGY',
    },
    // Nurses Portal
    {
      email: 'nurse@example.com',
      password: 'password123',
      firstName: 'Lisa',
      lastName: 'Anderson',
      role: 'NURSE',
      portal: 'NURSES',
    },
    // IT Portal
    {
      email: 'it@example.com',
      password: 'password123',
      firstName: 'David',
      lastName: 'Wilson',
      role: 'IT_ADMIN',
      portal: 'IT',
    },
    // HR Portal
    {
      email: 'hr@example.com',
      password: 'password123',
      firstName: 'Jessica',
      lastName: 'Taylor',
      role: 'HR_MANAGER',
      portal: 'HR',
    },
    // Engineering Portal
    {
      email: 'engineering@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Thompson',
      role: 'ENGINEER',
      portal: 'ENGINEERING',
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        portal: userData.portal,
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        portal: userData.portal,
      },
    });

    console.log(`✅ ${user.portal.padEnd(12)} Portal: ${user.email.padEnd(32)} (${user.firstName} ${user.lastName})`);
  }

  console.log('');
  console.log('🎉 All 11 portal users seeded successfully!');
  console.log('');
  console.log('📋 Quick Reference:');
  console.log('   Default password for all users: password123');
  console.log('');
  console.log('🌐 Portal URLs:');
  console.log('   Provider:    http://localhost:5174');
  console.log('   Patient:     http://localhost:5173');
  console.log('   Admin:       http://localhost:5175');
  console.log('   Lab:         http://localhost:5176');
  console.log('   Pharmacy:    http://localhost:5177');
  console.log('   Billing:     http://localhost:5178');
  console.log('   Radiology:   http://localhost:5179');
  console.log('   Nurses:      http://localhost:5180');
  console.log('   IT:          http://localhost:5181');
  console.log('   HR:          http://localhost:5182');
  console.log('   Engineering: http://localhost:5183');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

echo "✅ Seed file created!"
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run: cd services/authentication-service && node seed-all-portal-users.js"
echo "2. Run: npm install (in root directory)"
echo "3. Run: npm run start:all"
echo ""
