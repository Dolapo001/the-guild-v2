export interface Service {
    id: string;
    name: string;
    businessName: string;
    category: "beauty" | "cleaning" | "catering" | "events";
    rating: number;
    reviewsCount: number;
    location: string;
    price: number;
    image: string;
    isVerified: boolean;
    isTopRated: boolean;
    description: string;
    portfolio: string[];
    services: { name: string; price: number }[];
    city: string;
    lat: number;
    lng: number;
}

export const SERVICES_DATA: Service[] = [
    {
        id: "1",
        name: "Premium Spa & Wellness",
        businessName: "Glow Spa Lekki",
        category: "beauty",
        rating: 4.9,
        reviewsCount: 128,
        location: "Lekki Phase 1, Lagos",
        price: 15000,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        isVerified: true,
        isTopRated: true,
        description: "Experience the ultimate relaxation with our premium spa services. We offer a wide range of treatments designed to rejuvenate your body and mind.",
        portfolio: [
            "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=400&auto=format&fit=crop"
        ],
        services: [
            { name: "Full Body Massage", price: 15000 },
            { name: "Deep Tissue Massage", price: 20000 },
            { name: "Facial Treatment", price: 12000 },
            { name: "Manicure & Pedicure", price: 8000 }
        ],
        city: "Lagos",
        lat: 6.4474,
        lng: 3.4723
    },
    {
        id: "2",
        name: "Professional Home Cleaning",
        businessName: "Sparkle Cleaners",
        category: "cleaning",
        rating: 4.7,
        reviewsCount: 85,
        location: "Ikeja GRA, Lagos",
        price: 10000,
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=800&auto=format&fit=crop",
        isVerified: true,
        isTopRated: false,
        description: "We provide top-notch cleaning services for homes and offices. Our team is highly trained and uses eco-friendly products.",
        portfolio: [
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop"
        ],
        services: [
            { name: "Standard Room Cleaning", price: 10000 },
            { name: "Deep Cleaning", price: 25000 },
            { name: "Post-Construction Cleaning", price: 50000 }
        ],
        city: "Lagos",
        lat: 6.5967,
        lng: 3.3421
    },
    {
        id: "3",
        name: "Authentic Nigerian Catering",
        businessName: "Mama T's Kitchen",
        category: "catering",
        rating: 4.8,
        reviewsCount: 210,
        location: "Surulere, Lagos",
        price: 5000,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
        isVerified: true,
        isTopRated: true,
        description: "Delicious, home-cooked Nigerian meals for all occasions. From small gatherings to large events, we've got you covered.",
        portfolio: [
            "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop"
        ],
        services: [
            { name: "Party Jollof (Per Scoop)", price: 1500 },
            { name: "Full Catering Package (50 people)", price: 150000 },
            { name: "Office Lunch Delivery", price: 5000 }
        ],
        city: "Lagos",
        lat: 6.5059,
        lng: 3.3615
    },
    {
        id: "4",
        name: "Professional Event Photography",
        businessName: "Lens Master Studios",
        category: "events",
        rating: 4.9,
        reviewsCount: 56,
        location: "Victoria Island, Lagos",
        price: 75000,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
        isVerified: true,
        isTopRated: true,
        description: "Capturing your special moments with precision and creativity. We specialize in weddings, corporate events, and portraits.",
        portfolio: [
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop"
        ],
        services: [
            { name: "Wedding Photography", price: 250000 },
            { name: "Portrait Session", price: 75000 },
            { name: "Event Coverage (Hourly)", price: 30000 }
        ],
        city: "Lagos",
        lat: 6.4281,
        lng: 3.4219
    }
];

