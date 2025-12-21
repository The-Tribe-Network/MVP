const fs = require('fs');
const path = require('path');

// Get all TypeScript/TSX files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Extract imports from a file
function extractImports(content) {
  const imports = new Set();
  
  // Match various import patterns
  const importPatterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /from\s+['"]([^'"]+)['"]/g,
  ];
  
  importPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.add(match[1]);
    }
  });
  
  return imports;
}

// Resolve import path to actual file
function resolveImportPath(importPath, fromFile) {
  // Skip node_modules imports
  if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
    return null;
  }
  
  const fromDir = path.dirname(fromFile);
  
  // Handle @/ alias (assuming it maps to root)
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.replace('@/', '');
    return path.join(process.cwd(), relativePath);
  }
  
  // Handle relative imports
  if (importPath.startsWith('.')) {
    const resolved = path.resolve(fromDir, importPath);
    
    // Try with extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
    
    // Try without extension
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }
  
  return null;
}

// Check if file is an entry point
function isEntryPoint(filePath) {
  const entryPointPatterns = [
    /page\.tsx?$/,
    /route\.tsx?$/,
    /layout\.tsx?$/,
    /loading\.tsx?$/,
    /error\.tsx?$/,
    /not-found\.tsx?$/,
    /middleware\.tsx?$/,
    /global-error\.tsx?$/,
  ];
  
  return entryPointPatterns.some(pattern => pattern.test(filePath));
}

// Main analysis
function analyzeUnusedFiles() {
  const rootDir = process.cwd();
  const allFiles = getAllFiles(rootDir);
  
  console.log(`Found ${allFiles.length} TypeScript/TSX files\n`);
  
  // Map of file path -> set of files that import it
  const fileUsage = new Map();
  const entryPoints = [];
  
  // Initialize usage map
  allFiles.forEach(file => {
    fileUsage.set(file, new Set());
    if (isEntryPoint(file)) {
      entryPoints.push(file);
    }
  });
  
  console.log(`Found ${entryPoints.length} entry points\n`);
  
  // Analyze imports
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        const resolvedPath = resolveImportPath(importPath, file);
        if (resolvedPath && fileUsage.has(resolvedPath)) {
          fileUsage.get(resolvedPath).add(file);
        }
      });
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });
  
  // Find unused files
  const unusedFiles = [];
  const usedFiles = [];
  
  fileUsage.forEach((importers, filePath) => {
    // Normalize path for comparison
    const normalizedPath = path.normalize(filePath);
    
    // Entry points are always considered used
    if (isEntryPoint(normalizedPath)) {
      usedFiles.push(normalizedPath);
      return;
    }
    
    // Check if file is imported
    if (importers.size === 0) {
      unusedFiles.push(normalizedPath);
    } else {
      usedFiles.push(normalizedPath);
    }
  });
  
  // Sort results
  unusedFiles.sort();
  usedFiles.sort();
  
  return {
    unusedFiles,
    usedFiles,
    entryPoints,
    totalFiles: allFiles.length
  };
}

// Run analysis
const results = analyzeUnusedFiles();

console.log('='.repeat(80));
console.log('UNUSED FILES ANALYSIS');
console.log('='.repeat(80));
console.log(`\nTotal files: ${results.totalFiles}`);
console.log(`Entry points: ${results.entryPoints.length}`);
console.log(`Used files: ${results.usedFiles.length}`);
console.log(`Unused files: ${results.unusedFiles.length}`);
console.log('\n' + '='.repeat(80));
console.log('UNUSED FILES:');
console.log('='.repeat(80));

if (results.unusedFiles.length === 0) {
  console.log('No unused files found!');
} else {
  results.unusedFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(relativePath);
  });
}

// Write results to file
const outputFile = path.join(process.cwd(), 'unused-files-report.txt');
fs.writeFileSync(outputFile, JSON.stringify({
  unusedFiles: results.unusedFiles.map(f => path.relative(process.cwd(), f)),
  entryPoints: results.entryPoints.map(f => path.relative(process.cwd(), f)),
  totalFiles: results.totalFiles,
  usedFiles: results.usedFiles.length,
  unusedFilesCount: results.unusedFiles.length
}, null, 2));

console.log(`\n\nDetailed report saved to: ${outputFile}`);
