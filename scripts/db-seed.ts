import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seedDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'tiffinghar';

  const brandName = process.env.BRAND_NAME || 'TiffinGhar';
  const adminEmail = process.env.ADMIN_EMAIL || 'nisant746181@mail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'nishant123';
  const premiumPrice = parseInt(process.env.PREMIUM_PRICE || '49', 10);
  const freeImageLimit = parseInt(process.env.FREE_IMAGE_LIMIT || '3', 10);
  const subscriptionDays = parseInt(process.env.SUBSCRIPTION_DURATION_DAYS || '30', 10);

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    console.log(`🌱 Seeding database \`${database}\` for ${brandName}...`);

    // 1. Seed Site Settings
    console.log('  -> Seeding site_settings...');
    const siteSettings = [
      {
        key: 'site_info',
        value: {
          brandName,
          tagline: 'Ghar jaisa Khana ♡',
          heroHeadline: 'Good Food Everyday',
          heroHighlightWord: 'Everyday',
          heroSubtext: `${brandName} connects you with authentic, homemade meals lovingly prepared by trusted home chefs and neighborhood kitchens.`,
          ctaPrimaryText: 'Find Tiffin Partner',
          ctaSecondaryText: 'Become a Partner',
        },
        description: 'General site branding and hero content',
      },
      {
        key: 'pricing',
        value: {
          premiumPrice,
          freeImageLimit,
          subscriptionDurationDays: subscriptionDays,
          features: [
            'Unlimited dish & kitchen gallery photos',
            'Exclusive "Recommended" badge on card',
            'Priority top placement across search & categories',
            'Direct WhatsApp & Call lead generation',
            'Analytics & view tracking dashboard',
          ],
        },
        description: 'Partner premium subscription plan details',
      },
      {
        key: 'contact_info',
        value: {
          phone: process.env.SUPPORT_PHONE || '+91 98765 43210',
          whatsapp: process.env.SUPPORT_WHATSAPP || '+91 98765 43210',
          email: process.env.SUPPORT_EMAIL || 'support@tiffinghar.local',
          address: '4th Floor, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
          hours: 'Monday to Sunday, 7:00 AM - 10:00 PM IST',
        },
        description: 'Official contact and support channels',
      },
      {
        key: 'features',
        value: [
          {
            title: 'Freshly Cooked',
            subtitle: 'Everyday',
            description: 'Prepared fresh every single morning and evening with clean ingredients and pure love.',
            icon: 'leaf',
          },
          {
            title: 'Trusted Kitchens',
            subtitle: 'Home chefs & families',
            description: 'FSSAI compliant, verified home cooks who take immense pride in their recipes.',
            icon: 'chef',
          },
          {
            title: 'On-Time Delivery',
            subtitle: 'Hot & fresh',
            description: 'Delivered straight to your doorstep or office cubicle right before lunch or dinner time.',
            icon: 'truck',
          },
        ],
        description: 'Core value propositions shown in hero and features section',
      },
    ];

    for (const setting of siteSettings) {
      await connection.query(
        `INSERT INTO site_settings (setting_key, setting_value, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = VALUES(description)`,
        [setting.key, JSON.stringify(setting.value), setting.description]
      );
    }

    // 2. Seed FAQs
    console.log('  -> Seeding FAQs...');
    const faqs = [
      {
        category: 'Ordering & Delivery',
        question: `How do I order from a Tiffin Partner on ${brandName}?`,
        answer: `Browse our verified kitchen partners by area or dietary preference, view their daily and monthly meal plans, and connect directly with the chef via Call or WhatsApp to place your order or start a subscription.`,
        sort_order: 1,
      },
      {
        category: 'Ordering & Delivery',
        question: 'Can I request a one-day trial meal before taking a monthly subscription?',
        answer: 'Yes! Most of our home chefs happily offer single-day trial thalis so you can taste the quality and portion size before booking weekly or monthly plans.',
        sort_order: 2,
      },
      {
        category: 'Food & Hygiene',
        question: 'Are all kitchens verified and hygienic?',
        answer: 'Every partner on our platform is personally verified with address proof, kitchen photos, and FSSAI registration checks. We prioritize pure home-cooked hygiene and seasonal fresh ingredients.',
        sort_order: 3,
      },
      {
        category: 'Partner Plans',
        question: 'What is the Partner Premium Plan and how much does it cost?',
        answer: `The Premium plan is just ₹${premiumPrice} for 30 days! It unlocks unlimited food gallery photos, gives your kitchen an eye-catching "Recommended" badge, and guarantees top placement in search results.`,
        sort_order: 4,
      },
      {
        category: 'Cancellation & Pause',
        question: 'Can I pause my tiffin subscription when I travel?',
        answer: 'Absolutely. Simply notify your tiffin partner 12 to 24 hours in advance via WhatsApp or phone, and they will adjust your delivery dates accordingly.',
        sort_order: 5,
      },
      {
        category: 'Support',
        question: 'How do I reach customer support if I have a question?',
        answer: `You can submit a ticket right from our Contact page, use the integrated live support desk, or call us at our helpline number between 7:00 AM and 10:00 PM IST.`,
        sort_order: 6,
      },
    ];

    await connection.query('DELETE FROM faqs');
    for (const f of faqs) {
      await connection.query(
        'INSERT INTO faqs (category, question, answer, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
        [f.category, f.question, f.answer, f.sort_order, true]
      );
    }

    // 3. Seed Testimonials
    console.log('  -> Seeding testimonials...');
    const testimonials = [
      {
        author_name: 'Priya Sharma',
        role_or_city: 'Software Engineer, Koramangala',
        quote: `Finding Annapurna Tiffins on ${brandName} saved my daily routine! Soft rotis, homestyle dal, and completely non-greasy food just like my mom's kitchen back in Jaipur.`,
        rating: 5,
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        sort_order: 1,
      },
      {
        author_name: 'Rahul Deshmukh',
        role_or_city: 'Fintech PM, HSR Layout',
        quote: `I have been ordering lunch and dinner for 6 months now. Punctual delivery, hot food in stainless steel tiffin containers, and superb variety every single day.`,
        rating: 5,
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        sort_order: 2,
      },
      {
        author_name: 'Sunita Mehra',
        role_or_city: 'Partner Chef, Ghar Ka Swad Tiffins',
        quote: `As a homemaker, ${brandName} helped me turn my passion for authentic North Indian cooking into a thriving home business with over 45 loyal monthly subscribers!`,
        rating: 5,
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        sort_order: 3,
      },
      {
        author_name: 'Arjun Nair',
        role_or_city: 'UX Designer, Indiranagar',
        quote: `Healthy, affordable and reliable. The direct WhatsApp ordering makes communicating custom requests like less spice or extra salad completely seamless.`,
        rating: 5,
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        sort_order: 4,
      },
    ];

    await connection.query('DELETE FROM testimonials');
    for (const t of testimonials) {
      await connection.query(
        'INSERT INTO testimonials (author_name, role_or_city, quote, rating, avatar_url, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [t.author_name, t.role_or_city, t.quote, t.rating, t.avatar_url, true, t.sort_order]
      );
    }

    // 4. Seed Admin
    console.log(`  -> Seeding Admin (${adminEmail})...`);
    const adminHashed = await bcrypt.hash(adminPassword, 10);
    const [existingAdmin] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      await connection.query(
        `INSERT INTO users (human_id, role, email, phone, password_hash, status)
         VALUES ('USR-000001', 'ADMIN', ?, '+919999900000', ?, 'ACTIVE')`,
        [adminEmail, adminHashed]
      );
    } else {
      await connection.query(
        'UPDATE users SET password_hash = ?, status = "ACTIVE" WHERE email = ?',
        [adminHashed, adminEmail]
      );
    }

    // 5. Seed 20 Customers
    console.log('  -> Seeding 20 customers...');
    const customerData = [
      { name: 'Aarav Patel', email: 'aarav.patel@gmail.com', city: 'Bengaluru', area: 'Koramangala', phone: '+91 98111 00001' },
      { name: 'Ananya Roy', email: 'ananya.roy@gmail.com', city: 'Bengaluru', area: 'Indiranagar', phone: '+91 98111 00002' },
      { name: 'Rohan Gupta', email: 'rohan.gupta@gmail.com', city: 'Bengaluru', area: 'HSR Layout', phone: '+91 98111 00003' },
      { name: 'Isha Kulkarni', email: 'isha.kulkarni@gmail.com', city: 'Bengaluru', area: 'Whitefield', phone: '+91 98111 00004' },
      { name: 'Vikram Joshi', email: 'vikram.joshi@gmail.com', city: 'Bengaluru', area: 'BTM Layout', phone: '+91 98111 00005' },
      { name: 'Tanvi Shah', email: 'tanvi.shah@gmail.com', city: 'Bengaluru', area: 'Jayanagar', phone: '+91 98111 00006' },
      { name: 'Manish Verma', email: 'manish.verma@gmail.com', city: 'Bengaluru', area: 'Bellandur', phone: '+91 98111 00007' },
      { name: 'Sneha Rao', email: 'sneha.rao@gmail.com', city: 'Bengaluru', area: 'Marathahalli', phone: '+91 98111 00008' },
      { name: 'Aditya Sen', email: 'aditya.sen@gmail.com', city: 'Bengaluru', area: 'Electronic City', phone: '+91 98111 00009' },
      { name: 'Divya Iyer', email: 'divya.iyer@gmail.com', city: 'Bengaluru', area: 'Malleshwaram', phone: '+91 98111 00010' },
      { name: 'Kunal Kapoor', email: 'kunal.kapoor@gmail.com', city: 'Bengaluru', area: 'Koramangala', phone: '+91 98111 00011' },
      { name: 'Meera Nambiar', email: 'meera.nambiar@gmail.com', city: 'Bengaluru', area: 'Indiranagar', phone: '+91 98111 00012' },
      { name: 'Deepak Chawla', email: 'deepak.chawla@gmail.com', city: 'Bengaluru', area: 'HSR Layout', phone: '+91 98111 00013' },
      { name: 'Pooja Hegde', email: 'pooja.hegde@gmail.com', city: 'Bengaluru', area: 'JP Nagar', phone: '+91 98111 00014' },
      { name: 'Naveen Kumar', email: 'naveen.kumar@gmail.com', city: 'Bengaluru', area: 'BTM Layout', phone: '+91 98111 00015' },
      { name: 'Ritika Basu', email: 'ritika.basu@gmail.com', city: 'Bengaluru', area: 'Whitefield', phone: '+91 98111 00016' },
      { name: 'Siddharth Menon', email: 'siddharth.menon@gmail.com', city: 'Bengaluru', area: 'Bellandur', phone: '+91 98111 00017' },
      { name: 'Kavita Reddy', email: 'kavita.reddy@gmail.com', city: 'Bengaluru', area: 'Sarjapur Road', phone: '+91 98111 00018' },
      { name: 'Gaurav Mishra', email: 'gaurav.mishra@gmail.com', city: 'Bengaluru', area: 'Hebbal', phone: '+91 98111 00019' },
      { name: 'Neha Bansal', email: 'neha.bansal@gmail.com', city: 'Bengaluru', area: 'Bannerghatta Road', phone: '+91 98111 00020' },
    ];

    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    const customerProfileIds: number[] = [];

    for (let i = 0; i < customerData.length; i++) {
      const c = customerData[i];
      const humanId = `CUS-${(i + 1).toString().padStart(6, '0')}`;
      const userHumanId = `USR-${(i + 100).toString().padStart(6, '0')}`;

      const [existingUser] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [c.email]
      );

      let userId: number;
      if (existingUser.length === 0) {
        const [res] = await connection.query<mysql.ResultSetHeader>(
          `INSERT INTO users (human_id, role, email, phone, password_hash, status)
           VALUES (?, 'CUSTOMER', ?, ?, ?, 'ACTIVE')`,
          [userHumanId, c.email, c.phone, customerPasswordHash]
        );
        userId = res.insertId;
      } else {
        userId = existingUser[0].id;
      }

      const [existingProf] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM customer_profiles WHERE user_id = ?',
        [userId]
      );

      let profId: number;
      if (existingProf.length === 0) {
        const [res] = await connection.query<mysql.ResultSetHeader>(
          `INSERT INTO customer_profiles (user_id, human_id, full_name, avatar_url, phone, address, city, area, pincode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, '560034')`,
          [
            userId,
            humanId,
            c.name,
            `https://images.unsplash.com/photo-${1534528741775 + i}?auto=format&fit=crop&w=200&q=80`,
            c.phone,
            `Flat ${101 + i}, Palm Meadows, ${c.area}`,
            c.city,
            c.area,
          ]
        );
        profId = res.insertId;
      } else {
        profId = existingProf[0].id;
      }
      customerProfileIds.push(profId);
    }

    // 6. Seed 12+ Tiffin Partners
    console.log('  -> Seeding 12+ Tiffin Partners...');
    const partnerData = [
      {
        kitchen_name: 'Annapurna Homestyle Tiffins',
        owner_name: 'Sunita Agarwal',
        email: 'annapurna@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Koramangala',
        address: '14, 4th Cross, 5th Block, Koramangala',
        bio: 'Serving authentic pure-ghee North Indian homestyle meals for over 7 years. Low oil, balanced spices, freshly rolled soft phulkas and delicious dal every day.',
        phone: '+91 98450 11001',
        whatsapp: '+91 98450 11001',
        fssai: '21221190000101',
        cover_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: true,
        admin_rank: 100,
        is_premium: true,
      },
      {
        kitchen_name: 'Ghar Ka Swad Rasoi',
        owner_name: 'Manju Sharma',
        email: 'gharkaswad@tiffinghar.local',
        city: 'Bengaluru',
        area: 'HSR Layout',
        address: '88, 17th Cross, Sector 4, HSR Layout',
        bio: 'Specialising in Punjab & Delhi style comfort food. Rajma chawal, sarson saag in winter, paneer bhurji, and steaming basmati rice packed hot.',
        phone: '+91 98450 11002',
        whatsapp: '+91 98450 11002',
        fssai: '21221190000102',
        cover_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: true,
        admin_rank: 95,
        is_premium: true,
      },
      {
        kitchen_name: 'Maa Ki Rasoi Tiffin Service',
        owner_name: 'Kavita Mathur',
        email: 'maakirasoi@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Indiranagar',
        address: '52, 12th Main Road, HAL 2nd Stage, Indiranagar',
        bio: 'Wholesome Gujarati & Rajasthani satvik tiffins made without preservatives or soda. Warm kadi, thepla, panchmel dal, and green salads.',
        phone: '+91 98450 11003',
        whatsapp: '+91 98450 11003',
        fssai: '21221190000103',
        cover_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: true,
        admin_rank: 90,
        is_premium: true,
      },
      {
        kitchen_name: 'Shree Krishna Satvik Meals',
        owner_name: 'Rameshwar Vyas',
        email: 'shreekrishna@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Whitefield',
        address: '22, Inner Circle, Whitefield Main Road',
        bio: '100% Jain & Pure Veg homemade meals. No onion, no garlic options readily available. Cooked in pure groundnut oil and farm-fresh greens.',
        phone: '+91 98450 11004',
        whatsapp: '+91 98450 11004',
        fssai: '21221190000104',
        cover_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: true,
        admin_rank: 85,
        is_premium: true,
      },
      {
        kitchen_name: 'Dadi Da Dhaba Home Kitchen',
        owner_name: 'Harpreet Kaur',
        email: 'dadidadhaba@tiffinghar.local',
        city: 'Bengaluru',
        area: 'BTM Layout',
        address: '76, 2nd Stage, BTM Layout',
        bio: 'Rich, comforting Punjabi home food made by Biji with hearty portions. Kadai paneer, tawa rotis, seasonal subzi, and fresh mint curd.',
        phone: '+91 98450 11005',
        whatsapp: '+91 98450 11005',
        fssai: '21221190000105',
        cover_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 70,
        is_premium: false,
        had_expired_premium: true,
      },
      {
        kitchen_name: 'Swadist South & North Tiffins',
        owner_name: 'Lakshmi Narayanan',
        email: 'swadist@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Jayanagar',
        address: '4th Block, 9th Main, Jayanagar',
        bio: 'Offering both North Indian phulka thalis and traditional South Indian rice-sambar-poriyal lunches. Packed in insulated tiffin bags.',
        phone: '+91 98450 11006',
        whatsapp: '+91 98450 11006',
        fssai: '21221190000106',
        cover_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 65,
        is_premium: false,
        had_expired_premium: true,
      },
      {
        kitchen_name: 'Nani Ki Rasoi Delights',
        owner_name: 'Sushila Devi',
        email: 'nanikirasoi@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Bellandur',
        address: '33, Green Glen Layout, Bellandur',
        bio: 'Authentic Bihari & UP cuisine. Sattu parathas, chokha, aloo gobhi rasedar, and steamed rice. Loved by techies working around Bellandur tech parks.',
        phone: '+91 98450 11007',
        whatsapp: '+91 98450 11007',
        fssai: '21221190000107',
        cover_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 50,
        is_premium: false,
      },
      {
        kitchen_name: 'Coastal Flavours Tiffin Hub',
        owner_name: 'Vinita Shenoy',
        email: 'coastal@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Electronic City',
        address: 'Phase 1, Electronic City, Hosur Road',
        bio: 'Mangalorean and Konkani delicacies. Dal toyy, bhindi sukka, soft brown rice, and non-veg fish curry on Wednesdays & Fridays.',
        phone: '+91 98450 11008',
        whatsapp: '+91 98450 11008',
        fssai: '21221190000108',
        cover_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 45,
        is_premium: false,
      },
      {
        kitchen_name: 'Shanti Maharashtrian Tiffins',
        owner_name: 'Anjali Patil',
        email: 'shanti@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Marathahalli',
        address: 'Near Spice Garden, Marathahalli',
        bio: 'Authentic Maharashtrian Poli-Bhaji, Varan Bhaat, Matki Usal, and fresh peanut thecha. Cooked clean with no excess oil.',
        phone: '+91 98450 11009',
        whatsapp: '+91 98450 11009',
        fssai: '21221190000109',
        cover_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        is_verified: false,
        is_pinned: false,
        admin_rank: 40,
        is_premium: false,
      },
      {
        kitchen_name: 'Desi Khana Daily Mess',
        owner_name: 'Vikash Tiwari',
        email: 'desikhana@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Malleshwaram',
        address: 'Sampige Road, 7th Cross, Malleshwaram',
        bio: 'Affordable monthly and weekly student-friendly tiffin plans. Heavy meals with 4 rotis, 2 vegetables, dal, rice, and pickle.',
        phone: '+91 98450 11010',
        whatsapp: '+91 98450 11010',
        fssai: '21221190000110',
        cover_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 35,
        is_premium: false,
      },
      {
        kitchen_name: 'Amma Chettinad Home Tiffins',
        owner_name: 'Meenakshi Sundaram',
        email: 'ammachettinad@tiffinghar.local',
        city: 'Bengaluru',
        area: 'JP Nagar',
        address: 'Phase 6, Outer Ring Road, JP Nagar',
        bio: 'Spicy, aromatic Chettinad gravies, pepper rasam, warm sambar, and poriyals with freshly ground spices.',
        phone: '+91 98450 11011',
        whatsapp: '+91 98450 11011',
        fssai: '21221190000111',
        cover_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 30,
        is_premium: false,
      },
      {
        kitchen_name: 'FitBhojan High-Protein Meals',
        owner_name: 'Karan Mehra',
        email: 'fitbhojan@tiffinghar.local',
        city: 'Bengaluru',
        area: 'Koramangala',
        address: '80 Feet Road, 6th Block, Koramangala',
        bio: 'Calorie-counted, high-protein homemade meal plans for fitness enthusiasts. Multigrain rotis, paneer, sprouts salad, and grilled chicken bowls.',
        phone: '+91 98450 11012',
        whatsapp: '+91 98450 11012',
        fssai: '21221190000112',
        cover_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        logo_url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=200&q=80',
        is_verified: true,
        is_pinned: false,
        admin_rank: 25,
        is_premium: false,
      },
    ];

    const partnerPasswordHash = await bcrypt.hash('partner123', 10);
    const partnerProfileIds: number[] = [];

    for (let i = 0; i < partnerData.length; i++) {
      const p = partnerData[i];
      const humanId = `TIF-${(i + 1).toString().padStart(6, '0')}`;
      const userHumanId = `USR-${(i + 200).toString().padStart(6, '0')}`;

      const [existingUser] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [p.email]
      );

      let userId: number;
      if (existingUser.length === 0) {
        const [res] = await connection.query<mysql.ResultSetHeader>(
          `INSERT INTO users (human_id, role, email, phone, password_hash, status)
           VALUES (?, 'PARTNER', ?, ?, ?, 'ACTIVE')`,
          [userHumanId, p.email, p.phone, partnerPasswordHash]
        );
        userId = res.insertId;
      } else {
        userId = existingUser[0].id;
      }

      const [existingProf] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM partner_profiles WHERE user_id = ?',
        [userId]
      );

      let profId: number;
      if (existingProf.length === 0) {
        const [res] = await connection.query<mysql.ResultSetHeader>(
          `INSERT INTO partner_profiles (
            user_id, human_id, kitchen_name, owner_name, bio, logo_url, cover_url,
            address, city, area, pincode, contact_phone, contact_whatsapp, fssai_number,
            admin_rank, is_pinned, is_verified, is_suspended, delivery_areas, delivery_timings, plan_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '560034', ?, ?, ?, ?, ?, ?, false, ?, 'Lunch: 12-2 PM | Dinner: 7:30-9:30 PM', 'Daily, Weekly, Monthly')`,
          [
            userId,
            humanId,
            p.kitchen_name,
            p.owner_name,
            p.bio,
            p.logo_url,
            p.cover_url,
            p.address,
            p.city,
            p.area,
            p.phone,
            p.whatsapp,
            p.fssai,
            p.admin_rank,
            p.is_pinned,
            p.is_verified,
            `${p.area}, BTM, HSR, Koramangala`,
          ]
        );
        profId = res.insertId;
      } else {
        profId = existingProf[0].id;
        await connection.query(
          `UPDATE partner_profiles SET
            kitchen_name = ?, owner_name = ?, bio = ?, cover_url = ?,
            admin_rank = ?, is_pinned = ?, is_verified = ?
           WHERE id = ?`,
          [p.kitchen_name, p.owner_name, p.bio, p.cover_url, p.admin_rank, p.is_pinned, p.is_verified, profId]
        );
      }
      partnerProfileIds.push(profId);

      // Subscriptions & Payments
      const [existingSub] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM subscriptions WHERE partner_id = ?',
        [profId]
      );

      if (existingSub.length === 0) {
        if (p.is_premium) {
          // Active premium
          const payHumanId = `PAY-${(i + 1).toString().padStart(6, '0')}`;
          const [payRes] = await connection.query<mysql.ResultSetHeader>(
            `INSERT INTO payments (human_id, partner_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_payload)
             VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)`,
            [
              payHumanId,
              profId,
              `order_live_${1000 + i}`,
              `pay_live_${5000 + i}`,
              premiumPrice,
              JSON.stringify({ method: 'upi', bank: 'HDFC', timestamp: new Date().toISOString() }),
            ]
          );

          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 5);
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 25);

          await connection.query(
            `INSERT INTO subscriptions (partner_id, plan, start_date, end_date, status, payment_id, amount)
             VALUES (?, 'PREMIUM', ?, ?, 'ACTIVE', ?, ?)`,
            [profId, startDate, endDate, payRes.insertId, premiumPrice]
          );
        } else if (p.had_expired_premium) {
          // Expired subscription
          const payHumanId = `PAY-${(i + 50).toString().padStart(6, '0')}`;
          const [payRes] = await connection.query<mysql.ResultSetHeader>(
            `INSERT INTO payments (human_id, partner_id, razorpay_order_id, razorpay_payment_id, amount, status, raw_payload)
             VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?)`,
            [
              payHumanId,
              profId,
              `order_exp_${2000 + i}`,
              `pay_exp_${6000 + i}`,
              premiumPrice,
              JSON.stringify({ method: 'card', bank: 'ICICI', timestamp: new Date().toISOString() }),
            ]
          );

          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 40);
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - 10);

          await connection.query(
            `INSERT INTO subscriptions (partner_id, plan, start_date, end_date, status, payment_id, amount)
             VALUES (?, 'PREMIUM', ?, ?, 'EXPIRED', ?, ?)`,
            [profId, startDate, endDate, payRes.insertId, premiumPrice]
          );
        }
      }

      // 7. Seed 3+ Products for each partner
      const [existingProds] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM products WHERE partner_id = ?',
        [profId]
      );

      if (existingProds.length === 0) {
        const productsList = [
          {
            name: `${p.kitchen_name.split(' ')[0]} Standard Thali`,
            desc: '4 soft phulkas, 1 seasonal green sabzi, 1 dal tadka, steamed fragrant rice, fresh cucumber salad & pickle.',
            price: 110,
            is_veg: true,
            cat: 'Daily Thali',
            img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Special Shahi Paneer Deluxe Meal',
            desc: '4 butter rotis, rich homestyle paneer makhani, jeera rice, dal makhani, boondi raita, and sweet gulab jamun.',
            price: 160,
            is_veg: true,
            cat: 'Special Meal',
            img: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Homestyle Diet Box / Mini Meal',
            desc: '3 multigrain phulkas with mild mixed vegetable curry, yellow moong dal, and fresh green salad. Zero soda, minimal oil.',
            price: 90,
            is_veg: true,
            cat: 'Mini Thali',
            img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
          },
          {
            name: 'Weekend Special Feast',
            desc: 'Kashmiri dum aloo or chicken curry, 2 stuffed parathas, aromatic pulao, kheer, and crisp papad.',
            price: 190,
            is_veg: i % 3 !== 0,
            cat: 'Weekend Feast',
            img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
          },
        ];

        for (let j = 0; j < productsList.length; j++) {
          const pr = productsList[j];
          const [prodRes] = await connection.query<mysql.ResultSetHeader>(
            `INSERT INTO products (partner_id, name, description, price, is_veg, is_active, category)
             VALUES (?, ?, ?, ?, ?, true, ?)`,
            [profId, pr.name, pr.desc, pr.price, pr.is_veg, pr.cat]
          );

          // Add cover image and 1 extra gallery image
          await connection.query(
            `INSERT INTO product_images (product_id, partner_id, image_url, sort_order, is_cover)
             VALUES (?, ?, ?, 0, true)`,
            [prodRes.insertId, profId, pr.img]
          );

          await connection.query(
            `INSERT INTO product_images (product_id, partner_id, image_url, sort_order, is_cover)
             VALUES (?, ?, ?, 1, false)`,
            [
              prodRes.insertId,
              profId,
              'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=600&q=80',
            ]
          );
        }
      }
    }

    // 8. Seed Reviews
    console.log('  -> Seeding reviews...');
    const [existingReviews] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id FROM reviews LIMIT 1'
    );
    if (existingReviews.length === 0 && customerProfileIds.length > 0 && partnerProfileIds.length > 0) {
      const reviewComments = [
        'Pure homemade taste, soft rotis and the dal reminds me of home! Highly recommended for daily tiffins.',
        'Very punctual delivery. Food is packed hot in stainless steel containers. Zero tummy troubles.',
        'The sabzi has very little oil and balanced spices. Best tiffin service in Bangalore so far.',
        'Loved the special weekend thali! The gulab jamun and paneer sabzi were heavenly.',
        'Great portion sizes and reasonable price. My entire team at office now orders from here.',
      ];

      for (let pIdx = 0; pIdx < partnerProfileIds.length; pIdx++) {
        const partnerId = partnerProfileIds[pIdx];
        // add 2-3 reviews per partner from different customers
        for (let r = 0; r < 3; r++) {
          const custId = customerProfileIds[(pIdx * 2 + r) % customerProfileIds.length];
          const rating = (pIdx + r) % 2 === 0 ? 5 : 4;
          const comment = reviewComments[(pIdx + r) % reviewComments.length];
          const partnerReply =
            r === 0 ? 'Thank you so much! We take pride in serving pure, freshly prepared food every day.' : null;

          await connection.query(
            `INSERT INTO reviews (customer_id, partner_id, rating, comment, partner_reply, reply_created_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
            [custId, partnerId, rating, comment, partnerReply, partnerReply ? new Date() : null]
          );
        }
      }
    }

    // 9. Seed View Logs and Contact Clicks
    console.log('  -> Seeding view logs and contact clicks...');
    const [existingViews] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id FROM view_logs LIMIT 1'
    );
    if (existingViews.length === 0 && partnerProfileIds.length > 0) {
      for (let pIdx = 0; pIdx < partnerProfileIds.length; pIdx++) {
        const partnerId = partnerProfileIds[pIdx];
        const viewCount = 15 + pIdx * 4;

        for (let v = 0; v < viewCount; v++) {
          const custId = v % 3 === 0 ? customerProfileIds[v % customerProfileIds.length] : null;
          await connection.query(
            `INSERT INTO view_logs (partner_id, customer_id, session_id, ip_address, user_agent, created_at)
             VALUES (?, ?, ?, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL ? DAY))`,
            [partnerId, custId, `sess_${partnerId}_${v}`, (v % 14)]
          );
        }

        // Contact clicks
        for (let c = 0; c < 5; c++) {
          const clickType = c % 2 === 0 ? 'CALL' : 'WHATSAPP';
          const custId = customerProfileIds[c % customerProfileIds.length];
          await connection.query(
            `INSERT INTO contact_click_logs (partner_id, customer_id, click_type, session_id, ip_address, created_at)
             VALUES (?, ?, ?, ?, '127.0.0.1', DATE_SUB(NOW(), INTERVAL ? DAY))`,
            [partnerId, custId, clickType, `sess_click_${c}`, (c % 7)]
          );
        }
      }
    }

    // 10. Seed Support Tickets
    console.log('  -> Seeding support tickets...');
    const [existingTickets] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id FROM support_tickets LIMIT 1'
    );
    if (existingTickets.length === 0) {
      const tickets = [
        {
          humanId: 'TKT-000001',
          name: 'Aarav Patel',
          email: 'aarav.patel@gmail.com',
          role: 'CUSTOMER',
          subject: 'Need help customizing spice level for daily subscription',
          message: 'Hi team, I would like to check if Annapurna Tiffins can prepare food with no green chillies due to dietary restrictions.',
          status: 'IN_PROGRESS',
        },
        {
          humanId: 'TKT-000002',
          name: 'Sunita Agarwal',
          email: 'annapurna@tiffinghar.local',
          role: 'PARTNER',
          subject: 'Question regarding Premium Plan renewal and GST invoices',
          message: 'Hello, our monthly premium subscription will renew next week. Can we download GST receipts directly from the dashboard?',
          status: 'RESOLVED',
        },
        {
          humanId: 'TKT-000003',
          name: 'Deepak Chawla',
          email: 'deepak.chawla@gmail.com',
          role: 'CUSTOMER',
          subject: 'Delivery area expansion to Harlur Road',
          message: 'Are there any verified partners delivering lunch tiffins around Harlur Road or Sarjapur Junction?',
          status: 'OPEN',
        },
      ];

      for (const t of tickets) {
        const [res] = await connection.query<mysql.ResultSetHeader>(
          `INSERT INTO support_tickets (human_id, guest_name, guest_email, role_type, subject, message, status, priority)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'MEDIUM')`,
          [t.humanId, t.name, t.email, t.role, t.subject, t.message, t.status]
        );

        // Seed sample message
        await connection.query(
          `INSERT INTO chat_messages (ticket_id, sender_role, message, is_read)
           VALUES (?, 'USER', ?, true)`,
          [res.insertId, t.message]
        );
        await connection.query(
          `INSERT INTO chat_messages (ticket_id, sender_role, message, is_read)
           VALUES (?, 'ADMIN', 'Hello! Thanks for reaching out. We have noted your request and our support coordinator will assist you right away.', true)`,
          [res.insertId]
        );
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`👉 Admin account: ${adminEmail} (password: ${adminPassword})`);
    console.log(`👉 Test Customer account: aarav.patel@gmail.com (password: customer123)`);
    console.log(`👉 Test Partner account: annapurna@tiffinghar.local (password: partner123)`);
  } catch (err: any) {
    if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ENOTFOUND'
    ) {
      console.error(
        '\n❌ [Database Connection Error]: MySQL is not reachable.\n👉 Start WAMP and make sure the icon is green, then check DB_* values in .env.\n'
      );
    } else {
      console.error('❌ Seeding error:', err.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
