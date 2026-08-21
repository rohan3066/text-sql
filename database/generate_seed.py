import random
import datetime

PASSWORD_HASH = "$2b$12$d79AhlR5jC89.0Yy0bYJku94rZgL/Qd99h6Hl7h8b7KqR40R6U.8O"

FIRST_NAMES = [
    "Rahul", "Priya", "Amit", "Ananya", "Vikram", "Sneha", "Abhishek", "Pooja", "Sandeep", "Neha",
    "Rohan", "Aditi", "Manish", "Kriti", "Rajesh", "Divya", "Sanjay", "Swati", "Karan", "Ritu",
    "Arjun", "Anjali", "Vijay", "Shalini", "Deepak", "Asha", "Sunil", "Meera", "Anil", "Geeta",
    "Gaurav", "Simran", "Vivek", "Tanvi", "Alok", "Richa", "Manoj", "Kiran", "Pranav", "Nisha",
    "Ravi", "Preeti", "Suresh", "Jyoti", "Dinesh", "Komal", "Harish", "Aakanksha", "Vinod", "Payal"
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Mehta", "Joshi", "Patel", "Shah", "Singh", "Kumar", "Mishra",
    "Trivedi", "Reddy", "Nair", "Pillai", "Rao", "Choudhury", "Das", "Sen", "Chatterjee", "Banerjee",
    "Mukherjee", "Bose", "Ghosh", "Dubey", "Yadav", "Pandey", "Dwivedi", "Saxena", "Srivastava", "Kapoor",
    "Khanna", "Malhotra", "Grover", "Gill", "Sodhi", "Dhillon", "Chawla", "Bhasin", "Kohli", "Narang"
]

CITIES_STATES = [
    ("Mumbai", "Maharashtra", "400001"),
    ("Delhi", "Delhi", "110001"),
    ("Bangalore", "Karnataka", "560001"),
    ("Hyderabad", "Telangana", "500001"),
    ("Ahmedabad", "Gujarat", "380001"),
    ("Chennai", "Tamil Nadu", "600001"),
    ("Kolkata", "West Bengal", "700001"),
    ("Pune", "Maharashtra", "411001"),
    ("Jaipur", "Rajasthan", "302001"),
    ("Lucknow", "Uttar Pradesh", "226001"),
    ("Chandigarh", "Punjab", "160001"),
    ("Bhopal", "Madhya Pradesh", "462001"),
    ("Patna", "Bihar", "800001"),
    ("Kochi", "Kerala", "682001"),
    ("Guwahati", "Assam", "781001")
]

STREETS = [
    "MG Road", "Link Road", "JCR Road", "Park Street", "Sector 17", "Ghatkopar West", "Koramangala 5th Block",
    "Indiranagar 100 Feet Road", "Salt Lake City", "Anna Salai", "Gachibowli", "Hinjewadi Phase 1", "Civil Lines",
    "Vaishali Nagar", "Hazratganj"
]

CATEGORIES = [
    ("Electronics", "Gadgets, audio, smart devices, and accessories"),
    ("Mobiles", "Smartphones, feature phones, and mobile accessories"),
    ("Laptops", "Laptops, notebooks, ultrabooks, and desktop computers"),
    ("Fashion", "Men, Women, and Kids apparel and clothing"),
    ("Shoes", "Sports shoes, formal shoes, sneakers, and sandals"),
    ("Home Appliances", "Refrigerators, washing machines, microwaves, and ACs"),
    ("Books", "Fiction, non-fiction, academic, and self-help books"),
    ("Beauty", "Skincare, cosmetics, hair care, and fragrances"),
    ("Sports", "Fitness equipment, indoor/outdoor sports gear"),
    ("Gaming", "Consoles, video games, gaming keyboards, and controllers"),
    ("Accessories", "Bags, wallets, belts, sunglasses, and watches"),
    ("Furniture", "Beds, sofas, dining tables, study tables, and chairs"),
    ("Grocery", "Daily essentials, snacks, beverages, and household items"),
    ("Fitness", "Dumbbells, yoga mats, resistance bands, and supplements"),
    ("Toys", "Board games, action figures, dolls, and educational toys")
]

PRODUCT_TEMPLATES = {
    "Electronics": [
        ("Noise-Cancelling Headphones", "Sony", 19999, 10.0),
        ("Bluetooth Smart Speaker", "Echo", 4499, 15.0),
        ("Wireless Earbuds", "boAt", 2499, 20.0),
        ("Smart Watch Series 9", "Apple", 41900, 5.0),
        ("Fitness Band Pro", "Fitbit", 9999, 12.0),
        ("Power Bank 20000mAh", "Mi", 1999, 10.0),
        ("HD Action Camera", "GoPro", 34999, 8.0),
        ("Wireless Mouse & Keyboard", "Logitech", 2999, 15.0),
    ],
    "Mobiles": [
        ("Galaxy S24 Ultra", "Samsung", 129999, 8.0),
        ("iPhone 15 Pro", "Apple", 134900, 5.0),
        ("OnePlus 12", "OnePlus", 64999, 7.0),
        ("Redmi Note 13 Pro", "Xiaomi", 24999, 10.0),
        ("Nord CE 4", "OnePlus", 24999, 5.0),
        ("Pixel 8 Pro", "Google", 99999, 12.0),
        ("Realme GT 5G", "Realme", 37999, 15.0),
        ("Moto Edge 50 Pro", "Motorola", 31999, 10.0),
    ],
    "Laptops": [
        ("MacBook Air M3", "Apple", 114900, 6.0),
        ("ZenBook 14 OLED", "ASUS", 89990, 10.0),
        ("IdeaPad Slim 3", "Lenovo", 42990, 15.0),
        ("Inspiron 15", "Dell", 54990, 8.0),
        ("HP Pavilion 14", "HP", 62990, 12.0),
        ("ROG Strix G16", "ASUS", 124990, 5.0),
        ("Predator Helios 16", "Acer", 149990, 8.0),
        ("TUF Gaming F15", "ASUS", 68990, 18.0),
    ],
    "Fashion": [
        ("Slim Fit Cotton Shirt", "Raymond", 1899, 15.0),
        ("Women Silk Saree", "Manyavar", 4999, 25.0),
        ("Denim Jeans Comfort Fit", "Levi's", 2999, 20.0),
        ("Printed Summer Dress", "Zara", 3499, 10.0),
        ("Casual Polo T-Shirt", "US Polo", 1499, 30.0),
        ("Leather Jacket Bomber", "Roadster", 4599, 40.0),
        ("Anarkali Kurta Set", "BIBA", 3999, 20.0),
        ("Cargo Pants Olive", "Wrogn", 2199, 15.0),
    ],
    "Shoes": [
        ("Air Max Sneakers", "Nike", 8999, 10.0),
        ("Running Shoes Quest 5", "Nike", 5499, 15.0),
        ("Classic Formal Derby", "Bata", 2499, 5.0),
        ("Ultraboost Light", "Adidas", 18999, 20.0),
        ("Gel-Kayano 30", "Asics", 15999, 8.0),
        ("Casual Canvas Shoes", "Puma", 1999, 25.0),
        ("Sports Sandals Pro", "Wildcraft", 1799, 10.0),
        ("Suede Chelsea Boots", "Woodland", 5995, 12.0),
    ],
    "Home Appliances": [
        ("Double Door Refrigerator", "LG", 28990, 12.0),
        ("Front Load Washing Machine", "Samsung", 34990, 15.0),
        ("Convection Microwave 28L", "IFB", 16490, 10.0),
        ("Split Air Conditioner 1.5T", "Daikin", 42990, 8.0),
        ("Water Purifier RO+UV", "Kent", 18500, 20.0),
        ("Robotic Vacuum Cleaner", "Ecovacs", 29900, 25.0),
        ("Induction Cooktop 2000W", "Prestige", 2890, 30.0),
        ("Air Fryer 4.2L", "Philips", 8999, 15.0),
    ],
    "Books": [
        ("Atomic Habits", "James Clear", 450, 10.0),
        ("The Psychology of Money", "Morgan Housel", 350, 15.0),
        ("Ikigai", "Francesc Miralles", 399, 20.0),
        ("Sapiens", "Yuval Noah Harari", 599, 25.0),
        ("Rich Dad Poor Dad", "Robert Kiyosaki", 499, 10.0),
        ("Shiva Trilogy Box Set", "Amish Tripathi", 1250, 30.0),
        ("Train to Pakistan", "Khushwant Singh", 299, 5.0),
        ("The Alchemist", "Paulo Coelho", 350, 12.0),
    ],
    "Beauty": [
        ("Matte Lipstick Red", "M.A.C", 1950, 5.0),
        ("Moisturizing Cream 100g", "Cetaphil", 450, 10.0),
        ("Sunscreen SPF 50", "La Shield", 790, 15.0),
        ("Vitamin C Face Serum", "Mamaearth", 599, 20.0),
        ("Coconut Hair Oil 400ml", "Parachute", 250, 5.0),
        ("Luxury Eau De Parfum", "Titan Skinn", 2495, 10.0),
        ("Anti-Dandruff Shampoo", "Head & Shoulders", 399, 15.0),
        ("Herbal Face Wash 150ml", "Himalaya", 199, 10.0),
    ],
    "Sports": [
        ("English Willow Cricket Bat", "SG", 8500, 15.0),
        ("Leather Cricket Ball Red", "Kookaburra", 1490, 10.0),
        ("Pro Badminton Racket", "Yonex", 3499, 20.0),
        ("Synthetic Football Size 5", "Nivia", 999, 25.0),
        ("Adjustable Dumbbells Set", "Lifelong", 6999, 30.0),
        ("Automatic Treadmill Pro", "Fitkit", 26999, 35.0),
        ("TPE Yoga Mat 6mm", "Boldfit", 1299, 40.0),
        ("Sports Gym Shaker Bottle", "Spider", 399, 10.0),
    ],
    "Gaming": [
        ("PlayStation 5 Console", "Sony", 54990, 5.0),
        ("Xbox Series X 1TB", "Microsoft", 55990, 5.0),
        ("Nintendo Switch OLED", "Nintendo", 31999, 10.0),
        ("Mechanical Gaming Keyboard", "Razer", 8999, 15.0),
        ("Wireless Gaming Mouse", "Logitech G", 4999, 20.0),
        ("Gaming Headset 7.1", "HyperX", 7499, 12.0),
        ("Cricket 24 PS5 Game", "Nacon", 3999, 10.0),
        ("E-sports Ergonomic Chair", "Green Soul", 16999, 25.0),
    ],
    "Accessories": [
        ("Leather Bi-Fold Wallet", "Wildhorn", 999, 45.0),
        ("Unisex Aviator Sunglasses", "Ray-Ban", 8490, 10.0),
        ("Chronograph Men's Watch", "Fossil", 12495, 20.0),
        ("Smart Hybrid Watch", "Titan", 9995, 15.0),
        ("Hard Cabin Suitcase 55cm", "Safari", 3499, 55.0),
        ("Casual Backpack 30L", "Skybags", 1799, 35.0),
        ("Pure Leather Belt Black", "Allen Solly", 1299, 20.0),
        ("Silver Pendant Necklace", "GIVA", 2499, 15.0),
    ],
    "Furniture": [
        ("Solid Wood King Bed", "Wakefit", 18999, 15.0),
        ("3-Seater Fabric Sofa", "Adorn India", 14999, 20.0),
        ("Glass 4-Seater Dining Table", "Home Centre", 16999, 25.0),
        ("Ergonomic Study Chair", "Featherlite", 7999, 10.0),
        ("Engineered Wood Wardrobe", "Godrej Interio", 21500, 12.0),
        ("Wooden TV Console Table", "Urban Ladder", 9999, 18.0),
        ("Metal Shoe Rack 4-Tier", "Dekor", 2499, 30.0),
        ("Foldable Laptop Table", "MultiTable", 999, 10.0),
    ],
    "Grocery": [
        ("Premium Basmati Rice 5kg", "Daawat", 850, 5.0),
        ("Cold Pressed Mustard Oil 1L", "Fortune", 220, 10.0),
        ("Refined Wheat Flour 5kg", "Aashirvaad", 299, 8.0),
        ("Assorted Tea Bags 100pc", "Taj Mahal", 420, 12.0),
        ("Instant Coffee Gold 100g", "Nescafe", 399, 5.0),
        ("Mixed Dry Fruits 500g", "Happilo", 699, 25.0),
        ("Chocochips Cookies Pack", "Dark Fantasy", 150, 15.0),
        ("Oats Rolled 1kg", "Bagrry's", 280, 10.0),
    ],
    "Fitness": [
        ("Whey Protein Powder 1kg", "MuscleBlaze", 3299, 15.0),
        ("Creatine Monohydrate 250g", "Optimum Nutrition", 999, 10.0),
        ("Multivitamin Men 60tabs", "HealthKart", 599, 20.0),
        ("Resistance Band Loop Set", "Decathlon", 799, 12.0),
        ("Neoprene Dumbbells 5kg x2", "Kobo", 1999, 18.0),
        ("Gym Chalk Ball 2oz", "Aura", 250, 5.0),
        ("Ankle Weights 2kg Pair", "ProActive", 899, 10.0),
        ("Peanut Butter Creamy 1kg", "Pintola", 450, 8.0),
    ],
    "Toys": [
        ("Monopoly Board Game", "Hasbro", 1299, 10.0),
        ("Building Blocks Set 100pc", "LEGO", 2499, 5.0),
        ("Remote Control SUV Car", "Toyzone", 1799, 20.0),
        ("Soft Plush Teddy Bear 3ft", "Hug 'n' Feel", 999, 35.0),
        ("Educational Spelling Game", "Skillmatics", 499, 15.0),
        ("Iron Man Action Figure", "Marvel", 1499, 10.0),
        ("Barbie Fashionista Doll", "Mattel", 899, 12.0),
        ("Wooden Puzzle Board", "Shumee", 650, 15.0),
    ]
}

