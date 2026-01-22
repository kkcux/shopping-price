export const categorySlugMap = {
    "อาหารสด & แช่แข็ง": "fresh-frozen",
    "อาหารแห้ง": "dry-food-condiments",
    "อาหารแห้งและเครื่องปรุง": "dry-food-condiments", // Support both naming conventions
    "ของใช้ในบ้าน": "household",
    "สุขภาพ & ความงาม": "health-beauty",
    "แม่และเด็ก": "mom-baby",
    "เครื่องใช้ไฟฟ้า": "electronics",
    "เครื่องมือช่าง": "tools",
    "สัตว์เลี้ยง": "pets",
    "เบเกอรี่": "bakery",
    "เครื่องดื่ม": "beverages",
    "ขนมขบเคี้ยว": "snacks",
    "เฟอร์นิเจอร์": "furniture",
    "ยางรถยนต์": "tires",
    "อุปกรณ์สำนักงาน": "office-supplies",
    "ผักและผลไม้": "vegetables-fruits",
    "เสื้อผ้าและเครื่องแต่งกาย": "clothing",
    "เครื่องเขียน": "stationery",
    "อื่นๆ": "others"
  };
  
  export const getCategorySlug = (categoryName) => {
    return categorySlugMap[categoryName] || "others";
  };
