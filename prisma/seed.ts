import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ─────────────────────────────────────────────
  // 1. ROLES
  // ─────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { role: "CUSTOMER" },          update: {}, create: { role: "CUSTOMER" } }),
    prisma.role.upsert({ where: { role: "RESTAURANT_OWNER" },  update: {}, create: { role: "RESTAURANT_OWNER" } }),
    prisma.role.upsert({ where: { role: "RESTAURANT_STAFF" },  update: {}, create: { role: "RESTAURANT_STAFF" } }),
    prisma.role.upsert({ where: { role: "DELIVERY_PARTNER" },  update: {}, create: { role: "DELIVERY_PARTNER" } }),
    prisma.role.upsert({ where: { role: "ADMIN" },             update: {}, create: { role: "ADMIN" } }),
  ]);
  console.log("✅ Roles seeded");

  const [roleCustomer, roleOwner, roleStaff, roleDriver, roleAdmin] = roles;

  // ─────────────────────────────────────────────
  // 2. USERS
  // ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@ofos.com" },
      update: {},
      create: { fullName: "Super Admin", email: "admin@ofos.com", mobile: "9000000001", passwordHash, isVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "owner@pizzahut.com" },
      update: {},
      create: { fullName: "Raj Patel", email: "owner@pizzahut.com", mobile: "9000000002", passwordHash, isVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "staff@pizzahut.com" },
      update: {},
      create: { fullName: "Meera Shah", email: "staff@pizzahut.com", mobile: "9000000003", passwordHash, isVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "driver1@ofos.com" },
      update: {},
      create: { fullName: "Arjun Verma", email: "driver1@ofos.com", mobile: "9000000004", passwordHash, isVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "customer1@ofos.com" },
      update: {},
      create: { fullName: "Priya Nair", email: "customer1@ofos.com", mobile: "9000000005", passwordHash, isVerified: true },
    }),
  ]);
  console.log("✅ Users seeded");

  const [uAdmin, uOwner, uStaff, uDriver, uCustomer] = users;

  // ─────────────────────────────────────────────
  // 3. USER ROLES
  // ─────────────────────────────────────────────
  await Promise.all([
    prisma.userRole.upsert({ where: { userId_roleId: { userId: uAdmin.id,    roleId: roleAdmin.id   } }, update: {}, create: { userId: uAdmin.id,    roleId: roleAdmin.id    } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: uOwner.id,    roleId: roleOwner.id   } }, update: {}, create: { userId: uOwner.id,    roleId: roleOwner.id    } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: uStaff.id,    roleId: roleStaff.id   } }, update: {}, create: { userId: uStaff.id,    roleId: roleStaff.id    } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: uDriver.id,   roleId: roleDriver.id  } }, update: {}, create: { userId: uDriver.id,   roleId: roleDriver.id   } }),
    prisma.userRole.upsert({ where: { userId_roleId: { userId: uCustomer.id, roleId: roleCustomer.id} }, update: {}, create: { userId: uCustomer.id, roleId: roleCustomer.id } }),
  ]);
  console.log("✅ UserRoles seeded");

  // ─────────────────────────────────────────────
  // 4. USER ADDRESSES
  // ─────────────────────────────────────────────
  const addresses = await Promise.all([
    prisma.userAddress.create({ data: { userId: uCustomer.id, label: "Home",   addressLine1: "42 Paldi Society", city: "Ahmedabad", state: "Gujarat", pincode: "380007", latitude: 23.0225, longitude: 72.5714, isDefault: true  } }),
    prisma.userAddress.create({ data: { userId: uCustomer.id, label: "Work",   addressLine1: "SG Highway, Prahlad Nagar", city: "Ahmedabad", state: "Gujarat", pincode: "380015", latitude: 23.0395, longitude: 72.5069 } }),
    prisma.userAddress.create({ data: { userId: uOwner.id,   label: "Office", addressLine1: "CG Road, Navrangpura",       city: "Ahmedabad", state: "Gujarat", pincode: "380009", latitude: 23.0348, longitude: 72.5633 } }),
    prisma.userAddress.create({ data: { userId: uAdmin.id,   label: "HQ",     addressLine1: "GIFT City, Gandhinagar",     city: "Gandhinagar", state: "Gujarat", pincode: "382355", latitude: 23.1613, longitude: 72.6800 } }),
  ]);
  console.log("✅ UserAddresses seeded");

  const [addr1] = addresses;

  // ─────────────────────────────────────────────
  // 5. RESTAURANT
  // ─────────────────────────────────────────────
  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: uOwner.id,
      name: "Pizza Hut Express",
      description: "Authentic Italian-style pizzas made fresh daily.",
      isActive: true,
    },
  });
  console.log("✅ Restaurant seeded");

  // ─────────────────────────────────────────────
  // 6. RESTAURANT BRANCH (without headId first)
  // ─────────────────────────────────────────────
  const branch = await prisma.restaurantBranch.create({
    data: {
      restaurantId:       restaurant.id,
      branchName:         "Navrangpura Branch",
      addressLine1:       "Shop 5, Swastik Cross Roads",
      city:               "Ahmedabad",
      state:              "Gujarat",
      pincode:            "380009",
      contactNumber:      "07926443210",
      gstin:              "24ABCDE1234F1Z5",
      fssaiLicense:       "21424000000123",
      verificationStatus: "APPROVED",
      latitude:           23.0348,
      longitude:          72.5633,
      deliveryRadiusKm:   5.00,
      isPrimary:          true,
      isActive:           true,
    },
  });
  console.log("✅ RestaurantBranch seeded");

  // ─────────────────────────────────────────────
  // 7. RESTAURANT STAFF + assign as branch head
  // ─────────────────────────────────────────────
  const staffRecord = await prisma.restaurantStaff.create({
    data: { userId: uStaff.id, branchId: branch.id },
  });

  await prisma.restaurantBranch.update({
    where: { id: branch.id },
    data:  { headId: staffRecord.id },
  });
  console.log("✅ RestaurantStaff seeded");

  // ─────────────────────────────────────────────
  // 8. OPERATING HOURS
  // ─────────────────────────────────────────────
  const days = ["MON","TUE","WED","THU","FRI","SAT","SUN"] as const;
  await prisma.operatingHour.createMany({
    data: days.map((d) => ({
      branchId:  branch.id,
      dayOfWeek: d,
      openTime:  new Date("1970-01-01T10:00:00Z"),
      closeTime: new Date("1970-01-01T23:00:00Z"),
      isClosed:  d === "SUN",
    })),
  });
  console.log("✅ OperatingHours seeded");

  // ─────────────────────────────────────────────
  // 9. CATEGORIES
  // ─────────────────────────────────────────────
  const [catPizzas, catSides, catBeverages, catDesserts] = await Promise.all([
    prisma.category.create({ data: { branchId: branch.id, name: "Pizzas",     displayOrder: 1 } }),
    prisma.category.create({ data: { branchId: branch.id, name: "Sides",      displayOrder: 2 } }),
    prisma.category.create({ data: { branchId: branch.id, name: "Beverages",  displayOrder: 3 } }),
    prisma.category.create({ data: { branchId: branch.id, name: "Desserts",   displayOrder: 4 } }),
  ]);
  console.log("✅ Categories seeded");

  // ─────────────────────────────────────────────
  // 10. DIETARY TAGS
  // ─────────────────────────────────────────────
  const [tagVeg, tagVegan, tagGlutenFree, tagJain] = await Promise.all([
    prisma.dietaryTag.create({ data: { name: "Veg" } }),
    prisma.dietaryTag.create({ data: { name: "Vegan" } }),
    prisma.dietaryTag.create({ data: { name: "Gluten-Free" } }),
    prisma.dietaryTag.create({ data: { name: "Jain" } }),
  ]);
  console.log("✅ DietaryTags seeded");

  // ─────────────────────────────────────────────
  // 11. MENU ITEMS
  // ─────────────────────────────────────────────
  const [itemMargherita, itemChickenBBQ, itemGarlic, itemCola, itemChocoCake] =
    await Promise.all([
      prisma.menuItem.create({ data: { branchId: branch.id, categoryId: catPizzas.id,    name: "Margherita Pizza",      price: 249.00, isVeg: true,  isBestseller: true  } }),
      prisma.menuItem.create({ data: { branchId: branch.id, categoryId: catPizzas.id,    name: "Chicken BBQ Pizza",     price: 399.00, isVeg: false, isBestseller: true  } }),
      prisma.menuItem.create({ data: { branchId: branch.id, categoryId: catSides.id,     name: "Garlic Bread",          price: 99.00,  isVeg: true,  isBestseller: false } }),
      prisma.menuItem.create({ data: { branchId: branch.id, categoryId: catBeverages.id, name: "Pepsi 500ml",           price: 60.00,  isVeg: true,  isBestseller: false } }),
      prisma.menuItem.create({ data: { branchId: branch.id, categoryId: catDesserts.id,  name: "Chocolate Lava Cake",   price: 149.00, isVeg: true,  isBestseller: false } }),
    ]);
  console.log("✅ MenuItems seeded");

  // ─────────────────────────────────────────────
  // 12. MENU ITEM TAGS
  // ─────────────────────────────────────────────
  await Promise.all([
    prisma.menuItemTag.create({ data: { menuItemId: itemMargherita.id, tagId: tagVeg.id       } }),
    prisma.menuItemTag.create({ data: { menuItemId: itemMargherita.id, tagId: tagJain.id      } }),
    prisma.menuItemTag.create({ data: { menuItemId: itemGarlic.id,     tagId: tagVeg.id       } }),
    prisma.menuItemTag.create({ data: { menuItemId: itemCola.id,       tagId: tagVegan.id     } }),
    prisma.menuItemTag.create({ data: { menuItemId: itemChocoCake.id,  tagId: tagVeg.id       } }),
  ]);
  console.log("✅ MenuItemTags seeded");

  // ─────────────────────────────────────────────
  // 13. MODIFIER GROUPS + OPTIONS
  // ─────────────────────────────────────────────
  const modGroupSize = await prisma.modifierGroup.create({
    data: {
      menuItemId:   itemMargherita.id,
      name:         "Choose Size",
      minSelection: 1,
      maxSelection: 1,
      isRequired:   true,
      options: {
        create: [
          { name: "Regular (7\")",  extraPrice: 0.00   },
          { name: "Medium (10\")",  extraPrice: 50.00  },
          { name: "Large (14\")",   extraPrice: 100.00 },
        ],
      },
    },
  });

  await prisma.modifierGroup.create({
    data: {
      menuItemId:   itemMargherita.id,
      name:         "Extra Toppings",
      minSelection: 0,
      maxSelection: 3,
      isRequired:   false,
      options: {
        create: [
          { name: "Extra Cheese",   extraPrice: 40.00 },
          { name: "Jalapeños",      extraPrice: 20.00 },
          { name: "Olives",         extraPrice: 20.00 },
          { name: "Mushrooms",      extraPrice: 30.00 },
        ],
      },
    },
  });
  console.log("✅ ModifierGroups + Options seeded");

  // ─────────────────────────────────────────────
  // 14. COUPONS
  // ─────────────────────────────────────────────
  const [couponFlat, couponPct, couponFree] = await Promise.all([
    prisma.coupon.create({ data: { code: "WELCOME50", type: "FLAT",         discountValue: 50,  minOrderAmount: 200, usageLimit: 1000, startDate: new Date("2025-01-01"), endDate: new Date("2026-12-31") } }),
    prisma.coupon.create({ data: { code: "SAVE20",    type: "PERCENTAGE",   discountValue: 20,  maxDiscount: 150,    usageLimit: 500,  startDate: new Date("2025-01-01"), endDate: new Date("2026-12-31") } }),
    prisma.coupon.create({ data: { code: "FREEDEL",   type: "FREE_DELIVERY",discountValue: 0,   minOrderAmount: 299, usageLimit: 200,  startDate: new Date("2025-06-01"), endDate: new Date("2025-12-31") } }),
    prisma.coupon.create({ data: { code: "BOGO2024",  type: "BOGO",         discountValue: 100, minOrderAmount: 499,                  startDate: new Date("2025-01-01"), endDate: new Date("2025-12-31") } }),
  ]);
  console.log("✅ Coupons seeded");

  // ─────────────────────────────────────────────
  // 15. RESTAURANT PROMOTIONS
  // ─────────────────────────────────────────────
  await prisma.restaurantPromotion.createMany({
    data: [
      { restaurantId: restaurant.id, title: "Weekend Special 15% Off", type: "PERCENTAGE",    discountValue: 15, startDate: new Date("2025-06-01"), endDate: new Date("2025-06-30") },
      { restaurantId: restaurant.id, title: "Free Delivery Tuesday",   type: "FREE_DELIVERY", discountValue: 0,  startDate: new Date("2025-06-01"), endDate: new Date("2025-12-31") },
      { restaurantId: restaurant.id, title: "Happy Hour ₹30 Off",      type: "FIXED",         discountValue: 30, startDate: new Date("2025-06-01"), endDate: new Date("2025-09-30") },
    ],
  });
  console.log("✅ RestaurantPromotions seeded");

  // ─────────────────────────────────────────────
  // 16. DELIVERY PARTNER
  // ─────────────────────────────────────────────
  const deliveryPartner = await prisma.deliveryPartner.create({
    data: {
      userId:        uDriver.id,
      vehicleType:   "BIKE",
      vehicleNumber: "GJ01AB1234",
      governmentId:  "AADHAAR-123456789012",
      status:        "ACTIVE",
    },
  });
  console.log("✅ DeliveryPartner seeded");

  // ─────────────────────────────────────────────
  // 17. LOYALTY ACCOUNT
  // ─────────────────────────────────────────────
  const loyaltyAccount = await prisma.loyaltyAccount.create({
    data: { customerId: uCustomer.id, currentPoints: 120 },
  });
  console.log("✅ LoyaltyAccount seeded");

  // ─────────────────────────────────────────────
  // 18. ORDER
  // ─────────────────────────────────────────────
  const order = await prisma.order.create({
    data: {
      orderNumber:   "ORD-2025-0001",
      customerId:    uCustomer.id,
      branchId:      branch.id,
      addressId:     addr1.id,
      couponId:      couponFlat.id,
      subtotal:      348.00,
      taxAmount:     34.80,
      deliveryFee:   30.00,
      discountAmount:50.00,
      totalAmount:   362.80,
      status:        "DELIVERED",
      paymentStatus: "PAID",
      placedAt:      new Date("2025-06-01T12:30:00Z"),
      deliveredAt:   new Date("2025-06-01T13:10:00Z"),
    },
  });
  console.log("✅ Order seeded");

  // ─────────────────────────────────────────────
  // 19. ORDER ITEMS + MODIFIERS
  // ─────────────────────────────────────────────
  const orderItem1 = await prisma.orderItem.create({
    data: {
      orderId:       order.id,
      menuItemId:    itemMargherita.id,
      menuItemName:  "Margherita Pizza",
      price:         249.00,
      quantity:      1,
      specialInstruction: "Extra crispy base please",
      modifiers: {
        create: [
          { modifierName: "Large (14\")", extraPrice: 100.00 },
          { modifierName: "Extra Cheese", extraPrice: 40.00  },
        ],
      },
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId:      order.id,
      menuItemId:   itemCola.id,
      menuItemName: "Pepsi 500ml",
      price:        60.00,
      quantity:     1,
    },
  });
  console.log("✅ OrderItems + Modifiers seeded");

  // ─────────────────────────────────────────────
  // 20. ORDER STATUS HISTORY
  // ─────────────────────────────────────────────
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: order.id, oldStatus: null,          newStatus: "PLACED",          changedBy: uCustomer.id, changedAt: new Date("2025-06-01T12:30:00Z") },
      { orderId: order.id, oldStatus: "PLACED",      newStatus: "CONFIRMED",       changedBy: uStaff.id,    changedAt: new Date("2025-06-01T12:35:00Z") },
      { orderId: order.id, oldStatus: "CONFIRMED",   newStatus: "PREPARING",       changedBy: uStaff.id,    changedAt: new Date("2025-06-01T12:40:00Z") },
      { orderId: order.id, oldStatus: "PREPARING",   newStatus: "READY_FOR_PICKUP",changedBy: uStaff.id,    changedAt: new Date("2025-06-01T13:00:00Z") },
      { orderId: order.id, oldStatus: "READY_FOR_PICKUP", newStatus: "DELIVERED",  changedBy: uDriver.id,   changedAt: new Date("2025-06-01T13:10:00Z") },
    ],
    []
  });
  console.log("✅ OrderStatusHistory seeded");

  // ─────────────────────────────────────────────
  // 21. COUPON USAGE
  // ─────────────────────────────────────────────
  await prisma.couponUsage.create({
    data: { couponId: couponFlat.id, customerId: uCustomer.id, orderId: order.id, usedAt: new Date("2025-06-01T12:30:00Z") },
  });
  console.log("✅ CouponUsage seeded");

  // ─────────────────────────────────────────────
  // 22. PAYMENT
  // ─────────────────────────────────────────────
  const payment = await prisma.payment.create({
    data: {
      orderId:             order.id,
      paymentMethod:       "UPI",
      gateway:             "Razorpay",
      gatewayTransactionId:"rzp_test_ABCDEF123456",
      amount:              362.80,
      status:              "SUCCESS",
      paidAt:              new Date("2025-06-01T12:31:00Z"),
    },
  });
  console.log("✅ Payment seeded");

  // ─────────────────────────────────────────────
  // 23. SAVED PAYMENT METHODS
  // ─────────────────────────────────────────────
  await prisma.savedPaymentMethod.createMany({
    data: [
      { customerId: uCustomer.id, methodType: "UPI",    provider: "Google Pay",  token: "gp_tok_abc123",  displayName: "Google Pay UPI",    isDefault: true  },
      { customerId: uCustomer.id, methodType: "CARD",   provider: "Razorpay",    token: "rp_card_xyz789", displayName: "HDFC Visa ****4567", isDefault: false },
      { customerId: uCustomer.id, methodType: "WALLET", provider: "Paytm",       token: "ptm_wal_def456", displayName: "Paytm Wallet",       isDefault: false },
    ],
  });
  console.log("✅ SavedPaymentMethods seeded");

  // ─────────────────────────────────────────────
  // 24. DELIVERY + ASSIGNMENT
  // ─────────────────────────────────────────────
  const delivery = await prisma.delivery.create({
    data: {
      orderId:          order.id,
      currentPartnerId: deliveryPartner.id,
      status:           "DELIVERED",
      acceptedAt:       new Date("2025-06-01T13:01:00Z"),
      pickedUpAt:       new Date("2025-06-01T13:05:00Z"),
      deliveredAt:      new Date("2025-06-01T13:10:00Z"),
    },
  });

  await prisma.deliveryAssignment.create({
    data: {
      deliveryId:     delivery.id,
      partnerId:      deliveryPartner.id,
      assignedAt:     new Date("2025-06-01T13:00:00Z"),
      respondedAt:    new Date("2025-06-01T13:01:00Z"),
      responseStatus: "ACCEPTED",
    },
  });
  console.log("✅ Delivery + DeliveryAssignment seeded");

  // ─────────────────────────────────────────────
  // 25. REVIEW + IMAGES
  // ─────────────────────────────────────────────
  const review = await prisma.review.create({
    data: {
      orderId:          order.id,
      userId:           uCustomer.id,
      branchId:         branch.id,
      deliveryPartnerId:deliveryPartner.id,
      foodRating:       5,
      deliveryRating:   4,
      packagingRating:  5,
      reviewText:       "Absolutely loved the pizza! Crispy base, fresh toppings. Delivery was quick.",
    },
  });

  await prisma.reviewImage.createMany({
    data: [
      { reviewId: review.id, imageUrl: "https://cdn.ofos.com/reviews/img001.jpg" },
      { reviewId: review.id, imageUrl: "https://cdn.ofos.com/reviews/img002.jpg" },
    ],
  });
  console.log("✅ Review + ReviewImages seeded");

  // ─────────────────────────────────────────────
  // 26. LOYALTY TRANSACTIONS
  // ─────────────────────────────────────────────
  await prisma.loyaltyTransaction.createMany({
    data: [
      { accountId: loyaltyAccount.id, points: 50,  transactionType: "EARN",   referenceOrderId: order.id, createdAt: new Date("2025-06-01T13:15:00Z") },
      { accountId: loyaltyAccount.id, points: 30,  transactionType: "EARN",   createdAt: new Date("2025-05-15T10:00:00Z") },
      { accountId: loyaltyAccount.id, points: -20, transactionType: "REDEEM", createdAt: new Date("2025-05-20T11:00:00Z") },
    ],
  });
  console.log("✅ LoyaltyTransactions seeded");

  // ─────────────────────────────────────────────
  // 27. REFUND
  // ─────────────────────────────────────────────
  await prisma.refund.create({
    data: {
      paymentId:   payment.id,
      userId:      uCustomer.id,
      amount:      50.00,
      reason:      "Coupon discount applied incorrectly",
      refundType:  "PARTIAL",
      status:      "COMPLETED",
      requestedAt: new Date("2025-06-02T09:00:00Z"),
      processedAt: new Date("2025-06-02T11:00:00Z"),
    },
  });
  console.log("✅ Refund seeded");

  // ─────────────────────────────────────────────
  // 28. SUPPORT TICKETS + ATTACHMENTS
  // ─────────────────────────────────────────────
  const ticket = await prisma.supportTicket.create({
    data: {
      orderId:       order.id,
      customerId:    uCustomer.id,
      assignedAdmin: uAdmin.id,
      issueType:     "PAYMENT",
      description:   "Coupon discount was not applied on my order ORD-2025-0001.",
      status:        "RESOLVED",
      resolvedAt:    new Date("2025-06-02T12:00:00Z"),
    },
  });

  await prisma.ticketAttachment.createMany({
    data: [
      { ticketId: ticket.id, fileUrl: "https://cdn.ofos.com/tickets/screenshot1.png" },
      { ticketId: ticket.id, fileUrl: "https://cdn.ofos.com/tickets/screenshot2.png" },
    ],
  });
  console.log("✅ SupportTicket + Attachments seeded");

  // ─────────────────────────────────────────────
  // 29. NOTIFICATIONS
  // ─────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: uCustomer.id, title: "Order Placed!",       message: "Your order ORD-2025-0001 has been placed successfully.", notificationType: "ORDER_UPDATE", status: "SENT", sentAt: new Date("2025-06-01T12:30:00Z"), readAt: new Date("2025-06-01T12:31:00Z") },
      { userId: uCustomer.id, title: "Order Confirmed",      message: "Pizza Hut Express has confirmed your order.",            notificationType: "ORDER_UPDATE", status: "SENT", sentAt: new Date("2025-06-01T12:35:00Z"), readAt: new Date("2025-06-01T12:36:00Z") },
      { userId: uCustomer.id, title: "Order Delivered!",     message: "Your order has been delivered. Enjoy your meal! 🍕",    notificationType: "ORDER_UPDATE", status: "SENT", sentAt: new Date("2025-06-01T13:10:00Z") },
      { userId: uCustomer.id, title: "Earn 50 Loyalty Pts!", message: "You earned 50 points on your last order.",               notificationType: "INFO",         status: "SENT", sentAt: new Date("2025-06-01T13:15:00Z") },
      { userId: uDriver.id,   title: "New Delivery Request", message: "New order assigned near CG Road. Accept now.",           notificationType: "ALERT",        status: "SENT", sentAt: new Date("2025-06-01T13:00:00Z"), readAt: new Date("2025-06-01T13:01:00Z") },
    ],
  });
  console.log("✅ Notifications seeded");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });