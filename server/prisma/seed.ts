import bcrypt from 'bcryptjs'
import { env } from '../src/config/env.js'
import { prisma } from '../src/db.js'

interface SeedProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  image: string
  category: string
  unit: string
  stock: number
  isOrganic: boolean
  rating: number
  reviewCount: number
}

const baseImage = 'https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart'

const products: SeedProduct[] = [
  { id: '69c22613ae75a98c7cd13b3b', name: 'Butter Croissant 100g', description: 'Flaky and buttery', price: 45, originalPrice: 50, image: `${baseImage}/zvoeqbvrbrt7atqj0dbu.png`, category: 'bakery', unit: '100g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b37', name: 'Organic Quinoa 500g', description: 'High protein, Gluten-free', price: 420, originalPrice: 450, image: `${baseImage}/cxrrgnf12xuhkr4dyhi2.png`, category: 'pantry-staples', unit: '500g', stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b3a', name: 'Brown Bread 400g', description: 'Soft and healthy, Ideal for breakfast', price: 35, originalPrice: 40, image: `${baseImage}/vy1xa7zovcu22smzapzv.png`, category: 'bakery', unit: '400g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b36', name: 'Barley 1kg', description: 'Rich in fiber, Helps digestion', price: 140, originalPrice: 150, image: `${baseImage}/spb5sgy8g24rned9nwog.png`, category: 'pantry-staples', unit: '1kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b39', name: 'Knorr Cup Soup 70g', description: 'Convenient and tasty', price: 30, originalPrice: 35, image: `${baseImage}/vnzb2qbwtpab5gnqvx0f.png`, category: 'pantry-staples', unit: '70g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b38', name: 'Maggi Noodles 280g', description: 'Instant and easy to cook', price: 50, originalPrice: 55, image: `${baseImage}/dsep7owmwvfrukzbslqo.png`, category: 'pantry-staples', unit: '280g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b30', name: 'Sprite 1.5L', description: 'Chilled and refreshing, Perfect for celebrations', price: 60, originalPrice: 75, image: `${baseImage}/daiglpvgna1dlhjplbve.png`, category: 'beverages', unit: '1.5L', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b23', name: 'Carrot 500g', description: 'Sweet and crunchy, Good for eyesight, Ideal for juices and salads', price: 44, originalPrice: 50, image: `${baseImage}/ceqgisupuizyste9aifg.png`, category: 'fruits-vegetables', unit: '500g', stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b2f', name: 'Coca-Cola 1.5L', description: 'Perfect for parties and gatherings, Best served chilled', price: 75, originalPrice: 80, image: `${baseImage}/eljxcdud6fduwfim5rdx.png`, category: 'beverages', unit: '1.5L', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b35', name: 'Brown Rice 1kg', description: 'Whole grain and nutritious', price: 110, originalPrice: 120, image: `${baseImage}/dboutcrkdjhoxcvbbqne.png`, category: 'pantry-staples', unit: '1kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b2d', name: 'Eggs 12 pcs', description: 'Farm fresh, Rich in protein, Ideal for breakfast and baking', price: 85, originalPrice: 90, image: `${baseImage}/cnjrpbcnqesqxy1wr30g.png`, category: 'dairy-eggs', unit: '12pcs', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b28', name: 'Banana 1 kg', description: 'Sweet and ripe, High in potassium, Great for smoothies and snacking', price: 45, originalPrice: 50, image: `${baseImage}/dsnmko6gqtyw31okby80.png`, category: 'fruits-vegetables', unit: '1kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b33', name: 'Basmati Rice 5kg', description: 'Long grain and aromatic, Perfect for biryani', price: 520, originalPrice: 550, image: `${baseImage}/evuovl2nlwdjukosfz23.png`, category: 'pantry-staples', unit: '5kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b25', name: 'Onion 500g', description: 'Fresh and pungent, Perfect for cooking, A kitchen staple', price: 45, originalPrice: 50, image: `${baseImage}/wnvtwlm2tphqburhsmyc.png`, category: 'fruits-vegetables', unit: '500g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b31', name: '7 Up 1.5L', description: 'Refreshing lemon-lime flavor', price: 70, originalPrice: 76, image: `${baseImage}/qt1ypzsoqni12ghf2ryp.png`, category: 'beverages', unit: '1.5L', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b24', name: 'Spinach 500g', description: 'Rich in iron, High in vitamins, Perfect for soups and salads', price: 15, originalPrice: 18, image: `${baseImage}/bhrtl76sscvmeiq4kchm.png`, category: 'fruits-vegetables', unit: '500g', stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b27', name: 'Orange 1 kg', description: 'Juicy and sweet, Rich in Vitamin C, Perfect for juices and salads', price: 75, originalPrice: 80, image: `${baseImage}/r1wxfortw5h12g7egx7k.png`, category: 'fruits-vegetables', unit: '1kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b34', name: 'Wheat Flour 5kg', description: 'Soft and fluffy rotis, Rich in nutrients', price: 230, originalPrice: 250, image: `${baseImage}/ooitbkcjcky0gkjmkatb.png`, category: 'pantry-staples', unit: '5kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b2a', name: 'Grapes 500g', description: 'Fresh and juicy, Rich in antioxidants, Perfect for snacking and fruit salads', price: 65, originalPrice: 70, image: `${baseImage}/jsmb7caaokhnyci2coga.png`, category: 'fruits-vegetables', unit: '500g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b32', name: 'Fanta 1.5L', description: 'Sweet and fizzy', price: 65, originalPrice: 70, image: `${baseImage}/nexecd3mgyzrpeun1bee.png`, category: 'beverages', unit: '1.5L', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b2c', name: 'Paneer 200g', description: 'Soft and fresh, Rich in protein, Ideal for curries and snacks', price: 85, originalPrice: 90, image: `${baseImage}/vihqr6wquv57byurvz46.png`, category: 'dairy-eggs', unit: '200g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b29', name: 'Mango 1 kg', description: 'Sweet and flavorful, Perfect for smoothies and desserts, Rich in Vitamin A', price: 140, originalPrice: 150, image: `${baseImage}/nb1mpxuo4fdcik6ey5yj.png`, category: 'fruits-vegetables', unit: '1kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b22', name: 'Tomato 1 kg', description: 'Juicy and ripe, Rich in Vitamin C, Perfect for salads and sauces, Farm fresh quality', price: 28, originalPrice: 30, image: `${baseImage}/kdbfytxisrjymgy0ubhk.png`, category: 'fruits-vegetables', unit: '1kg', stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b21', name: 'Potato 500g', description: 'Fresh and organic, Rich in carbohydrates, Ideal for curries and fries', price: 35, originalPrice: 40, image: `${baseImage}/tzibj2ntsnbn4e0u5kwv.png`, category: 'fruits-vegetables', unit: '500g', stock: 100, isOrganic: true, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b2e', name: 'Cheese 200g', description: 'Creamy and delicious, Perfect for pizzas and sandwiches, Rich in calcium', price: 130, originalPrice: 140, image: `${baseImage}/gek3mmiig3lixlkpxks8.png`, category: 'dairy-eggs', unit: '200g', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b2b', name: 'Amul Milk 1L', description: 'Fresh milk, Rich in calcium', price: 55, originalPrice: 60, image: `${baseImage}/ooamzy497lhsj2gjuwby.png`, category: 'dairy-eggs', unit: '1L', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
  { id: '69c22613ae75a98c7cd13b26', name: 'Apple 1 kg', description: 'Boosts immunity, Rich in fiber', price: 90, originalPrice: 100, image: `${baseImage}/pjt1y6xdo46tluemhf0o.png`, category: 'fruits-vegetables', unit: '1kg', stock: 100, isOrganic: false, rating: 4.5, reviewCount: 12 },
]

async function seedProducts() {
  for (const [index, product] of products.entries()) {
    const { id, ...data } = product
    await prisma.product.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
        createdAt: new Date(Date.UTC(2026, 2, 24, 0, index)),
      },
    })
  }
  console.log(`Seeded ${products.length} products`)
}

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.warn('ADMIN_EMAIL and ADMIN_PASSWORD are not set; skipping admin seed')
    return
  }

  const password = await bcrypt.hash(env.ADMIN_PASSWORD, 12)
  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { name: 'Daily Basket Admin', password, isAdmin: true },
    create: {
      name: 'Daily Basket Admin',
      email: env.ADMIN_EMAIL,
      password,
      isAdmin: true,
    },
  })
  console.log(`Admin ready: ${admin.email}`)
}

async function main() {
  await seedProducts()
  await seedAdmin()
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
