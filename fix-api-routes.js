const fs = require('fs');
const path = require('path');

// Function to add dynamic configuration to API routes
function addDynamicConfig(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has dynamic config
    if (content.includes('export const dynamic')) {
      console.log(`Skipping ${filePath} - already has dynamic config`);
      return;
    }
    
    // Find the first export function
    const exportFunctionMatch = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)/);
    if (!exportFunctionMatch) {
      console.log(`Skipping ${filePath} - no export function found`);
      return;
    }
    
    // Find the position to insert dynamic config
    const insertPosition = content.indexOf(exportFunctionMatch[0]);
    
    // Insert dynamic config before the first export function
    const dynamicConfig = `// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

`;
    
    const newContent = content.slice(0, insertPosition) + dynamicConfig + content.slice(insertPosition);
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find all route.ts files
function findRouteFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const apiDir = path.join(__dirname, 'app', 'api');

if (!fs.existsSync(apiDir)) {
  console.error('API directory not found:', apiDir);
  process.exit(1);
}

console.log('Finding API route files...');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route files:`);
routeFiles.forEach(file => console.log(`  ${file}`));

console.log('\nAdding dynamic configuration...');
routeFiles.forEach(addDynamicConfig);

console.log('\nDone! All API routes have been updated with dynamic configuration.');