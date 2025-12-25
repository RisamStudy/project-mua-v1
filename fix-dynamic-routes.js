const fs = require('fs');
const path = require('path');

// List of API route files that need dynamic export
const apiRoutes = [
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/products/create/route.ts',
  'app/api/products/[id]/update/route.ts',
  'app/api/products/[id]/delete/route.ts',
  'app/api/orders/create/route.ts',
  'app/api/orders/[id]/update/route.ts',
  'app/api/orders/[id]/delete/route.ts',
  'app/api/orders/[id]/add-payment/route.ts',
  'app/api/orders/[id]/generate-invoice/route.ts',
  'app/api/orders/[id]/payments/route.ts',
  'app/api/clients/create/route.ts',
  'app/api/clients/[id]/update/route.ts',
  'app/api/clients/[id]/delete/route.ts',
  'app/api/calendar/create/route.ts',
  'app/api/calendar/[id]/update/route.ts',
  'app/api/calendar/[id]/delete/route.ts',
  'app/api/calendar/create/[id]/delete/route.ts'
];

function addDynamicExport(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (content.includes('export const dynamic')) {
      console.log(`Dynamic export already exists in: ${filePath}`);
      return;
    }

    // Find the first export function
    const exportMatch = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)/);
    if (!exportMatch) {
      console.log(`No export function found in: ${filePath}`);
      return;
    }

    // Add dynamic export before the first export function
    const insertIndex = exportMatch.index;
    const beforeFunction = content.substring(0, insertIndex);
    const afterFunction = content.substring(insertIndex);
    
    const newContent = beforeFunction + 
      '// Force dynamic rendering for this route\n' +
      'export const dynamic = \'force-dynamic\';\n\n' +
      afterFunction;

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Added dynamic export to: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all API routes
apiRoutes.forEach(addDynamicExport);

console.log('Finished adding dynamic exports to API routes');