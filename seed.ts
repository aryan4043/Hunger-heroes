import { db } from './db';
import { donors, donations } from '@shared/schema';
import { hashPassword } from './util/password';

// Chennai restaurant data with distances from SRM College Potheri
const chennaiRestaurants = [
  {
    name: "Saravana Bhavan",
    email: "saravana@example.com",
    password: "password123",
    phone: "9876543210",
    address: "12 GST Road",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "603203",
    organizationType: "Restaurant",
    latitude: 12.8231,  // approx. 1.5 km from SRM
    longitude: 80.0442,
    donationInfo: {
      title: "South Indian Food",
      description: "Fresh idli, dosa, and sambar available daily",
      foodType: "Vegetarian",
      quantity: "10-15 servings",
      expiryDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      status: "available"
    }
  },
  {
    name: "Pind Punjabi Dhaba",
    email: "pind@example.com",
    password: "password123",
    phone: "9876543211",
    address: "45 OMR Road",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "603202",
    organizationType: "Restaurant",
    latitude: 12.8295,  // approx. 2.2 km from SRM
    longitude: 80.0512,
    donationInfo: {
      title: "North Indian Thali",
      description: "Roti, dal, paneer dishes, and rice",
      foodType: "Vegetarian & Non-Vegetarian",
      quantity: "20 servings",
      expiryDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      status: "available"
    }
  },
  {
    name: "Biryani Zone",
    email: "biryani@example.com",
    password: "password123",
    phone: "9876543212",
    address: "78 Potheri Main Road",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "603203",
    organizationType: "Restaurant",
    latitude: 12.8201,  // approx. 0.8 km from SRM
    longitude: 80.0394,
    donationInfo: {
      title: "Chennai Biryani",
      description: "Hyderabadi style chicken and vegetable biryani",
      foodType: "Non-Vegetarian",
      quantity: "15-20 servings",
      expiryDate: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      status: "available"
    }
  },
  {
    name: "Cake Walk Bakery",
    email: "cakewalk@example.com",
    password: "password123",
    phone: "9876543213",
    address: "23 College Road",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "603203",
    organizationType: "Bakery",
    latitude: 12.8188,  // approx. 0.5 km from SRM
    longitude: 80.0416,
    donationInfo: {
      title: "Assorted Breads & Pastries",
      description: "Fresh bread, pastries, and cakes from today's batch",
      foodType: "Vegetarian",
      quantity: "30+ items",
      expiryDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      status: "available"
    }
  },
  {
    name: "Chennai Meals",
    email: "chennai.meals@example.com",
    password: "password123",
    phone: "9876543214",
    address: "56 Guduvancheri Road",
    city: "Chennai",
    state: "Tamil Nadu",
    zipCode: "603202",
    organizationType: "Restaurant",
    latitude: 12.8301,  // approx. 2.5 km from SRM
    longitude: 80.0523,
    donationInfo: {
      title: "Tamil Nadu Meals",
      description: "Complete south Indian thali with rice, sambar, rasam, and sides",
      foodType: "Vegetarian",
      quantity: "25 servings",
      expiryDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      status: "available"
    }
  }
];

// Function to seed the database with Chennai restaurants and their donations
export async function seedChennaiRestaurants() {
  console.log("Starting to seed Chennai restaurants...");
  
  for (const restaurant of chennaiRestaurants) {
    try {
      // Check if the restaurant already exists
      const existingDonor = await db.query.donors.findFirst({
        where: (donors, { eq }) => eq(donors.email, restaurant.email)
      });
      
      if (existingDonor) {
        console.log(`Restaurant ${restaurant.name} already exists, skipping...`);
        continue;
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(restaurant.password);
      
      // Insert the donor (restaurant)
      const [donor] = await db
        .insert(donors)
        .values({
          email: restaurant.email,
          password: hashedPassword,
          name: restaurant.name,
          phone: restaurant.phone,
          address: restaurant.address,
          city: restaurant.city,
          state: restaurant.state,
          zipCode: restaurant.zipCode,
          organizationType: restaurant.organizationType,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude
        })
        .returning();
      
      console.log(`Added restaurant: ${restaurant.name} with ID: ${donor.id}`);
      
      // Insert the donation from this restaurant
      const [donation] = await db
        .insert(donations)
        .values({
          donorId: donor.id,
          title: restaurant.donationInfo.title,
          description: restaurant.donationInfo.description,
          foodType: restaurant.donationInfo.foodType,
          quantity: restaurant.donationInfo.quantity,
          expiryDate: restaurant.donationInfo.expiryDate,
          status: restaurant.donationInfo.status,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude
        })
        .returning();
      
      console.log(`Added donation: ${donation.title} with ID: ${donation.id} from ${restaurant.name}`);
    } catch (error) {
      console.error(`Error adding restaurant ${restaurant.name}:`, error);
    }
  }
  
  console.log("Chennai restaurants seeding completed!");
}