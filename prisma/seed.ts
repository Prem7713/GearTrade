import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting GearTrade Marketplace Database Seed...");

  // 1. Clean existing records in proper relational order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productQuestion.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.offerMessage.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleBrand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.websiteSetting.deleteMany();
  await prisma.user.deleteMany();

  // 2. Passwords
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const managerPasswordHash = await bcrypt.hash("manager123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  // 3. Create Users
  const superAdmin = await prisma.user.create({
    data: {
      name: "Amit Sharma (Super Admin)",
      email: "admin@geartrade.in",
      phone: "+91 99887 76655",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
  });

  const inventoryManager = await prisma.user.create({
    data: {
      name: "Rohan Verma (Inventory Lead)",
      email: "inventory@geartrade.in",
      phone: "+91 98777 11223",
      passwordHash: managerPasswordHash,
      role: "INVENTORY_MANAGER",
      status: "ACTIVE",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@gmail.com",
      phone: "+91 98765 43210",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Vikram Singh",
      email: "vikram.singh@gmail.com",
      phone: "+91 98111 22334",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  // Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        name: "Rajesh Kumar (Home)",
        phone: "+91 98765 43210",
        addressLine: "Flat 402, Sea Breeze Heights, Link Road, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400053",
        type: "HOME",
        isDefault: true,
      },
      {
        userId: customer1.id,
        name: "Rajesh Kumar (Garage / Workshop)",
        phone: "+91 98765 43210",
        addressLine: "Unit 12, Industrial Estate, Kanjurmarg West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400078",
        type: "OFFICE",
        isDefault: false,
      },
      {
        userId: customer2.id,
        name: "Vikram Singh",
        phone: "+91 98111 22334",
        addressLine: "B-24, Sector 56, Golf Course Road",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122011",
        type: "HOME",
        isDefault: true,
      },
    ],
  });

  // 4. Vehicle Brands
  const brands = await Promise.all([
    // Cars
    prisma.vehicleBrand.create({ data: { name: "Maruti Suzuki", vehicleType: "CAR", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Hyundai", vehicleType: "CAR", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Tata Motors", vehicleType: "CAR", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Mahindra", vehicleType: "CAR", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Honda", vehicleType: "CAR", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Toyota", vehicleType: "CAR", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Volkswagen", vehicleType: "CAR", popular: false } }),
    prisma.vehicleBrand.create({ data: { name: "Kia", vehicleType: "CAR", popular: true } }),
    // Bikes
    prisma.vehicleBrand.create({ data: { name: "Royal Enfield", vehicleType: "BIKE", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Honda 2-Wheelers", vehicleType: "BIKE", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Yamaha", vehicleType: "BIKE", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "TVS Motor", vehicleType: "BIKE", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "Bajaj Auto", vehicleType: "BIKE", popular: true } }),
    prisma.vehicleBrand.create({ data: { name: "KTM", vehicleType: "BIKE", popular: true } }),
  ]);

  const brandMap = new Map(brands.map((b) => [b.name, b]));

  // 5. Vehicle Models
  const models = await Promise.all([
    // Cars
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Hyundai")!.id,
        name: "Creta",
        vehicleType: "CAR",
        years: "2019,2020,2021,2022,2023,2024",
        fuelTypes: "Petrol,Diesel",
        variants: "E,EX,S,SX,SX(O),Knight",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Mahindra")!.id,
        name: "Thar",
        vehicleType: "CAR",
        years: "2020,2021,2022,2023,2024",
        fuelTypes: "Petrol,Diesel",
        variants: "AX,AX(O),LX 4x4,Earth Edition",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Maruti Suzuki")!.id,
        name: "Swift",
        vehicleType: "CAR",
        years: "2018,2019,2020,2021,2022,2023,2024",
        fuelTypes: "Petrol,CNG",
        variants: "LXi,VXi,ZXi,ZXi+",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Tata Motors")!.id,
        name: "Nexon",
        vehicleType: "CAR",
        years: "2020,2021,2022,2023,2024",
        fuelTypes: "Petrol,Diesel,EV",
        variants: "XE,XM,XZ+,Fearless,Creative",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Honda")!.id,
        name: "City",
        vehicleType: "CAR",
        years: "2017,2018,2019,2020,2021,2022,2023",
        fuelTypes: "Petrol,Diesel",
        variants: "V,VX,ZX,e:HEV",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Toyota")!.id,
        name: "Fortuner",
        vehicleType: "CAR",
        years: "2016,2017,2018,2019,2020,2021,2022,2023",
        fuelTypes: "Diesel,Petrol",
        variants: "4x2 AT,4x4 MT,4x4 AT,Legender",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Volkswagen")!.id,
        name: "Polo",
        vehicleType: "CAR",
        years: "2014,2015,2016,2017,2018,2019,2020,2021",
        fuelTypes: "Petrol,Diesel",
        variants: "Trendline,Comfortline,Highline Plus,GT TSI",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Mahindra")!.id,
        name: "Scorpio-N",
        vehicleType: "CAR",
        years: "2022,2023,2024,2025",
        fuelTypes: "Diesel,Petrol",
        variants: "Z2,Z4,Z6,Z8,Z8L 4x4",
      },
    }),
    // Bikes
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Royal Enfield")!.id,
        name: "Classic 350",
        vehicleType: "BIKE",
        years: "2017,2018,2019,2020,2021,2022,2023,2024",
        fuelTypes: "Petrol",
        variants: "Halcyon,Dark,Signals,Chrome,Stealth Black",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Honda 2-Wheelers")!.id,
        name: "Activa 6G",
        vehicleType: "BIKE",
        years: "2020,2021,2022,2023,2024",
        fuelTypes: "Petrol",
        variants: "Standard,Deluxe,H-Smart",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Yamaha")!.id,
        name: "YZF-R15 V4",
        vehicleType: "BIKE",
        years: "2021,2022,2023,2024",
        fuelTypes: "Petrol",
        variants: "Metallic Red,Racing Blue,M Edition",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("TVS Motor")!.id,
        name: "Apache RTR 160 4V",
        vehicleType: "BIKE",
        years: "2019,2020,2021,2022,2023,2024",
        fuelTypes: "Petrol",
        variants: "Single Disc,Dual Disc,Special Edition",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("Bajaj Auto")!.id,
        name: "Pulsar NS200",
        vehicleType: "BIKE",
        years: "2018,2019,2020,2021,2022,2023,2024",
        fuelTypes: "Petrol",
        variants: "Single ABS,Dual ABS",
      },
    }),
    prisma.vehicleModel.create({
      data: {
        brandId: brandMap.get("KTM")!.id,
        name: "Duke 390",
        vehicleType: "BIKE",
        years: "2017,2018,2019,2020,2021,2022,2023",
        fuelTypes: "Petrol",
        variants: "Standard ABS,Cornering ABS Gen 2",
      },
    }),
  ]);

  const modelMap = new Map(models.map((m) => [m.name, m]));

  // 6. Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Lighting & Electrical",
        slug: "lighting-electrical",
        vehicleType: "BOTH",
        icon: "Lightbulb",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Engine & Transmission",
        slug: "engine-transmission",
        vehicleType: "BOTH",
        icon: "Cog",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Body Panels & Mirrors",
        slug: "body-panels-mirrors",
        vehicleType: "BOTH",
        icon: "Shield",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Suspension & Steering",
        slug: "suspension-steering",
        vehicleType: "BOTH",
        icon: "Activity",
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Brakes & Wheels",
        slug: "brakes-wheels",
        vehicleType: "BOTH",
        icon: "Disc",
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: "Cooling & AC Parts",
        slug: "cooling-ac-parts",
        vehicleType: "CAR",
        icon: "Wind",
        sortOrder: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: "Exhaust & Silencer",
        slug: "exhaust-silencer",
        vehicleType: "BOTH",
        icon: "Flame",
        sortOrder: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: "Motorcycle Specialty & Tanks",
        slug: "motorcycle-specialty",
        vehicleType: "BIKE",
        icon: "Bike",
        sortOrder: 8,
      },
    }),
  ]);

  const catMap = new Map(categories.map((c) => [c.slug, c]));

  // 7. Seed Products with realistic data & genuine automotive images
  const productsData = [
    {
      sku: "PART-2026-000101",
      name: "Hyundai Creta (2020-2023) Right LED Trio-Beam Projector Headlight Assembly",
      slug: "hyundai-creta-right-led-projector-headlight-assembly",
      description:
        "Original Hyundai Mobis OEM LED projector headlamp unit removed from a low-mileage 2021 Creta SX. Thoroughly tested on our optical bench: all low-beam, high-beam, DRL eyebrow strips, and sequential blinker LEDs work at 100% factory brightness. Sealed casing, clear polycarbonate front lens buffed to showroom clarity with zero cracks or yellowing.",
      categoryId: catMap.get("lighting-electrical")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Hyundai")!.id,
      modelId: modelMap.get("Creta")!.id,
      variant: "SX, SX(O)",
      year: 2021,
      fuelType: "Petrol, Diesel",
      partNumber: "MOB-92102-M6000",
      oemNumber: "92102M6000",
      condition: "GENUINE_USED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Original factory seal intact. 2 bottom mounting lugs inspected and completely rigid. No broken clips.",
      cosmeticCondition: "9.5/10 - Zero deep scratches, minor micro-swirls buffed and sealed with UV ceramic coating.",
      functionalCondition: "100% tested - All LEDs, levelling motor, and harness plug pins tested and verified.",
      mileage: "18,400 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "One tiny hairline scratch (3mm) near outer rubber trim, completely invisible once installed.",
      hasDamage: false,
      price: 8200,
      comparePrice: 18500,
      minimumOfferPrice: 6500,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "30-Day Electrical & Moisture Replacement Warranty",
      returnEligibility: "7 Days Hassle-Free Returns for Compatibility",
      location: "Pune Warehouse - Bay A, Rack 04",
      weight: 3.4,
      dimensions: "62 x 28 x 25 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
          caption: "Front lens overview showing crystal clear poly-carb finish",
          isDamagePhoto: false,
          sortOrder: 0,
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
          caption: "Rear connector pins and OEM Hyundai Mobis factory barcode stamp",
          isDamagePhoto: false,
          sortOrder: 1,
        },
      ],
    },
    {
      sku: "PART-2026-000102",
      name: "Mahindra Thar (2020-2024) Front Off-Road Heavy Duty Bumper with Fog Inserts",
      slug: "mahindra-thar-front-offroad-bumper-assembly",
      description:
        "Original equipment front bumper pulled from a 2022 Thar LX 4x4. Includes steel-reinforced internal sub-beam, black textured polyurethane fascia, tow hook recesses, and OEM round halogen fog lamp housings. Sturdy and ready for direct bolt-on installation on all 2nd Gen Thar variants.",
      categoryId: catMap.get("body-panels-mirrors")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Mahindra")!.id,
      modelId: modelMap.get("Thar")!.id,
      variant: "LX, AX(O)",
      year: 2022,
      fuelType: "Petrol, Diesel",
      partNumber: "MAH-0104AAB021",
      oemNumber: "0104AAB02100N",
      condition: "GENUINE_USED",
      conditionRating: "GOOD",
      conditionNotes: "Structural integrity 100%. All chassis bolt holes align true. Has light scuffing underneath from off-road trail use.",
      cosmeticCondition: "8.5/10 - Minor scuffing on underside front skid lip, fully cosmetic.",
      functionalCondition: "100% Rigid - Zero cracks, brackets completely intact.",
      mileage: "14,200 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "Light surface scrapes on bottom undertray plastic (see photo). Does not affect fitment or look.",
      hasDamage: true,
      price: 9500,
      comparePrice: 22000,
      minimumOfferPrice: 7800,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "15-Day Fitment Guarantee",
      returnEligibility: "7 Days Inspection Return",
      location: "Mumbai Central Depot - Rack C-02",
      weight: 12.8,
      dimensions: "172 x 45 x 38 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
          caption: "Mahindra Thar Front Bumper Assembly Genuine Used",
          isDamagePhoto: false,
          sortOrder: 0,
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
          caption: "Disclosed minor surface scuff on bottom protective lip",
          isDamagePhoto: true,
          sortOrder: 1,
        },
      ],
    },
    {
      sku: "PART-2026-000103",
      name: "Maruti Suzuki Swift (2018-2023) 1.2L K12M 5-Speed Manual Transmission Gearbox",
      slug: "maruti-swift-k12m-manual-gearbox-transmission",
      description:
        "Tested 5-speed manual transaxle for Maruti Swift & Dzire K12 Petrol models. Drained fluid inspected clear of metal shavings, synchronizer rings for 1st, 2nd, and Reverse tested smooth without crunching, differential gears checked for lash and pre-load. Flushed, pressure-washed, and sealed with fresh input shaft seals.",
      categoryId: catMap.get("engine-transmission")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Maruti Suzuki")!.id,
      modelId: modelMap.get("Swift")!.id,
      variant: "VXi, ZXi, ZXi+",
      year: 2020,
      fuelType: "Petrol",
      partNumber: "MS-24700M74PA0",
      oemNumber: "24700-74PA0",
      condition: "REFURBISHED",
      conditionRating: "EXCELLENT",
      conditionNotes: "New oil seals installed, clutch fork checked, zero gear whine under test rig.",
      cosmeticCondition: "9/10 - Clean aluminum casing.",
      functionalCondition: "100% Tested and Guaranteed Smooth Gear Shift Action.",
      mileage: "36,500 KM",
      inspectionStatus: "TESTED",
      damageDisclosure: "None. Factory casing free of cracks or stripped thread mounts.",
      hasDamage: false,
      price: 14500,
      comparePrice: 38000,
      minimumOfferPrice: 12000,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "45-Day Replacement Mechanical Warranty",
      returnEligibility: "10-Day Compatibility Guarantee",
      location: "Gurugram Warehouse - Heavy Parts Bay 3",
      weight: 34.0,
      dimensions: "55 x 48 x 42 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
          caption: "5-Speed Transaxle cleaned and prepped for dispatch",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000104",
      name: "Tata Nexon (2020-2023) 1.2L Revotron Turbocharger Assembly with Wastegate Actuator",
      slug: "tata-nexon-1-2-revotron-turbocharger-assembly",
      description:
        "Garrett/Honeywell OEM turbocharger unit for Tata Nexon Petrol. Inspected for turbine wheel blade damage, zero radial or axial shaft play, electronic wastegate actuator cycled smoothly with no diagnostic error codes. Carbon cleaned and oil passages flow tested.",
      categoryId: catMap.get("engine-transmission")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Tata Motors")!.id,
      modelId: modelMap.get("Nexon")!.id,
      variant: "XZ+, XZ+(O), Fearless",
      year: 2022,
      fuelType: "Petrol",
      partNumber: "TATA-54439700034",
      oemNumber: "287009110118",
      condition: "GENUINE_USED",
      conditionRating: "EXCELLENT",
      conditionNotes: "No oil burning or smoking history. Turbine spins freely like new.",
      cosmeticCondition: "9/10 - Light heat patina on exhaust housing as expected.",
      functionalCondition: "100% Verified boost pressure on test vehicle.",
      mileage: "24,000 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None. Manifold flange studs in perfect condition.",
      hasDamage: false,
      price: 11800,
      comparePrice: 29000,
      minimumOfferPrice: 9500,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "30-Day Boost Pressure Warranty",
      returnEligibility: "7 Days Returns",
      location: "Pune Warehouse - Rack D-08",
      weight: 6.2,
      dimensions: "32 x 26 x 22 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
          caption: "Turbine blades and wastegate assembly overview",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000105",
      name: "Royal Enfield Classic 350 Reborn Genuine Chrome Long Silencer Exhaust with Heat Shield",
      slug: "royal-enfield-classic-350-genuine-chrome-silencer",
      description:
        "Original factory OEM silencer exhaust taken off a 2022 Classic 350 Halcyon Green bike when customer upgraded to aftermarket exhaust immediately after delivery. Flawless mirror chrome finish with original baffle tubes intact for the authentic deep RE thumping sound. BS6 compliant with catalytic mesh inside.",
      categoryId: catMap.get("exhaust-silencer")!.id,
      vehicleType: "BIKE",
      brandId: brandMap.get("Royal Enfield")!.id,
      modelId: modelMap.get("Classic 350")!.id,
      variant: "Halcyon, Dark, Signals",
      year: 2022,
      fuelType: "Petrol",
      partNumber: "RE-RAK00012-A",
      oemNumber: "RAK00012",
      condition: "OPEN_BOX",
      conditionRating: "EXCELLENT",
      conditionNotes: "Only 450 km run before upgrade. Almost brand-new condition.",
      cosmeticCondition: "9.8/10 - Zero dents, chrome reflection is crystal clear.",
      functionalCondition: "100% Factory OEM Backpressure and Sound.",
      mileage: "450 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None. No scrapes on bottom curve.",
      hasDamage: false,
      price: 3800,
      comparePrice: 8500,
      minimumOfferPrice: 3000,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "30-Day Chrome Peel & Fitment Warranty",
      returnEligibility: "7 Days Return Policy",
      location: "Chennai Hub - Two Wheeler Bay 1",
      weight: 4.8,
      dimensions: "95 x 18 x 14 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
          caption: "Chrome exhaust with heat shield installed",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000106",
      name: "Yamaha YZF-R15 V4 OEM Upside-Down (USD) Front Fork Suspension Set (Golden Finish)",
      slug: "yamaha-r15-v4-golden-usd-front-fork-set",
      description:
        "Pair of original KYB 37mm inverted front telescopic forks in factory anodized gold finish. Inspected on dial indicator gauge: zero bending, inner stanchion tubes are mirror-smooth with no stone chips or pits. New fork seals and synthetic 10W suspension oil filled.",
      categoryId: catMap.get("suspension-steering")!.id,
      vehicleType: "BIKE",
      brandId: brandMap.get("Yamaha")!.id,
      modelId: modelMap.get("YZF-R15 V4")!.id,
      variant: "Racing Blue, M Edition",
      year: 2022,
      fuelType: "Petrol",
      partNumber: "YAM-B97-F3100",
      oemNumber: "B97F310000",
      condition: "REFURBISHED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Fork legs laser-measured for straightness. Zero seal leakage.",
      cosmeticCondition: "9/10 - Clean gold anodized finish.",
      functionalCondition: "100% progressive compression and rebound damping.",
      mileage: "11,800 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None. Bottom axle clamps clean with unstripped Allen bolts.",
      hasDamage: false,
      price: 6500,
      comparePrice: 14000,
      minimumOfferPrice: 5200,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "30-Day Damping & Oil Seal Warranty",
      returnEligibility: "7 Days Returns",
      location: "Bengaluru Hub - Rack B-06",
      weight: 7.5,
      dimensions: "82 x 22 x 18 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
          caption: "Golden Inverted Forks tested for track and street balance",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000107",
      name: "Honda City 5th Gen (2020-2023) Left Power ORVM Door Mirror with LaneWatch Camera",
      slug: "honda-city-5th-gen-left-orvm-mirror-with-camera",
      description:
        "Original Honda genuine electrically folding heated side mirror in Platinum White Pearl. Includes built-in high-definition LaneWatch blind-spot camera and LED turn indicator strip. Glass adjustment motor, power fold motor, and camera feed thoroughly bench-tested.",
      categoryId: catMap.get("body-panels-mirrors")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Honda")!.id,
      modelId: modelMap.get("City")!.id,
      variant: "VX, ZX",
      year: 2021,
      fuelType: "Petrol, Diesel",
      partNumber: "HON-76258-T00-Z01",
      oemNumber: "76258T00Z01",
      condition: "GENUINE_USED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Camera video output clear and crisp on diagnostic monitor.",
      cosmeticCondition: "9.2/10 - Pristine painted cover cap.",
      functionalCondition: "100% Tested folding, indicator, and camera.",
      mileage: "21,000 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None.",
      hasDamage: false,
      price: 4500,
      comparePrice: 10500,
      minimumOfferPrice: 3500,
      stock: 1,
      isSold: false,
      isFeatured: false,
      warranty: "30-Day Camera & Motor Warranty",
      returnEligibility: "7 Days Returns",
      location: "Pune Warehouse - Bay E, Rack 02",
      weight: 2.1,
      dimensions: "34 x 26 x 20 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
          caption: "Left ORVM with embedded LaneWatch camera unit",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000108",
      name: "Toyota Fortuner (2016-2022) OEM 18-Inch Diamond Cut Dual-Tone Alloy Wheel (Single)",
      slug: "toyota-fortuner-18-inch-diamond-cut-alloy-wheel",
      description:
        "Genuine Toyota OEM 18x8J PCD 6x139.7 alloy rim in factory machined diamond cut with dark grey inner spokes. Tested on wheel balancing machine: zero runout, zero bends, completely true. Ideal as a replacement for a bent wheel or full-size fifth spare wheel.",
      categoryId: catMap.get("brakes-wheels")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Toyota")!.id,
      modelId: modelMap.get("Fortuner")!.id,
      variant: "4x4, Legender",
      year: 2021,
      fuelType: "Diesel",
      partNumber: "TOY-42611-0K750",
      oemNumber: "426110K750",
      condition: "GENUINE_USED",
      conditionRating: "GOOD",
      conditionNotes: "Wheel balance tested within 5 grams. Valve stem included.",
      cosmeticCondition: "8.8/10 - Minor light curb mark on 2 inches of outer bead lip.",
      functionalCondition: "100% True, no air leakage, perfect structural integrity.",
      mileage: "29,000 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "Superficial curb mark on outer edge (see photo). No structural compromise.",
      hasDamage: true,
      price: 7900,
      comparePrice: 19500,
      minimumOfferPrice: 6500,
      stock: 1,
      isSold: false,
      isFeatured: false,
      warranty: "30-Day Trueness & Balance Guarantee",
      returnEligibility: "7 Days Inspection Return",
      location: "Delhi NCR Hub - Heavy Racks",
      weight: 13.5,
      dimensions: "50 x 50 x 24 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
          caption: "18-inch Fortuner OEM Rim overview",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000109",
      name: "Volkswagen Polo GT TSI (2014-2020) Denso AC Compressor Pump Assembly",
      slug: "volkswagen-polo-gt-tsi-ac-compressor-pump",
      description:
        "Original Denso variable displacement air conditioning compressor. Pulled from a low-mileage Polo 1.2 TSI. Pressure checked with dry nitrogen, internal pistons and swash plate in clean condition with no black oil or clutch burn. Magnetic clutch and pulley bearings silent.",
      categoryId: catMap.get("cooling-ac-parts")!.id,
      vehicleType: "CAR",
      brandId: brandMap.get("Volkswagen")!.id,
      modelId: modelMap.get("Polo")!.id,
      variant: "Highline, GT TSI",
      year: 2018,
      fuelType: "Petrol",
      partNumber: "VW-6R0820803J",
      oemNumber: "6R0820803J",
      condition: "REFURBISHED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Filled with fresh PAG 46 oil. Sealed ports.",
      cosmeticCondition: "9/10 - Cleaned casing.",
      functionalCondition: "100% Verified compression output and magnetic clutch engagement.",
      mileage: "31,000 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None.",
      hasDamage: false,
      price: 9200,
      comparePrice: 24000,
      minimumOfferPrice: 7500,
      stock: 1,
      isSold: false,
      isFeatured: false,
      warranty: "30-Day Cooling Performance Warranty",
      returnEligibility: "7 Days Returns",
      location: "Pune Warehouse - Bay F, Rack 01",
      weight: 5.8,
      dimensions: "26 x 22 x 18 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
          caption: "Denso AC Compressor with tested electromagnetic clutch",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000110",
      name: "KTM Duke 390 (2017-2022) Bosch 9.1MP Dual-Channel ABS Modulator ECU Unit",
      slug: "ktm-duke-390-bosch-abs-modulator-ecu-unit",
      description:
        "Original Bosch ABS hydraulic control module and electronic control unit assembly for KTM Duke 390 & RC 390. Diagnostic scan tool verified: zero fault codes, solenoids click promptly, pump motor tested with 12V source. Brake fluid lines clean and flushed.",
      categoryId: catMap.get("brakes-wheels")!.id,
      vehicleType: "BIKE",
      brandId: brandMap.get("KTM")!.id,
      modelId: modelMap.get("Duke 390")!.id,
      variant: "Standard ABS",
      year: 2020,
      fuelType: "Petrol",
      partNumber: "KTM-90142001000",
      oemNumber: "90142001000",
      condition: "GENUINE_USED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Hydraulic ports sealed with dust caps.",
      cosmeticCondition: "9.5/10 - Factory clean.",
      functionalCondition: "100% Solenoids, sensors, and electronic communication verified.",
      mileage: "16,200 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None.",
      hasDamage: false,
      price: 8900,
      comparePrice: 21000,
      minimumOfferPrice: 7000,
      stock: 1,
      isSold: false,
      isFeatured: true,
      warranty: "30-Day Electrical & Brake Circuit Warranty",
      returnEligibility: "7 Days Returns",
      location: "Bengaluru Hub - Electronics Vault",
      weight: 1.4,
      dimensions: "20 x 15 x 12 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
          caption: "Bosch ABS Controller Unit for KTM 390 series",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000111",
      name: "Honda Activa 6G Genuine Keihin Electronic Fuel Injection (EFI) Throttle Body",
      slug: "honda-activa-6g-keihin-efi-throttle-body",
      description:
        "Original Honda Keihin throttle body assembly complete with TPS (Throttle Position Sensor) and IACV (Idle Air Control Valve). Ultrasonic cleaned to remove all carbon varnish, butterfly flap closes with zero light leak, TPS calibrated to factory voltage specifications.",
      categoryId: catMap.get("engine-transmission")!.id,
      vehicleType: "BIKE",
      brandId: brandMap.get("Honda 2-Wheelers")!.id,
      modelId: modelMap.get("Activa 6G")!.id,
      variant: "Deluxe, Standard",
      year: 2022,
      fuelType: "Petrol",
      partNumber: "HON-16100-K0R-V01",
      oemNumber: "16100K0RV01",
      condition: "REFURBISHED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Sensors tested for resistance sweep. Smooth idle guarantee.",
      cosmeticCondition: "9.5/10 - Like new.",
      functionalCondition: "100% Tested on live Activa 6G test scooter.",
      mileage: "8,900 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None.",
      hasDamage: false,
      price: 2400,
      comparePrice: 5800,
      minimumOfferPrice: 1900,
      stock: 1,
      isSold: false,
      isFeatured: false,
      warranty: "30-Day Smooth Idle Warranty",
      returnEligibility: "7 Days Returns",
      location: "Pune Warehouse - Bay B, Shelf 14",
      weight: 0.9,
      dimensions: "18 x 14 x 12 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
          caption: "Keihin Throttle Body ultrasonic cleaned",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
    {
      sku: "PART-2026-000112",
      name: "TVS Apache RTR 160 4V Bluetooth SmartXonnect Full Digital Meter Console",
      slug: "tvs-apache-rtr-160-4v-digital-speedometer-console",
      description:
        "Original TVS OEM digital instrument cluster with turn-by-turn navigation display, gear position indicator, 0-60 timer, and Bluetooth connectivity. Fully tested LCD segments, crisp blue backlighting, intact rubber seal, and zero condensation inside.",
      categoryId: catMap.get("lighting-electrical")!.id,
      vehicleType: "BIKE",
      brandId: brandMap.get("TVS Motor")!.id,
      modelId: modelMap.get("Apache RTR 160 4V")!.id,
      variant: "Special Edition, Dual Disc",
      year: 2022,
      fuelType: "Petrol",
      partNumber: "TVS-N9160350",
      oemNumber: "N9160350",
      condition: "GENUINE_USED",
      conditionRating: "EXCELLENT",
      conditionNotes: "Odometer shows verified 12,410 km. Display bright and clear.",
      cosmeticCondition: "9/10 - Zero deep scratches on acrylic face.",
      functionalCondition: "100% Tested button responsiveness, Bluetooth pairing, and RPM sweep.",
      mileage: "12,410 KM",
      inspectionStatus: "INSPECTED_TESTED",
      damageDisclosure: "None. Mounting studs and wiring harness plug completely intact.",
      hasDamage: false,
      price: 2900,
      comparePrice: 6200,
      minimumOfferPrice: 2200,
      stock: 1,
      isSold: false,
      isFeatured: false,
      warranty: "30-Day Display & Electronics Warranty",
      returnEligibility: "7 Days Returns",
      location: "Chennai Hub - Two Wheeler Bay 3",
      weight: 0.7,
      dimensions: "22 x 15 x 10 cm",
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
          caption: "SmartXonnect Digital Speedometer Unit",
          isDamagePhoto: false,
          sortOrder: 0,
        },
      ],
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const { images, ...prodData } = item;
    const p = await prisma.product.create({
      data: {
        ...prodData,
        images: {
          create: images.map((img) => ({
            imageUrl: img.imageUrl,
            caption: img.caption,
            isDamagePhoto: img.isDamagePhoto,
            sortOrder: img.sortOrder,
          })),
        },
      },
    });
    createdProducts.push(p);
  }

  // 8. Create Realistic Offers & Negotiations
  // Offer 1: Accepted bargain on Hyundai Creta Headlight
  const cretaProduct = createdProducts[0];
  const acceptedOffer = await prisma.offer.create({
    data: {
      offerNumber: "OFF-2026-0089",
      productId: cretaProduct.id,
      customerId: customer1.id,
      originalPrice: cretaProduct.price, // 8200
      currentOffer: 6800,
      customerNote: "Looking to replace broken left-side headlight after minor scrape. Can you do ₹6,500?",
      status: "ACCEPTED",
      roundsCount: 3,
      maxRounds: 4,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000), // 48h validity
      acceptedAt: new Date(),
      checkoutToken: "CHK-OFFER-ACCEPTED-89X4",
      isCheckedOut: false,
      messages: {
        create: [
          {
            senderId: customer1.id,
            senderRole: "CUSTOMER",
            message: "Hello, my Creta has an issue with the right lamp. Can I buy this for ₹6,500?",
            offerAmount: 6500,
          },
          {
            senderId: superAdmin.id,
            senderRole: "ADMIN",
            message: "Hi Rajesh! This is an OEM unit in 9.5/10 condition tested on our bench. Best we can do is ₹7,200.",
            offerAmount: 7200,
          },
          {
            senderId: customer1.id,
            senderRole: "CUSTOMER",
            message: "Fair deal. How about ₹6,800 final and I will checkout immediately today?",
            offerAmount: 6800,
          },
          {
            senderId: superAdmin.id,
            senderRole: "ADMIN",
            message: "Deal accepted! Price locked at ₹6,800. Please proceed to checkout within 48 hours.",
            offerAmount: 6800,
          },
        ],
      },
    },
  });

  // Offer 2: Active pending counter-offer on Thar Bumper
  const tharProduct = createdProducts[1];
  await prisma.offer.create({
    data: {
      offerNumber: "OFF-2026-0092",
      productId: tharProduct.id,
      customerId: customer2.id,
      originalPrice: tharProduct.price, // 9500
      currentOffer: 8200,
      customerNote: "Need this for my Thar 2021 build. Please consider ₹7,500.",
      status: "COUNTER_OFFER",
      roundsCount: 2,
      maxRounds: 4,
      expiresAt: new Date(Date.now() + 36 * 3600 * 1000),
      messages: {
        create: [
          {
            senderId: customer2.id,
            senderRole: "CUSTOMER",
            message: "Hi, I saw the scuff on the bottom undertray. Can you accept ₹7,500 for it?",
            offerAmount: 7500,
          },
          {
            senderId: superAdmin.id,
            senderRole: "ADMIN",
            message: "Hi Vikram! The bumper includes OEM fog housings and steel internal beam. We can do ₹8,200 including shipping.",
            offerAmount: 8200,
          },
        ],
      },
    },
  });

  // 9. Orders
  // Order 1: Delivered order for Maruti Swift Starter Motor / Refurbished Parts
  const deliveredOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-90412",
      customerId: customer1.id,
      customerName: "Rajesh Kumar",
      customerEmail: "rajesh.kumar@gmail.com",
      customerPhone: "+91 98765 43210",
      subtotal: 14500,
      discount: 500,
      couponCode: "WELCOME500",
      shipping: 0,
      tax: 2520, // 18% GST on 14000
      total: 16520,
      paymentStatus: "PAID",
      orderStatus: "DELIVERED",
      paymentMethod: "UPI",
      paymentGateway: "RAZORPAY",
      transactionId: "pay_RZP_90412_UPI_OK",
      shippingAddress: JSON.stringify({
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        addressLine: "Flat 402, Sea Breeze Heights, Link Road, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400053",
      }),
      trackingNumber: "BLUEDART-88219412",
      shippingCompany: "Blue Dart Express",
      estimatedDelivery: "Delivered on 28 Sep 2026",
      internalNotes: "Verified OEM serial, tested before packaging in bubble crate.",
      gstNumber: "27AABCT8521P1Z4",
      invoiceNumber: "INV-2026-09-0012",
      items: {
        create: [
          {
            productId: createdProducts[2].id, // Swift Gearbox
            productName: createdProducts[2].name,
            productSku: createdProducts[2].sku,
            price: 14500,
            quantity: 1,
            condition: "REFURBISHED",
            oemNumber: "24700-74PA0",
          },
        ],
      },
      payments: {
        create: {
          customerId: customer1.id,
          paymentGateway: "RAZORPAY",
          transactionId: "pay_RZP_90412_UPI_OK",
          amount: 16520,
          status: "SUCCESS",
        },
      },
    },
  });

  // Order 2: Shipped order for Tata Nexon Turbocharger
  await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-90413",
      customerId: customer2.id,
      customerName: "Vikram Singh",
      customerEmail: "vikram.singh@gmail.com",
      customerPhone: "+91 98111 22334",
      subtotal: 11800,
      discount: 0,
      shipping: 250,
      tax: 2169,
      total: 14219,
      paymentStatus: "PAID",
      orderStatus: "SHIPPED",
      paymentMethod: "CARD",
      paymentGateway: "RAZORPAY",
      transactionId: "pay_RZP_90413_CARD_OK",
      shippingAddress: JSON.stringify({
        name: "Vikram Singh",
        phone: "+91 98111 22334",
        addressLine: "B-24, Sector 56, Golf Course Road",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122011",
      }),
      trackingNumber: "DELHIVERY-992147",
      shippingCompany: "Delhivery Surface Express",
      estimatedDelivery: "Expected by tomorrow, 5 PM",
      internalNotes: "Packaged with dual foam lining for turbo actuator.",
      gstNumber: "06AABCT8521P1Z5",
      invoiceNumber: "INV-2026-09-0013",
      items: {
        create: [
          {
            productId: createdProducts[3].id, // Nexon Turbo
            productName: createdProducts[3].name,
            productSku: createdProducts[3].sku,
            price: 11800,
            quantity: 1,
            condition: "GENUINE_USED",
            oemNumber: "287009110118",
          },
        ],
      },
    },
  });

  // 10. Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: createdProducts[2].id, // Swift Gearbox
        customerId: customer1.id,
        orderId: deliveredOrder.id,
        rating: 5,
        title: "Exact fit for my 2020 Swift VXi! Super smooth shifts.",
        comment:
          "I was worried about ordering a used gearbox online, but GearTrade team sent video of bench testing beforehand. Installed it at my mechanic in Andheri West yesterday. All gear shifts are buttery smooth, zero whine. Saved ₹23,000 compared to Maruti Authorized service quote!",
        conditionRating: "EXCELLENT",
        isVerifiedPurchase: true,
        status: "APPROVED",
      },
      {
        productId: createdProducts[0].id, // Creta Headlamp
        customerId: customer2.id,
        rating: 5,
        title: "Genuine Hyundai Mobis part, looks brand new!",
        comment:
          "The projector lens has zero scratches and the DRL animation is crisp. Fast delivery to Gurugram in wooden crate packaging. The bargaining feature is brilliant!",
        conditionRating: "EXCELLENT",
        isVerifiedPurchase: true,
        status: "APPROVED",
      },
    ],
  });

  // 11. Support Tickets
  await prisma.supportTicket.create({
    data: {
      ticketNumber: "TKT-2026-104",
      customerId: customer1.id,
      orderId: deliveredOrder.id,
      subject: "Inquiry regarding oil capacity for Swift K12 gearbox",
      category: "PART_ISSUE",
      description:
        "Hello, my mechanic asked what transmission oil grade is pre-filled or recommended for this refurbished K12 unit?",
      priority: "MEDIUM",
      status: "RESOLVED",
      assignedAdminId: superAdmin.id,
      messages: {
        create: [
          {
            senderId: customer1.id,
            senderRole: "CUSTOMER",
            message: "Hello team, please let me know the recommended gear oil grade and quantity.",
          },
          {
            senderId: superAdmin.id,
            senderRole: "ADMIN",
            message:
              "Hi Rajesh! It requires 2.2 Litres of 75W-80 GL-4 gear oil (Shell Spirax or Maruti Genuine Gear Oil). Do not use GL-5 as it can degrade copper synchros.",
          },
          {
            senderId: customer1.id,
            senderRole: "CUSTOMER",
            message: "Understood, thank you for the prompt technical guidance!",
          },
        ],
      },
    },
  });

  // 12. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME500",
        discountType: "FIXED",
        discountValue: 500,
        minimumOrder: 3000,
        usageLimit: 500,
        usedCount: 34,
        status: "ACTIVE",
      },
      {
        code: "GEARTRADE10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumOrder: 5000,
        maximumDiscount: 1500,
        usageLimit: 200,
        usedCount: 18,
        status: "ACTIVE",
      },
      {
        code: "BIKE200",
        discountType: "FIXED",
        discountValue: 200,
        minimumOrder: 1500,
        usageLimit: 100,
        usedCount: 12,
        status: "ACTIVE",
      },
    ],
  });

  // 13. Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "Quality Used Auto Parts. Better Prices. Your Deal.",
        subtitle: "Find genuine tested used, refurbished & surplus car and bike parts across India — and make your own offer.",
        imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1600&q=80",
        linkUrl: "/shop",
        badge: "VERIFIED SALVAGE & OEM DISMANTLERS",
        buttonText: "Browse Parts Catalog",
        sortOrder: 1,
        active: true,
      },
      {
        title: "India's 1st Automotive Bargaining Marketplace",
        subtitle: "Don't pay fixed retail. Click 'Make an Offer' on any eligible used part and negotiate directly with our parts specialist.",
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80",
        linkUrl: "/bargain",
        badge: "LIVE PRICE NEGOTIATION",
        buttonText: "How Bargaining Works",
        sortOrder: 2,
        active: true,
      },
    ],
  });

  // 14. Website Settings
  await prisma.websiteSetting.createMany({
    data: [
      {
        key: "general",
        value: JSON.stringify({
          storeName: "GearTrade India",
          tagline: "Genuine Used & Refurbished Car & Bike Parts",
          supportEmail: "support@geartrade.in",
          salesEmail: "deals@geartrade.in",
          phone: "+91 8000 123 456",
          gstin: "27AABCT8521P1Z4",
          address: "Sector 4, MIDC Industrial Area, Chakan, Pune, Maharashtra 410501",
          currency: "INR",
          currencySymbol: "₹",
        }),
      },
      {
        key: "bargain",
        value: JSON.stringify({
          bargainingEnabled: true,
          minOfferPercentage: 60, // Minimum offer can be 60% of listed price
          maxNegotiationRounds: 4,
          offerExpiryHours: 48,
          autoRejectBelowPercentage: 50,
        }),
      },
      {
        key: "commerce",
        value: JSON.stringify({
          gstPercentage: 18,
          freeShippingThreshold: 5000,
          standardShippingFee: 250,
          enableCOD: true,
          codFee: 150,
          maxCODAmount: 10000,
        }),
      },
    ],
  });

  // 15. Product Questions
  await prisma.productQuestion.create({
    data: {
      productId: createdProducts[0].id,
      customerName: "Mohit Ranawat",
      customerEmail: "mohit.r@gmail.com",
      question: "Will this headlight fit the 2018 pre-facelift Creta or only the 2020+ shape?",
      answer: "Hi Mohit! This fits only the 2nd Generation Creta (2020 through 2023). For the 2018 pre-facelift model, please search for SKU 'PART-CRETA-GEN1'.",
      answeredBy: "GearTrade Technical Team",
      isPublic: true,
    },
  });

  // 16. Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: superAdmin.id,
      adminEmail: superAdmin.email,
      action: "DATABASE_INITIALIZED",
      entity: "SYSTEM",
      entityId: "SYSTEM_INIT",
      metadata: JSON.stringify({ itemsSeeded: createdProducts.length, categories: categories.length }),
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`   - Users: 4 (Super Admin: admin@geartrade.in / admin123, Customer: rajesh.kumar@gmail.com / customer123)`);
  console.log(`   - Vehicle Brands: ${brands.length}`);
  console.log(`   - Vehicle Models: ${models.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Used Parts / Products: ${createdProducts.length}`);
  console.log(`   - Offers / Negotiations: 2`);
  console.log(`   - Orders: 2`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
