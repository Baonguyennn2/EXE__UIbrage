const { Category, Tag } = require('../models/mysql');

const categories = [
  // UI Styles
  { name: 'Fantasy', slug: 'fantasy', icon: 'RiMagicLine', type: 'ui-style' },
  { name: 'Sci-Fi', slug: 'sci-fi', icon: 'RiRocketLine', type: 'ui-style' },
  { name: 'Pixel Art', slug: 'pixel-art', icon: 'RiGamepadLine', type: 'ui-style' },
  { name: 'Minimalist', slug: 'minimalist', icon: 'RiLeafLine', type: 'ui-style' },
  
  // Game Genres
  { name: 'RPG', slug: 'rpg', icon: 'RiSwordLine', type: 'genre' },
  { name: 'Platformer', slug: 'platformer', icon: 'RiRunLine', type: 'genre' },
  { name: 'Strategy', slug: 'strategy', icon: 'RiLightbulbLine', type: 'genre' },
  { name: 'Casual', slug: 'casual', icon: 'RiSunLine', type: 'genre' },

  // General Categories
  { name: '3D Assets', slug: '3d-assets', icon: 'RiBox3Line', type: 'type' },
  { name: '2D Assets', slug: '2d-assets', icon: 'RiImageLine', type: 'type' },
  { name: 'UI Kits', slug: 'ui-kits', icon: 'RiLayoutLine', type: 'type' },
];

const tags = [
  { name: 'Low Poly', slug: 'low-poly' },
  { name: '4K', slug: '4k' },
  { name: 'Vector', slug: 'vector' },
  { name: 'Animated', slug: 'animated' },
  { name: 'PBR', slug: 'pbr' },
  { name: 'Game UI', slug: 'game-ui' },
  { name: 'Mobile Friendly', slug: 'mobile-friendly' },
  { name: 'Stylized', slug: 'stylized' },
];

async function seed() {
  try {
    for (const cat of categories) {
      await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat
      });
    }

    for (const tag of tags) {
      await Tag.findOrCreate({
        where: { slug: tag.slug },
        defaults: tag
      });
    }

    console.log('Seeding completed: Categories and Tags initialized.');
  } catch (error) {
    console.error('Seeding Error:', error);
  }
}

module.exports = seed;
