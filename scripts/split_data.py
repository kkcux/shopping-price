import json
import os
import shutil
from collections import defaultdict

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'public', 'data')
INPUT_FILE = os.path.join(DATA_DIR, 'all_retailers_products_merged_v1.jsonl')
OUTPUT_DIR = os.path.join(DATA_DIR, 'categories')
METADATA_FILE = os.path.join(DATA_DIR, 'categories_index.json')
HOME_DATA_FILE = os.path.join(DATA_DIR, 'home_products.json')

# Ensure output directory exists
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
os.makedirs(OUTPUT_DIR)

# Category Slug Map (Frontend Slug -> List of Raw Data Categories or Keywords)
# We map Raw Data Categories to these Slugs.
RAW_TO_SLUG = {
    "อาหารสดและแช่แข็ง": "fresh-frozen",
    "ผักและผลไม้": "vegetables-fruits",
    "เบเกอรี่": "bakery",
    
    "อาหารแห้งและเครื่องปรุง": "dry-food-condiments",
    "เครื่องดื่ม": "beverages",
    "ขนมขบเคี้ยว": "snacks",
    
    "ของใช้ในบ้าน": "household",
    "เครื่องเขียนและอุปกรณ์สำนักงาน": "office-supplies",
    "อุปกรณ์สำนักงาน": "office-supplies",
    "เครื่องเขียน": "stationery",
    "เฟอร์นิเจอร์": "furniture",
    
    "สุขภาพและความงาม": "health-beauty",
    "ของใช้ส่วนตัว": "health-beauty",
    "เสื้อผ้าและเครื่องแต่งกาย": "clothing",
    
    "แม่และเด็ก": "mom-baby",
    
    "เครื่องใช้ไฟฟ้า": "electronics",
    
    "เครื่องมือช่างและอุปกรณ์ปรับปรุงบ้าน": "tools",
    "ยานยนต์": "tools", # Grouping Automotive under Tools? Or separate? Let's put in tools for now or valid slug.
    "ยางรถยนต์": "tires",
    
    "สัตว์เลี้ยง": "pets"
}

def get_slug(category_name):
    clean = category_name.strip()
    return RAW_TO_SLUG.get(clean, "others")

def clean_data(data):
    """
    Recursively replace float('nan') with None so it becomes null in JSON.
    Standard JSON does not support NaN.
    """
    import math
    if isinstance(data, list):
        return [clean_data(item) for item in data]
    elif isinstance(data, dict):
        return {k: clean_data(v) for k, v in data.items()}
    elif isinstance(data, float) and math.isnan(data):
        return None
    else:
        return data

def main():
    print(f"Reading from {INPUT_FILE}...")
    
    slug_buckets = defaultdict(list)
    all_products = []
    
    # 1. Read and distribute to buckets by SLUG
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                p = json.loads(line)
                raw_cat = p.get('category', 'อื่นๆ').strip()
                if not raw_cat: raw_cat = 'อื่นๆ'
                
                slug = get_slug(raw_cat)
                
                # Sanitize NaN
                p = clean_data(p)
                
                slug_buckets[slug].append(p)
                all_products.append(p)
            except json.JSONDecodeError:
                continue

    # 2. Write Category Files (Slug based)
    category_index = []
    
    print(f"Found {len(slug_buckets)} slugs.")
    
    for slug, products in slug_buckets.items():
        filename = f"{slug}.json"
        out_path = os.path.join(OUTPUT_DIR, filename)
        
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
            
        category_index.append({
            "name": slug, # Using slug as name in index for now, or we could list raw cats
            "slug": slug,
            "count": len(products),
            "file": f"data/categories/{filename}"
        })
        print(f"  - [{slug}]: {len(products)} products -> {filename}")

    # 3. Write Index File
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(category_index, f, ensure_ascii=False, indent=2)

    # 4. Generate Home Page Data (Random/Popular Subset) & Mixed Data for Categories Page
    import random
    if all_products:
        # Filter only products with images for Home/Mixed to look good
        valid_products = [p for p in all_products if p.get('image')]
        
        # If we have enough valid products, use them. Otherwise fallback to mixed.
        source_pool = valid_products if len(valid_products) > 2000 else all_products
        
        shuffled = list(source_pool)
        random.shuffle(shuffled)
        
        # Home Page: Small, fast load (60 items)
        home_data = {
            "recommended": shuffled[:20],
            "popular": shuffled[20:40],
            "promo": shuffled[40:60]
        }
        
        # Categories Page "All": Medium load (2000 items) for better browsing experience
        # 60 was too few, but 72k is too slow. 2000 is a good balance (~1MB).
        mixed_data = shuffled[:2000]
        
        with open(HOME_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(home_data, f, ensure_ascii=False, indent=2)
            
        mixed_path = os.path.join(OUTPUT_DIR, "mixed_products.json")
        with open(mixed_path, 'w', encoding='utf-8') as f:
            json.dump(mixed_data, f, ensure_ascii=False, indent=2)
            
    # 5. Generate Lite Dataset for Search (All Items, Minimal Fields)
    # Fields: name, price, image, category (slug)
    # Compression: Replace common URL prefix
    PREFIX = "https://st.bigc-cs.com/cdn-cgi/image/format=webp,quality=85/public/media/catalog/product/"
    
    lite_data = []
    for p in all_products:
        raw_cat = p.get('category', 'อื่นๆ').strip()
        if not raw_cat: raw_cat = 'อื่นๆ'
        slug = get_slug(raw_cat)
        
        img = p.get("image", "")
        if img and img.startswith(PREFIX):
            img = img.replace(PREFIX, "{|}") # Use {|} as placeholder
            
        lite_data.append({
            "n": p.get("name"),
            "p": p.get("price"),
            "i": img, 
            "c": slug,
            "r": p.get("store") or p.get("retailer") 
        })
    
    lite_path = os.path.join(OUTPUT_DIR, "all_products_lite.json")
    with open(lite_path, 'w', encoding='utf-8') as f:
        # Use compact separators to save space
        json.dump(lite_data, f, ensure_ascii=False, separators=(',', ':'))

    print("\nProcessing Complete!")
    print(f"Total Products: {len(all_products)}")
    print(f"Categories Index: {METADATA_FILE}")
    print(f"Home Data: {HOME_DATA_FILE}")
    print(f"Mixed Data: {os.path.join(OUTPUT_DIR, 'mixed_products.json')}")
    print(f"Lite Search Data: {lite_path}")

if __name__ == "__main__":
    main()
