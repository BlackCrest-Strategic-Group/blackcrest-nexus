import { connectDB } from '../../backend/config/db.js';
import MarketplaceCategory from '../models/MarketplaceCategory.js';
import MarketplaceSupplier from '../models/MarketplaceSupplier.js';

const categories = ['Paper & Packaging', 'Industrial Supplies', 'Fasteners', 'Raw Materials'];
const cities = ['Chicago', 'Houston', 'Atlanta', 'Detroit', 'Phoenix', 'Charlotte', 'Nashville', 'Seattle'];

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  await connectDB();
  await Promise.all(categories.map((name) => MarketplaceCategory.updateOne({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name) } }, { upsert: true })));

  const suppliers = Array.from({ length: 40 }).map((_, index) => {
    const category = categories[index % categories.length];
    const city = cities[index % cities.length];
    return {
      companyName: `Supplier ${index + 1} ${category.split(' ')[0]}`,
      description: `B2B supplier focused on ${category.toLowerCase()} procurement workflows.`,
      category,
      location: { city, country: 'USA' },
      capabilities: ['OEM sourcing', 'Bulk fulfillment', 'Compliance docs'],
      minimumOrderQuantity: 100 + index * 10,
      leadTime: `${2 + (index % 4)} weeks`,
      contactEmail: `sales${index + 1}@supplierdemo.com`,
      isVerified: index % 3 === 0
    };
  });

  await MarketplaceSupplier.deleteMany({});
  await MarketplaceSupplier.insertMany(suppliers);
  console.log(`Seeded ${suppliers.length} suppliers across ${categories.length} categories.`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
