from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time, json, os

# ======================
# CONFIG
# ======================
URLS = [
    "https://www.makro.pro/c/dry-grocery",
    # ใส่เพิ่มได้เรื่อย ๆ
    # "https://www.makro.pro/c/collections/....",
]

CATEGORY = "อาหารและเครื่องปรุง"
OUTPUT_FILE = "makro_dry-grocery.json"

SCROLL_STEP = 500
SCROLL_DELAY = 0.25
WAIT_AFTER_CLICK = 1.0
MAX_SCROLL_FIND_BTN = 30

# ======================
# Selenium setup
# ======================
options = Options()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-blink-features=AutomationControlled")

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)

wait = WebDriverWait(driver, 20)

# ======================
# LOAD OLD DATA
# ======================
products = []
seen_keys = set()

if os.path.exists(OUTPUT_FILE):
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            products = json.load(f)
            for p in products:
                seen_keys.add(f"{p['name']}|{p['image']}")
    except:
        pass

print(f"📦 โหลดข้อมูลเก่า {len(products)} รายการ")

# ======================
# HELPERS (ฟังก์ชันเดิม)
# ======================
def slow_scroll():
    height = driver.execute_script("return document.body.scrollHeight")
    y = 0
    while y < height:
        driver.execute_script(f"window.scrollTo(0, {y});")
        time.sleep(SCROLL_DELAY)
        y += SCROLL_STEP

def wait_for_price(card, timeout=3.5):
    end = time.time() + timeout
    while time.time() < end:
        price = extract_price(card)
        if price:
            return price
        time.sleep(0.25)
    return ""

def extract_price(card):
    prices = []

    try:
        box = card.find_element(By.CSS_SELECTOR, "div[data-test-id$='_discount_price']")
        parts = box.find_elements(By.TAG_NAME, "p")
        txt = "".join(p.text.strip() for p in parts).replace("฿", "").strip()
        prices.append(float(txt))
    except:
        pass

    try:
        box = card.find_element(By.CSS_SELECTOR, "div[data-test-id$='_original_price']")
        txt = box.text.replace("฿", "").strip()
        prices.append(float(txt))
    except:
        pass

    if not prices:
        return ""

    return f"{min(prices):.2f}"

def get_name_from_card(card):
    try:
        return card.find_element(
            By.CSS_SELECTOR,
            "div[data-test-id$='_title'] span"
        ).text.strip()
    except:
        return ""

def scrape_page():
    slow_scroll()

    cards = driver.find_elements(By.CSS_SELECTOR, "div[data-productid]")
    print(f"🧾 พบสินค้า {len(cards)} รายการ")

    new_items = []

    for c in cards:
        try:
            name = get_name_from_card(c)
            img_el = c.find_elements(By.TAG_NAME, "img")
            image = img_el[0].get_attribute("src") if img_el else ""

            if not name or not image:
                continue

            # ⚡ INSTANT MODE (เร็ว)
            price = extract_price(c)
            if not price:
                continue

            key = f"{name}|{image}"
            if key in seen_keys:
                continue

            seen_keys.add(key)
            new_items.append({
                "name": name,
                "price": price,
                "image": image,
                "category": CATEGORY
            })
        except:
            continue

    return new_items

def find_next_button():
    for _ in range(MAX_SCROLL_FIND_BTN):
        try:
            btn = driver.find_element(
                By.CSS_SELECTOR,
                "button[data-test-id='cypress-component-test-paginationNextButton']"
            )
            if btn.is_enabled():
                return btn
        except:
            pass
        driver.execute_script("window.scrollBy(0, 400);")
        time.sleep(0.25)
    return None

def click_next_button(btn):
    try:
        driver.execute_script("arguments[0].click();", btn)
        return True
    except:
        return False

# ======================
# MAIN LOOP (หลายลิงก์)
# ======================
for idx, url in enumerate(URLS, start=1):
    print(f"\n🚀 [{idx}/{len(URLS)}] เปิด {url}")
    driver.get(url)

    wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(1)

    page = 1
    while True:
        print(f"📄 หน้า {page}")

        before = len(seen_keys)
        items = scrape_page()
        products.extend(items)
        print(f"➕ ได้ใหม่ {len(items)}")

        if len(seen_keys) == before:
            print("🛑 ไม่มีสินค้าใหม่แล้ว")
            break

        next_btn = find_next_button()
        if not next_btn or not click_next_button(next_btn):
            break

        time.sleep(WAIT_AFTER_CLICK)
        page += 1

# ======================
# SAVE
# ======================
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=4)

print(f"\n💾 บันทึกแล้ว → {OUTPUT_FILE}")
print(f"🎉 รวมทั้งหมด {len(products)} รายการ")

driver.quit()
