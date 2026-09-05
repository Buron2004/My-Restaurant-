import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient, MealStatus, TableLocation, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

const cuisines = [
  { name: 'Italian', description: 'Handmade pasta, wood-fired classics, and coastal Italian flavors.', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141' },
  { name: 'Japanese', description: 'Clean, seasonal dishes inspired by Japanese izakaya and sushi bars.', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
  { name: 'Mexican', description: 'Bright, generous Mexican cooking with house-made salsas and tortillas.', imageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85' },
  { name: 'Mediterranean', description: 'Fresh herbs, grilled ingredients, and sunlit flavors from the Mediterranean.', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554' },
  { name: 'Indian', description: 'Aromatic curries, tandoor specialties, and regional Indian comfort food.', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe' },
  { name: 'Modern European', description: 'Contemporary plates built around local produce and classic technique.', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554' },
]

const meals = [
  { name: 'Truffle Tagliatelle', cuisine: 'Italian', description: 'Silky pasta with wild mushrooms, parmesan, and black truffle.', price: 18500, prepTimeMinutes: 18, dietaryTags: ['vegetarian'], isFeatured: true },
  { name: 'Margherita Pizza', cuisine: 'Italian', description: 'San Marzano tomato, mozzarella, basil, and extra virgin olive oil.', price: 12000, prepTimeMinutes: 15, dietaryTags: ['vegetarian'], isFeatured: false },
  { name: 'Seafood Risotto', cuisine: 'Italian', description: 'Carnaroli rice with prawns, calamari, mussels, and saffron.', price: 22000, prepTimeMinutes: 25, dietaryTags: [], isFeatured: true },
  { name: 'Salmon Teriyaki', cuisine: 'Japanese', description: 'Glazed salmon with steamed rice, greens, and sesame.', price: 19500, prepTimeMinutes: 20, dietaryTags: ['high-protein'], isFeatured: true },
  { name: 'Chicken Katsu', cuisine: 'Japanese', description: 'Crisp panko chicken with cabbage slaw and tonkatsu sauce.', price: 16000, prepTimeMinutes: 22, dietaryTags: [], isFeatured: false },
  { name: 'Miso Ramen', cuisine: 'Japanese', description: 'Rich miso broth, noodles, roasted corn, egg, and spring onion.', price: 14500, prepTimeMinutes: 18, dietaryTags: [], isFeatured: false },
  { name: 'Baja Fish Tacos', cuisine: 'Mexican', description: 'Crisp fish, lime crema, cabbage, pico de gallo, and corn tortillas.', price: 13500, prepTimeMinutes: 16, dietaryTags: [], isFeatured: true },
  { name: 'Chicken Tinga Bowl', cuisine: 'Mexican', description: 'Smoky shredded chicken, rice, black beans, avocado, and salsa.', price: 15000, prepTimeMinutes: 20, dietaryTags: ['high-protein'], isFeatured: false },
  { name: 'Guacamole and Chips', cuisine: 'Mexican', description: 'Fresh avocado, lime, coriander, and toasted corn chips.', price: 7500, prepTimeMinutes: 8, dietaryTags: ['vegan', 'gluten-free'], isFeatured: false },
  { name: 'Lamb Shawarma Plate', cuisine: 'Mediterranean', description: 'Spiced lamb, hummus, tabbouleh, pickles, and warm flatbread.', price: 17500, prepTimeMinutes: 20, dietaryTags: [], isFeatured: true },
  { name: 'Greek Village Salad', cuisine: 'Mediterranean', description: 'Tomato, cucumber, olives, feta, oregano, and olive oil.', price: 9500, prepTimeMinutes: 10, dietaryTags: ['vegetarian', 'gluten-free'], isFeatured: false },
  { name: 'Grilled Halloumi', cuisine: 'Mediterranean', description: 'Charred halloumi with roasted vegetables and lemon dressing.', price: 12500, prepTimeMinutes: 14, dietaryTags: ['vegetarian'], isFeatured: false },
  { name: 'Butter Chicken', cuisine: 'Indian', description: 'Tandoori chicken in a rich tomato, butter, and spice sauce.', price: 16500, prepTimeMinutes: 22, dietaryTags: ['high-protein'], isFeatured: true },
  { name: 'Paneer Tikka Masala', cuisine: 'Indian', description: 'Charred paneer in a creamy spiced tomato gravy.', price: 14500, prepTimeMinutes: 20, dietaryTags: ['vegetarian'], isFeatured: false },
  { name: 'Lamb Biryani', cuisine: 'Indian', description: 'Fragrant basmati rice layered with tender lamb and saffron.', price: 18500, prepTimeMinutes: 25, dietaryTags: [], isFeatured: true },
  { name: 'Herb-Crusted Salmon', cuisine: 'Modern European', description: 'Roasted salmon with crushed potatoes and green herb sauce.', price: 23000, prepTimeMinutes: 24, dietaryTags: ['high-protein', 'gluten-free'], isFeatured: true },
  { name: 'Wild Mushroom Tart', cuisine: 'Modern European', description: 'Buttery pastry, roasted mushrooms, goat cheese, and thyme.', price: 15500, prepTimeMinutes: 20, dietaryTags: ['vegetarian'], isFeatured: false },
  { name: 'Beef Tenderloin', cuisine: 'Modern European', description: 'Grilled tenderloin with pepper jus, greens, and pomme puree.', price: 28000, prepTimeMinutes: 28, dietaryTags: ['high-protein', 'gluten-free'], isFeatured: true },
  { name: 'Lemon Panna Cotta', cuisine: 'Italian', description: 'Silky vanilla panna cotta with lemon curd and berries.', price: 8000, prepTimeMinutes: 6, dietaryTags: ['vegetarian', 'gluten-free'], isFeatured: false },
  { name: 'Dark Chocolate Torte', cuisine: 'Modern European', description: 'Dense dark chocolate torte with whipped creme fraiche.', price: 8500, prepTimeMinutes: 8, dietaryTags: ['vegetarian'], isFeatured: false },
]

const tables = [
  { name: 'Table 1', capacity: 2, location: TableLocation.INDOOR },
  { name: 'Table 2', capacity: 2, location: TableLocation.INDOOR },
  { name: 'Table 3', capacity: 4, location: TableLocation.INDOOR },
  { name: 'Table 4', capacity: 4, location: TableLocation.INDOOR },
  { name: 'Table 5', capacity: 6, location: TableLocation.OUTDOOR },
  { name: 'Table 6', capacity: 6, location: TableLocation.OUTDOOR },
  { name: 'Table 7', capacity: 8, location: TableLocation.PRIVATE },
  { name: 'Table 8', capacity: 10, location: TableLocation.PRIVATE },
]

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12)

  await prisma.user.upsert({
    where: { email: 'admin@restaurant.test' },
    update: { name: 'Restaurant Admin', role: UserRole.ADMIN, passwordHash },
    create: { email: 'admin@restaurant.test', name: 'Restaurant Admin', role: UserRole.ADMIN, passwordHash },
  })

  await prisma.user.upsert({
    where: { email: 'staff@restaurant.test' },
    update: { name: 'Restaurant Staff', role: UserRole.STAFF, passwordHash },
    create: { email: 'staff@restaurant.test', name: 'Restaurant Staff', role: UserRole.STAFF, passwordHash },
  })

  const cuisineIds = new Map<string, string>()
  for (const [displayOrder, cuisine] of cuisines.entries()) {
    const savedCuisine = await prisma.cuisine.upsert({
      where: { name: cuisine.name },
      update: { ...cuisine, displayOrder: displayOrder + 1 },
      create: { ...cuisine, displayOrder: displayOrder + 1 },
    })
    cuisineIds.set(savedCuisine.name, savedCuisine.id)
  }

  for (const meal of meals) {
    const cuisineId = cuisineIds.get(meal.cuisine)
    if (!cuisineId) throw new Error(`Missing cuisine for meal: ${meal.name}`)

    const existingMeal = await prisma.meal.findFirst({ where: { name: meal.name, cuisineId } })
    const mealData = {
      description: meal.description,
      price: meal.price,
      imageUrl: null,
      prepTimeMinutes: meal.prepTimeMinutes,
      status: MealStatus.AVAILABLE,
      dietaryTags: meal.dietaryTags,
      isFeatured: meal.isFeatured,
      cuisineId,
    }

    if (existingMeal) {
      await prisma.meal.update({ where: { id: existingMeal.id }, data: mealData })
    } else {
      await prisma.meal.create({ data: { name: meal.name, ...mealData } })
    }
  }

  for (const table of tables) {
    await prisma.table.upsert({ where: { name: table.name }, update: table, create: table })
  }

  console.log(`Seeded ${cuisines.length} cuisines, ${meals.length} meals, ${tables.length} tables, and 2 users.`)
}

main()
  .catch((error) => {
    console.error('Database seed failed.', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