export const MOCK_STAFF = [
    {
        id: "s0",
        name: "Sarah Johnson",
        role: "Business Owner / Master Pro",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
        status: "Active",
        isOwner: true,
        availableForBookings: true,
        revenue: [
            { month: 'Oct', amount: 850000 },
            { month: 'Nov', amount: 920000 },
            { month: 'Dec', amount: 1100000 },
            { month: 'Jan', amount: 980000 },
        ]
    },
    {
        id: "s1",
        name: "Michael Chen",
        role: "Senior Massage Therapist",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
        status: "Active",
        revenue: [
            { month: 'Oct', amount: 450000 },
            { month: 'Nov', amount: 520000 },
            { month: 'Dec', amount: 610000 },
            { month: 'Jan', amount: 580000 },
        ]
    },
    {
        id: "s2",
        name: "Chioma Okoro",
        role: "Skin Specialist",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&auto=format&fit=crop",
        status: "Active",
        revenue: [
            { month: 'Oct', amount: 320000 },
            { month: 'Nov', amount: 350000 },
            { month: 'Dec', amount: 420000 },
            { month: 'Jan', amount: 390000 },
        ]
    },
    {
        id: "s3",
        name: "Amina Bello",
        role: "Nail Technician",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
        status: "Active",
        revenue: [
            { month: 'Oct', amount: 280000 },
            { month: 'Nov', amount: 310000 },
            { month: 'Dec', amount: 380000 },
            { month: 'Jan', amount: 340000 },
        ]
    },
];

export const MOCK_CUSTOMER_DATA = {
    name: "Adedolapo",
    activeBooking: {
        service: "Deep Tissue Massage",
        business: "Glow Spa Lekki",
        time: "Today, 2:00 PM",
        location: "12 Adeola Odeku St, VI",
        status: "DECLINED_WITH_OPTION",
        staffName: "Sarah Johnson",
        replacementProposal: {
            name: "Michael Chen",
            rating: "4.9",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
            isVerified: true
        }
    },
    recentHistory: [
        { id: "h1", service: "Haircut", business: "Tunde's Barbershop", date: "Oct 20, 2023", price: "₦5,000" },
        { id: "h2", service: "Car Wash", business: "Clean Wheels", date: "Oct 15, 2023", price: "₦3,500" },
        { id: "h3", service: "Catering", business: "Mama T's", date: "Oct 10, 2023", price: "₦15,000" },
    ]
};

export const MOCK_BOOKINGS = [
    {
        id: "b1",
        service: "Full Body Massage",
        customer: "Alice Johnson",
        time: "Today, 09:00 AM",
        status: "Unassigned",
        staffId: null,
        price: 15000
    },
    {
        id: "b2",
        service: "Facial Treatment",
        customer: "Bob Smith",
        time: "Today, 11:00 AM",
        status: "Pending Acceptance",
        staffId: "s1",
        price: 12000
    },
    {
        id: "b3",
        service: "Manicure",
        customer: "Chioma Okeke",
        time: "Today, 02:00 PM",
        status: "Confirmed",
        staffId: "s3",
        price: 8000
    },
];

export const MOCK_STAFF_TASKS = [
    {
        id: "t1",
        service: "Deep Tissue Massage",
        customer: "Alice Johnson",
        date: "2026-01-11",
        time: "09:00 AM",
        duration: "90 Mins",
        endTime: "10:30 AM",
        status: "completed",
        price: 15000,
        customerNote: "I have sensitive skin, please use organic oil.",
        referenceImage: "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=400&auto=format&fit=crop",
        contact: { phone: "08012345678", email: "alice@example.com", whatsapp: "2348012345678" }
    },
    {
        id: "t2",
        service: "Swedish Massage",
        customer: "Bob Smith",
        date: "2026-01-11",
        time: "11:00 AM",
        duration: "60 Mins",
        endTime: "12:00 PM",
        status: "in-progress",
        price: 12000,
        customerNote: "Focus on lower back tension.",
        referenceImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=400&auto=format&fit=crop",
        contact: { phone: "08022345678", email: "bob@example.com", whatsapp: "2348022345678" }
    },
    {
        id: "t3",
        service: "Facial Treatment",
        customer: "Chioma Okeke",
        date: "2026-01-11",
        time: "02:00 PM",
        duration: "45 Mins",
        endTime: "02:45 PM",
        status: "pending",
        price: 8000,
        customerNote: "Allergic to nuts.",
        referenceImage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=400&auto=format&fit=crop",
        contact: { phone: "08032345678", email: "chioma@example.com", whatsapp: "2348032345678" }
    },
    {
        id: "t4",
        service: "Body Scrub",
        customer: "David Lee",
        date: "2026-01-11",
        time: "04:30 PM",
        duration: "60 Mins",
        endTime: "05:30 PM",
        status: "pending",
        price: 10000,
        customerNote: "First time getting a scrub.",
        referenceImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        contact: { phone: "08042345678", email: "david@example.com", whatsapp: "2348042345678" }
    },
    {
        id: "t5",
        service: "Deep Tissue Massage",
        customer: "Sarah Williams",
        date: "2026-01-12",
        time: "10:00 AM",
        duration: "60 Mins",
        endTime: "11:00 AM",
        status: "pending",
        price: 12000,
        customerNote: "None.",
        referenceImage: "https://images.unsplash.com/photo-1544161515-4ae6ce6ea858?q=80&w=400&auto=format&fit=crop",
        contact: { phone: "08052345678", email: "sarah@example.com", whatsapp: "2348052345678" }
    },
    {
        id: "t6",
        service: "Facial Treatment",
        customer: "John Doe",
        date: "2026-01-15",
        time: "01:00 PM",
        duration: "45 Mins",
        endTime: "01:45 PM",
        status: "pending",
        price: 8000,
        customerNote: "None.",
        referenceImage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=400&auto=format&fit=crop",
        contact: { phone: "08062345678", email: "john@example.com", whatsapp: "2348062345678" }
    },
];

