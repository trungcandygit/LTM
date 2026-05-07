import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./dev.db";
const isLibsql = url.startsWith("libsql://") || url.startsWith("wss://") || url.startsWith("https://");

let prisma: PrismaClient;

if (isLibsql) {
  const libsql = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const adapter = new PrismaLibSql(libsql as any);
  prisma = new PrismaClient({ adapter } as any);
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@tinori.vn";
  const adminPassword = "tinori@2024";

  // Create or update admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: "Thanh Thảo Admin",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Thanh Thảo Admin",
      role: "admin",
    },
  });
  console.log(`✅ Admin updated/created: ${adminEmail}`);

  // Create categories
  const categories = [
    { name: "Áo", slug: "ao" },
    { name: "Quần", slug: "quan" },
    { name: "Váy", slug: "vay" },
    { name: "Phụ kiện", slug: "phu-kien" },
    { name: "Túi xách", slug: "tui-xach" },
    { name: "Giày dép", slug: "giay-dep" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created");

  // Create sample products
  const aoCategory = await prisma.category.findUnique({ where: { slug: "ao" } });
  const vayCategory = await prisma.category.findUnique({ where: { slug: "vay" } });

  const sampleProducts = [
    {
      name: "Áo thun basic Tinori",
      slug: "ao-thun-basic-tinori",
      description: "Áo thun basic chất liệu cotton 100%, thoáng mát, phù hợp mặc hàng ngày",
      price: 150000,
      salePrice: 120000,
      stock: 50,
      featured: true,
      categoryId: aoCategory?.id,
      images: [{ url: "https://picsum.photos/seed/tinori1/400/400", alt: "Áo thun Tinori", isPrimary: true, order: 0 }],
      variants: [
        { name: "Size", value: "S", type: "size", stock: 15 },
        { name: "Size", value: "M", type: "size", stock: 20 },
        { name: "Size", value: "L", type: "size", stock: 15 },
      ],
    },
    {
      name: "Váy hoa nhí Tinori",
      slug: "vay-hoa-nhi-tinori",
      description: "Váy hoa nhí dễ thương, chất liệu voan mềm mại, phù hợp đi chơi, đi cafe",
      price: 280000,
      salePrice: 240000,
      stock: 30,
      featured: true,
      categoryId: vayCategory?.id,
      images: [{ url: "https://picsum.photos/seed/tinori2/400/400", alt: "Váy hoa nhí", isPrimary: true, order: 0 }],
      variants: [
        { name: "Size", value: "S", type: "size", stock: 10 },
        { name: "Size", value: "M", type: "size", stock: 12 },
        { name: "Size", value: "L", type: "size", stock: 8 },
      ],
    },
    {
      name: "Set bộ thoáng mát",
      slug: "set-bo-thoang-mat",
      description: "Set áo quần thoáng mát, chất liệu linen cao cấp, phù hợp mặc hè",
      price: 350000,
      stock: 25,
      featured: false,
      categoryId: aoCategory?.id,
      images: [{ url: "https://picsum.photos/seed/tinori3/400/400", alt: "Set bộ thoáng mát", isPrimary: true, order: 0 }],
      variants: [],
    },
  ];

  for (const product of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (!existing) {
      const { images, variants, ...productData } = product;
      await prisma.product.create({
        data: {
          ...productData,
          active: true,
          images: { create: images },
          variants: variants.length ? { create: variants } : undefined,
        },
      });
    }
  }
  console.log("✅ Sample products created");
  console.log("\n🎉 Seed complete!");
  console.log(`📧 Admin Email: ${adminEmail}`);
  console.log("🔑 Password: (Sử dụng mật khẩu trong .env)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
