export interface KnowledgeEntry {
  topic: string;
  content: string;
  category: 'products' | 'support' | 'warranty' | 'installation' | 'general';
  created_by: string;
}

export const initialKnowledgeBase: KnowledgeEntry[] = [
  // Smartphones
  {
    topic: "iPhone 15 Pro Max Details",
    content: `Features: A17 Pro chip, 6.7" Super Retina XDR display, 48MP triple-camera system, titanium frame, USB-C port
Dimensions: 159.9 x 76.7 x 8.25 mm, 221g
Power: 4323mAh battery, 29W fast charging, MagSafe
Price: KSh 191,840
Setup: Insert SIM, power on, follow setup wizard, sign in with Apple ID
Accessories: AirPods Pro, MagSafe Charger, Apple Watch`,
    category: "products",
    created_by: "system"
  },
  {
    topic: "Samsung Galaxy S24 Ultra Details",
    content: `Features: Snapdragon 8 Gen 3, 6.8" Dynamic AMOLED 2X, 200MP camera, S Pen
Price: KSh 207,840
Accessories: Galaxy Buds Pro, Samsung Wireless Charger, SmartTag
Setup: Insert SIM, connect to WiFi, sign in to Google account`,
    category: "products",
    created_by: "system"
  },
  // Laptops
  {
    topic: "MacBook Pro 16 M3 Max Details",
    content: `Features: M3 Max chip, 16.2" Liquid Retina XDR display, 32GB RAM
Price: KSh 559,840
Accessories: Magic Mouse, USB-C hub, AirPods Max
Setup: Power on and follow macOS setup wizard`,
    category: "products",
    created_by: "system"
  },
  // Home Appliances
  {
    topic: "LG OLED C3 55 TV Details",
    content: `Features: 4K OLED panel, Dolby Vision, 120Hz refresh rate
Price: KSh 239,840
Accessories: LG Soundbar, HDMI 2.1 Cable, Smart Remote
Setup: Mount on wall/stand, connect power and WiFi, adjust display settings`,
    category: "products",
    created_by: "system"
  },
  // Troubleshooting
  {
    topic: "Common Smartphone Issues",
    content: `Battery Drains Fast:
- Disable background apps
- Lower screen brightness
- Update to latest OS

Bluetooth Issues:
- Restart device
- Unpair and re-pair device`,
    category: "support",
    created_by: "system"
  },
  {
    topic: "Laptop Troubleshooting",
    content: `Overheating:
- Use cooling pad
- Clean vents and update drivers

WiFi Issues:
- Restart router
- Update network drivers`,
    category: "support",
    created_by: "system"
  },
  // Store Policies
  {
    topic: "Store Policies and Delivery",
    content: `Order Tracking: Use order number on website/app
Shipping: Free delivery for orders above KSh 10,000
Returns: 7-day return window for unused products
Warranty: 1-2 years depending on product
Payment: M-Pesa, Credit/Debit Cards, Financing options
Store Hours: 8 AM - 8 PM (Mon-Sat)
Contact: 0700 123 456 or support@electronics.co.ke`,
    category: "general",
    created_by: "system"
  },
  // Product Recommendations
  {
    topic: "Product Recommendations",
    content: `Budget Recommendations:
- Best smartphones under KSh 80,000: Google Pixel 7a
- Best laptops under KSh 160,000: Lenovo ThinkPad X1

Feature-Based Selection:
- Best TV for gaming: LG OLED C3
- Best laptop for designers: MacBook Pro M3

Upgrade Paths:
- iPhone 14 → iPhone 15 Pro Max
- MacBook Air M2 → MacBook Pro M3`,
    category: "general",
    created_by: "system"
  },
  // Warranties
  {
    topic: "Warranty Information",
    content: `Standard Warranty Coverage:
- Smartphones: 1 year manufacturer warranty
- Laptops: 2 years international warranty
- TVs: 2 years local warranty
- Home Appliances: 1 year parts and labor

Extended Warranty Options:
- AppleCare+ (iPhones, MacBooks): 2-3 years
- Samsung Care+ (Galaxy devices): 2 years
- LG Extended Care: Up to 3 years

What's Covered:
- Manufacturing defects
- Hardware malfunctions
- Display issues
- Battery defects (for mobile devices)

What's Not Covered:
- Physical damage
- Water damage
- Unauthorized repairs
- Normal wear and tear`,
    category: "warranty",
    created_by: "system"
  },
  // Installation Guides
  {
    topic: "Device Setup and Installation",
    content: `TV Installation:
1. Wall mounting service available
2. Smart TV setup and WiFi connection
3. Channel tuning and app installation
4. Sound system integration

Home Appliance Installation:
1. Professional installation service
2. Electrical safety checks
3. Performance testing
4. User training session

Smart Home Setup:
1. Device integration
2. App configuration
3. Voice assistant setup
4. Automation rules setup`,
    category: "installation",
    created_by: "system"
  },
  // Additional Products
  {
    topic: "Smart Home Devices",
    content: `Smart Speakers:
- Amazon Echo (4th Gen): KSh 15,999
- Google Nest Audio: KSh 14,999
- Apple HomePod Mini: KSh 19,999

Security Cameras:
- Ring Doorbell Pro: KSh 29,999
- Arlo Pro 4: KSh 39,999
- Nest Cam (Battery): KSh 34,999

Smart Lighting:
- Philips Hue Starter Kit: KSh 24,999
- LIFX Color: KSh 7,999
- Nanoleaf Shapes: KSh 29,999`,
    category: "products",
    created_by: "system"
  },
  {
    topic: "Gaming Consoles",
    content: `PlayStation 5:
- Digital Edition: KSh 69,999
- Disc Edition: KSh 79,999
- Extra Controller: KSh 9,999
- PS Plus subscription available

Xbox Series X/S:
- Series X: KSh 79,999
- Series S: KSh 44,999
- Game Pass subscription available

Gaming Accessories:
- Gaming Headsets: KSh 8,999 - 29,999
- Gaming Chairs: KSh 24,999 - 49,999
- Gaming Monitors: KSh 39,999 - 89,999`,
    category: "products",
    created_by: "system"
  }
];

export const searchKnowledgeBase = (query: string): KnowledgeEntry[] => {
  const normalizedQuery = query.toLowerCase();
  return initialKnowledgeBase.filter(entry => {
    const normalizedContent = entry.content.toLowerCase();
    const normalizedTopic = entry.topic.toLowerCase();
    return normalizedContent.includes(normalizedQuery) || normalizedTopic.includes(normalizedQuery);
  });
};

export const addKnowledgeEntry = async (entry: KnowledgeEntry): Promise<void> => {
  // In a real application, this would make an API call to store the entry
  console.log('Adding knowledge entry:', entry);
  // Simulating async operation
  await new Promise(resolve => setTimeout(resolve, 1000));
};

export const getKnowledgeEntries = async (): Promise<KnowledgeEntry[]> => {
  // In a real application, this would make an API call to fetch entries
  return initialKnowledgeBase;
};

export const searchInternet = async (query: string): Promise<string> => {
  // In a real application, this would make an API call to search the internet
  console.log('Searching internet for:', query);
  // Simulating async operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "Internet search results would appear here.";
};