def generate_seed():
    sql = []
    
    # 1. Categories
    sql.append("-- Seeding Categories")
    for i, (name, desc) in enumerate(CATEGORIES, 1):
        sql.append(f"INSERT INTO categories (id, name, description, status) VALUES ({i}, '{name}', '{desc}', 'Active');")
    
    # 2. Users (105 users)
    sql.append("\n-- Seeding Users")
    dob_start = datetime.date(1975, 1, 1)
    dob_end = datetime.date(2005, 12, 31)
    dob_span = (dob_end - dob_start).days
    
    emails_seen = set()
    for i in range(1, 106):
        while True:
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            email = f"{fn.lower()}.{ln.lower()}{random.randint(10, 99)}@gmail.com"
            if email not in emails_seen:
                emails_seen.add(email)
                break
        
        name = f"{fn} {ln}"
        phone = f"+91{random.randint(7000000000, 9999999999)}"
        gender = "Female" if fn.endswith("a") or fn in ["Ananya", "Sneha", "Pooja", "Neha", "Aditi", "Kriti", "Divya", "Swati", "Ritu", "Anjali", "Shalini", "Asha", "Meera", "Geeta", "Simran", "Tanvi", "Richa", "Kiran", "Preeti", "Jyoti", "Komal", "Aakanksha", "Payal"] else "Male"
        dob = dob_start + datetime.timedelta(days=random.randint(0, dob_span))
        status = "Active" if random.random() < 0.95 else "Inactive"
        
        sql.append(f"INSERT INTO users (id, name, email, password, phone, gender, date_of_birth, status) VALUES ({i}, '{name}', '{email}', '{PASSWORD_HASH}', '{phone}', '{gender}', '{dob.strftime('%Y-%m-%d')}', '{status}');")

    # 3. Addresses (120 addresses, some users have multiple)
    sql.append("\n-- Seeding Addresses")
    addr_id = 1
    for i in range(1, 106):
        city, state, pin = random.choice(CITIES_STATES)
        street = f"{random.randint(1, 400)}, {random.choice(STREETS)}"
        sql.append(f"INSERT INTO addresses (id, user_id, address_line, city, state, country, postal_code, address_type) VALUES ({addr_id}, {i}, '{street}', '{city}', '{state}', 'India', '{pin}', 'Home');")
        addr_id += 1
        
        if random.random() < 0.15 and addr_id <= 120:
            city, state, pin = random.choice(CITIES_STATES)
            street = f"Suite {random.randint(100, 999)}, Tech Park, {random.choice(STREETS)}"
            sql.append(f"INSERT INTO addresses (id, user_id, address_line, city, state, country, postal_code, address_type) VALUES ({addr_id}, {i}, '{street}', '{city}', '{state}', 'India', '{pin}', 'Office');")
            addr_id += 1

    # Keep a list of all products in memory to easily fetch price/discounts
    products_db = []
    prod_id = 1
    sql.append("\n-- Seeding Products, Inventory and Images")
    for cat_id, (cat_name, _) in enumerate(CATEGORIES, 1):
        templates = PRODUCT_TEMPLATES[cat_name]
        for name, brand, price, discount in templates:
            sku = f"{brand[:3].upper()}-{cat_name[:3].upper()}-{random.randint(1000, 9999)}-{prod_id}"
            desc = f"Premium quality {name} by {brand}. Built with durable materials, modern design, and advanced features."
            sql.append(f"INSERT INTO products (id, category_id, name, description, brand, sku, price, discount, status) VALUES ({prod_id}, {cat_id}, '{name}', '{desc}', '{brand}', '{sku}', {price:.2f}, {discount:.2f}, 'Active');")
            
            # Keep product details in memory
            products_db.append({
                "id": prod_id,
                "price": price,
                "discount": discount
            })
            
            # Inventory
            qty = random.randint(20, 200)
            res = random.randint(0, min(qty // 10, 5))
            sql.append(f"INSERT INTO inventory (product_id, quantity, reserved_quantity) VALUES ({prod_id}, {qty}, {res});")
            
            # Product Images
            img_url = f"https://images.unsplash.com/photo-{random.randint(1500000000000, 1600000000000)}?q=80&w=600"
            sql.append(f"INSERT INTO product_images (product_id, image_url, is_primary) VALUES ({prod_id}, '{img_url}', TRUE);")
            
            prod_id += 1

    total_products = prod_id - 1

    # 5. Coupons (22 coupons)
    sql.append("\n-- Seeding Coupons")
    coupons = [
        ("WELCOME100", "Fixed", 100.00, 500.00, 100.00, "2025-01-01", "2026-12-31"),
        ("FESTIVE20", "Percentage", 20.00, 1500.00, 500.00, "2025-09-01", "2025-11-15"),
        ("FESTIVE26", "Percentage", 20.00, 1500.00, 500.00, "2026-09-01", "2026-11-15"),
        ("BIGMEGA", "Percentage", 30.00, 3000.00, 1500.00, "2025-05-01", "2025-05-10"),
        ("FREESHIP", "Fixed", 50.00, 200.00, 50.00, "2025-01-01", "2026-12-31"),
        ("SUPERDEAL", "Fixed", 500.00, 4999.00, 500.00, "2025-06-01", "2026-06-01"),
        ("LAPTOP5", "Percentage", 5.00, 30000.00, 3000.00, "2025-01-01", "2026-12-31"),
        ("FASHION50", "Percentage", 50.00, 1000.00, 500.00, "2025-03-01", "2025-03-31"),
        ("GROCERY10", "Percentage", 10.00, 1000.00, 150.00, "2025-01-01", "2026-12-31"),
        ("FITLIFE", "Fixed", 250.00, 1999.00, 250.00, "2025-01-01", "2026-12-31")
    ]
    for c_id, (code, dtype, dval, min_ord, max_disc, vf, vu) in enumerate(coupons, 1):
        sql.append(f"INSERT INTO coupons (id, code, discount_type, discount_value, minimum_order_amount, maximum_discount, valid_from, valid_until, status) VALUES ({c_id}, '{code}', '{dtype}', {dval:.2f}, {min_ord:.2f}, {max_disc:.2f}, '{vf} 00:00:00', '{vu} 23:59:59', 'Active');")
    
    for i in range(11, 23):
        code = f"DISCOUNT{i*5}"
        dtype = "Percentage"
        dval = float((i - 10) * 5)
        min_ord = float(100 * i)
        max_disc = float(50 * i)
        vf = "2025-01-01"
        vu = "2026-12-31"
        sql.append(f"INSERT INTO coupons (id, code, discount_type, discount_value, minimum_order_amount, maximum_discount, valid_from, valid_until, status) VALUES ({i}, '{code}', '{dtype}', {dval:.2f}, {min_ord:.2f}, {max_disc:.2f}, '{vf} 00:00:00', '{vu} 23:59:59', 'Active');")

    # 6. Orders & Order Items & Payments (520 orders)
    sql.append("\n-- Seeding Orders, Order Items, and Payments")
    
    order_statuses = ["Delivered", "Delivered", "Delivered", "Delivered", "Shipped", "Confirmed", "Pending", "Cancelled", "Returned"]
    order_status_weights = [0.70, 0.05, 0.05, 0.05, 0.05, 0.03, 0.03, 0.02, 0.02]
    
    payment_methods = ["Credit Card", "Debit Card", "UPI", "Net Banking", "Cash on Delivery", "Wallet"]
    payment_weights = [0.30, 0.15, 0.40, 0.05, 0.05, 0.05]
    
    start_date = datetime.datetime(2025, 1, 1, 0, 0, 0)
    end_date = datetime.datetime(2026, 7, 31, 23, 59, 59)
    delta_seconds = int((end_date - start_date).total_seconds())
    
    timestamps = [start_date + datetime.timedelta(seconds=random.randint(0, delta_seconds)) for _ in range(520)]
    timestamps.sort()
    
    item_id = 1
    payment_id = 1
    
    for order_id, order_time in enumerate(timestamps, 1):
        user_id = random.randint(1, 105)
        address_id = random.randint(1, addr_id - 1)
        status = random.choices(order_statuses, weights=order_status_weights)[0]
        
        # 1 to 4 items in each order
        num_items = random.randint(1, 4)
        seen_prods = set()
        
        total_amount = 0.0
        order_items_sql = []
        
        for _ in range(num_items):
            while True:
                p = random.choice(products_db)
                if p["id"] not in seen_prods:
                    seen_prods.add(p["id"])
                    break
            
            qty = random.randint(1, 3)
            price = p["price"]
            disc_pct = p["discount"]
            # Apply product discount to order item price
            effective_price = price * (1 - (disc_pct / 100))
            subtotal = effective_price * qty
            
            total_amount += subtotal
            order_items_sql.append(
                f"INSERT INTO order_items (id, order_id, product_id, quantity, price, subtotal) VALUES ({item_id}, {order_id}, {p['id']}, {qty}, {effective_price:.2f}, {subtotal:.2f});"
            )
            item_id += 1
            
        # Maybe apply a coupon discount (15% chance)
        discount_amount = 0.0
        if random.random() < 0.15:
            # Let's say flat 10% discount or similar
            discount_amount = round(total_amount * 0.10, 2)
            
        shipping_amount = 0.0 if total_amount > 1000 else 50.0
        final_amount = total_amount - discount_amount + shipping_amount
        if final_amount < 0:
            final_amount = 0.0
            
        sql.append(f"INSERT INTO orders (id, user_id, address_id, total_amount, discount_amount, shipping_amount, final_amount, status, order_date) VALUES ({order_id}, {user_id}, {address_id}, {total_amount:.2f}, {discount_amount:.2f}, {shipping_amount:.2f}, {final_amount:.2f}, '{status}', '{order_time.strftime('%Y-%m-%d %H:%M:%S')}');")
        
        # Add order items to sql stream
        sql.extend(order_items_sql)
        
        # Payment (matching status: Delivered/Shipped/Confirmed -> Success, Pending -> Pending, Cancelled/Returned -> Success or Failed)
        pay_method = random.choices(payment_methods, weights=payment_weights)[0]
        pay_status = "Success"
        if status == "Pending":
            pay_status = "Pending"
        elif status == "Cancelled" and random.random() < 0.5:
            pay_status = "Failed"
            
        tx_id = f"TXN{random.randint(100000000, 999999999)}" if pay_method != "Cash on Delivery" else "COD-PAY"
        
        sql.append(f"INSERT INTO payments (id, order_id, payment_method, transaction_id, amount, status, payment_date) VALUES ({payment_id}, {order_id}, '{pay_method}', '{tx_id}', {final_amount:.2f}, '{pay_status}', '{order_time.strftime('%Y-%m-%d %H:%M:%S')}');")
        payment_id += 1

    # 7. Reviews (320 reviews)
    sql.append("\n-- Seeding Reviews")
    review_id = 1
    reviews_seen = set()
    review_comments = {
        5: ["Excellent product! Highly recommended.", "Perfect fit, great quality.", "Superb performance, value for money.", "Absolutely loved it!", "Best purchase of the year."],
        4: ["Good quality and fast delivery.", "Really nice product, works as advertised.", "Very satisfied with the purchase.", "Value for money product.", "Good build quality."],
        3: ["Decent product, average quality.", "Okay for the price, but could be better.", "Satisfactory performance.", "Average delivery speed.", "Product is fine, not exceptional."],
        2: ["Disappointed with the quality.", "Not as expected, average performance.", "Product has some defects.", "Below average quality.", "Delivery was very late."],
        1: ["Terrible product! Do not buy.", "Poor quality, waste of money.", "Completely broke on first use.", "Horrible experience.", "Defective product received."]
    }
    
    for _ in range(320):
        while True:
            u_id = random.randint(1, 105)
            p_id = random.randint(1, total_products)
            key = (u_id, p_id)
            if key not in reviews_seen:
                reviews_seen.add(key)
                break
                
        rating = random.choices([5, 4, 3, 2, 1], weights=[0.50, 0.30, 0.10, 0.06, 0.04])[0]
        comment = random.choice(review_comments[rating])
        created_time = start_date + datetime.timedelta(seconds=random.randint(0, delta_seconds))
        
        sql.append(f"INSERT INTO reviews (id, user_id, product_id, rating, comment, created_at) VALUES ({review_id}, {u_id}, {p_id}, {rating}, '{comment}', '{created_time.strftime('%Y-%m-%d %H:%M:%S')}');")
        review_id += 1

    # Write seed file
    with open("seed.sql", "w", encoding="utf-8") as f:
        f.write("USE ecommerce_db;\n\n")
        f.write("\n".join(sql))
        f.write("\n")
        
    print(f"Generated seed.sql successfully with {len(sql)} operations.")

if __name__ == "__main__":
    generate_seed()
