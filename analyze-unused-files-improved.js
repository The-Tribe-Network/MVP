const fs = require('fs');
const path = require('path');

// Get all TypeScript/TSX/JS/JSX files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build', '.cursor', '.claude'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx|mjs|json)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Normalize file path for comparison
function normalizePath(filePath) {
  return path.normalize(filePath).replace(/\\/g, '/');
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
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // Dynamic imports
  ];
  
  importPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.add(match[1]);
    }
  });
  
  return imports;
}

// Resolve import path to actual file(s)
function resolveImportPath(importPath, fromFile, allFiles) {
  // Skip node_modules imports
  if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
    return [];
  }

  const fromDir = path.dirname(fromFile);
  const rootDir = process.cwd();
  const resolvedFiles = [];

  // Handle @/ alias (maps to root)
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.replace('@/', '');
    const basePath = path.join(rootDir, relativePath);
    
    // Try with extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    for (const ext of extensions) {
      const candidate = basePath + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        resolvedFiles.push(candidate);
      }
    }
    
    // Also check for directory with index file
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
      for (const indexFile of indexFiles) {
        const candidate = path.join(basePath, indexFile);
        if (fs.existsSync(candidate)) {
          resolvedFiles.push(candidate);
        }
      }
    }
  }

  // Handle relative imports
  if (importPath.startsWith('.')) {
    const resolved = path.resolve(fromDir, importPath);
    
    // Try with extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const candidate = resolved + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        resolvedFiles.push(candidate);
      }
    }
    
    // Try as directory with index file
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
      for (const indexFile of indexFiles) {
        const candidate = path.join(resolved, indexFile);
        if (fs.existsSync(candidate)) {
          resolvedFiles.push(candidate);
        }
      }
    }
  }

  return resolvedFiles;
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
    /template\.tsx?$/,
    /default\.tsx?$/,
  ];
  
  return entryPointPatterns.some(pattern => pattern.test(filePath));
}

// Check if file is a config file that should be kept
function isConfigFile(filePath) {
  const configPatterns = [
    /\.config\.(ts|js|mjs|json)$/,
    /tsconfig\.json$/,
    /package\.json$/,
    /next-env\.d\.ts$/,
    /tailwind\.config\./,
    /postcss\.config\./,
    /drizzle\.config\./,
  ];
  
  return configPatterns.some(pattern => pattern.test(filePath));
}

// Check if file is used in config files
function checkConfigUsage(filePath, allFiles) {
  const configFiles = allFiles.filter(f => isConfigFile(f));
  const normalizedTarget = normalizePath(filePath);
  
  for (const configFile of configFiles) {
    try {
      const content = fs.readFileSync(configFile, 'utf-8');
      // Check if file path appears in config
      if (content.includes(normalizedTarget) || content.includes(path.basename(filePath))) {
        return true;
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  return false;
}

// Main analysis
function analyzeUnusedFiles() {
  const rootDir = process.cwd();
  const allFiles = getAllFiles(rootDir);
  
  console.log(`Found ${allFiles.length} files\n`);

  // Map of file path -> set of files that import it
  const fileUsage = new Map();
  const entryPoints = [];
  const configFiles = [];

  // Initialize usage map
  allFiles.forEach(file => {
    const normalized = normalizePath(file);
    fileUsage.set(normalized, new Set());
    
    if (isEntryPoint(file)) {
      entryPoints.push(normalized);
    }
    
    if (isConfigFile(file)) {
      configFiles.push(normalized);
    }
  });

  console.log(`Found ${entryPoints.length} entry points`);
  console.log(`Found ${configFiles.length} config files\n`);

  // Analyze imports
  let processedCount = 0;
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        const resolvedPaths = resolveImportPath(importPath, file, allFiles);
        resolvedPaths.forEach(resolvedPath => {
          const normalized = normalizePath(resolvedPath);
          if (fileUsage.has(normalized)) {
            fileUsage.get(normalized).add(normalizePath(file));
          }
        });
      });
      
      processedCount++;
      if (processedCount % 50 === 0) {
        process.stdout.write(`\rProcessed ${processedCount}/${allFiles.length} files...`);
      }
    } catch (error) {
      // Silently skip errors
    }
  });
  
  console.log(`\rProcessed ${processedCount}/${allFiles.length} files\n`);

  // Find unused files
  const unusedFiles = [];
  const usedFiles = [];
  const falsePositives = new Set([
    'analyze-unused-files.js',
    'analyze-unused-files-improved.js',
    'check-migrations.ts',
  ]);

  fileUsage.forEach((importers, filePath) => {
    // Skip analysis scripts
    if (falsePositives.has(path.basename(filePath))) {
      return;
    }
    
    // Entry points are always considered used
    if (isEntryPoint(filePath)) {
      usedFiles.push(filePath);
      return;
    }
    
    // Config files are always considered used
    if (isConfigFile(filePath)) {
      usedFiles.push(filePath);
      return;
    }
    
    // Check if file is imported
    if (importers.size === 0) {
      // Double-check: might be used in config
      if (!checkConfigUsage(filePath, allFiles)) {
        unusedFiles.push(filePath);
      } else {
        usedFiles.push(filePath);
      }
    } else {
      usedFiles.push(filePath);
    }
  });

  // Sort results
  unusedFiles.sort();
  usedFiles.sort();

  return {
    unusedFiles,
    usedFiles,
    entryPoints,
    configFiles,
    totalFiles: allFiles.length
  };
}

// Run analysis
console.log('Starting unused files analysis...\n');
const results = analyzeUnusedFiles();

console.log('='.repeat(80));
console.log('UNUSED FILES ANALYSIS');
console.log('='.repeat(80));
console.log(`\nTotal files: ${results.totalFiles}`);
console.log(`Entry points: ${results.entryPoints.length}`);
console.log(`Config files: ${results.configFiles.length}`);
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

// Write detailed results to file
const outputFile = path.join(process.cwd(), 'unused-files-report-detailed.json');
const report = {
  summary: {
    totalFiles: results.totalFiles,
    entryPoints: results.entryPoints.length,
    configFiles: results.configFiles.length,
    usedFiles: results.usedFiles.length,
    unusedFiles: results.unusedFiles.length
  },
  unusedFiles: results.unusedFiles.map(f => path.relative(process.cwd(), f)),
  entryPoints: results.entryPoints.map(f => path.relative(process.cwd(), f)),
  configFiles: results.configFiles.map(f => path.relative(process.cwd(), f))
};

fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

console.log(`\n\nDetailed report saved to: ${outputFile}`);