export const MOCK_ADMIN_QUEUE = [
    { id: "q1", businessName: "Luxe Beauty Surulere", cacNumber: "RC-982341", dateSubmitted: "Oct 27, 2023", status: "pending" },
    { id: "q2", businessName: "Quick Clean Laundry", cacNumber: "RC-112233", dateSubmitted: "Oct 26, 2023", status: "pending" },
    { id: "q3", businessName: "Ikeja Tech Hub", cacNumber: "RC-445566", dateSubmitted: "Oct 25, 2023", status: "pending" },
];

export const MOCK_INVENTORY = [
    { id: "p1", name: "Organic Face Oil", category: "Beauty", price: 12500, stock: 15, status: "Active", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop" },
    { id: "p2", name: "Microfiber Cleaning Cloth", category: "Cleaning", price: 2500, stock: 3, status: "Active", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop" },
    { id: "p3", name: "Scented Candle (Lavender)", category: "Beauty", price: 8000, stock: 25, status: "Active", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=200&auto=format&fit=crop" },
    { id: "p4", name: "Industrial Degreaser", category: "Cleaning", price: 15000, stock: 2, status: "Inactive", image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=200&auto=format&fit=crop" },
    { id: "p5", name: "Gourmet Spice Mix", category: "Food", price: 4500, stock: 50, status: "Active", image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=200&auto=format&fit=crop" },
];

export const MOCK_TRANSACTIONS = [
    { id: "tr1", date: "2026-01-08", description: "Booking Payment - #1024", amount: 15000, type: "credit", status: "Success" },
    { id: "tr2", date: "2026-01-07", description: "Withdrawal to Bank", amount: -50000, type: "debit", status: "Success" },
    { id: "tr3", date: "2026-01-06", description: "Product Sale - Organic Face Oil", amount: 12500, type: "credit", status: "Success" },
    { id: "tr4", date: "2026-01-05", description: "Wallet Funding", amount: 20000, type: "credit", status: "Success" },
    { id: "tr5", date: "2026-01-04", description: "Service Fee", amount: -2500, type: "debit", status: "Success" },
];

export const MOCK_REVIEWS = [
    {
        id: "r1",
        user: "Chioma Ade",
        avatar: "https://github.com/shadcn.png",
        rating: 5,
        text: "Absolutely loved the service! The staff was professional and the atmosphere was so relaxing.",
        date: "2 days ago",
        images: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&auto=format&fit=crop"],
        reply: "Thank you so much Chioma! We look forward to seeing you again."
    },
    {
        id: "r2",
        user: "Ahmed Musa",
        avatar: "https://github.com/shadcn.png",
        rating: 4,
        text: "Great experience overall. The haircut was perfect, but the wait time was a bit longer than expected.",
        date: "1 week ago",
        images: [],
        reply: null
    },
];
