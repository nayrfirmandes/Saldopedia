const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../public/images/blog');
const QUALITY = 80;
const MAX_WIDTH = 1200;

async function optimizeImage(inputPath) {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(BLOG_DIR, `${filename}.webp`);
  
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    await sharp(inputPath)
      .resize(MAX_WIDTH, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${filename}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (${savings}% smaller)`);
    
    return { original: originalSize, optimized: newSize };
  } catch (error) {
    console.error(`✗ ${filename}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Optimizing blog images to WebP...\n');
  
  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  
  for (const file of files) {
    const result = await optimizeImage(path.join(BLOG_DIR, file));
    if (result) {
      totalOriginal += result.original;
      totalOptimized += result.optimized;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${(totalOriginal/1024/1024).toFixed(1)}MB → ${(totalOptimized/1024/1024).toFixed(1)}MB`);
  console.log(`Saved: ${((totalOriginal - totalOptimized)/1024/1024).toFixed(1)}MB (${((totalOriginal - totalOptimized)/totalOriginal*100).toFixed(0)}%)`);
}

main().catch(console.error);
