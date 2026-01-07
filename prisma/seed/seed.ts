import { PrismaClient } from '../../src/lib/server/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL!;
if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined in environment variables.');
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: DATABASE_URL })
}).$extends(withAccelerate());

async function main() {
	const seedNutritionData = [
		{
			code: '10001882',
			product_name: 'Ripen At Home Bananas',
			brands: 'Tesco',
			energy_kcal_100g: 90,
			proteins_100g: 1.2,
			fat_100g: 0.5,
			carbohydrates_100g: 20.3,
			saturated_fat_100g: null,
			unsaturated_fat_100g: null,
			monounsaturated_fat_100g: null,
			polyunsaturated_fat_100g: null,
			trans_fat_100g: null,
			cholesterol_100g: null,
			sugars_100g: 18.1,
			polyols_100g: null,
			fiber_100g: 1.4,
			salt_100g: 0.01,
			sodium_100g: 0,
			alcohol_100g: null,
			vitamin_a_100g: null,
			vitamin_d_100g: null,
			vitamin_e_100g: null,
			vitamin_k_100g: null,
			vitamin_c_100g: null,
			vitamin_b1_100g: null,
			vitamin_b2_100g: null,
			vitamin_b6_100g: null,
			vitamin_b9_100g: null,
			folates_100g: null,
			vitamin_b12_100g: null,
			potassium_100g: null,
			calcium_100g: null,
			phosphorus_100g: null,
			iron_100g: null,
			magnesium_100g: null,
			zinc_100g: null,
			copper_100g: null,
			manganese_100g: null,
			caffeine_100g: null
		}
	];
	await prisma.nutritionData.createMany({
		data: seedNutritionData
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
