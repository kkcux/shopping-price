from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time, json

URL = "https://www.lotuss.com/th/category/home-and-lifestyle?sort=relevance:DESC"

WAIT_SCROLL = 3
WAIT_DOM = 2
SCROLL_AMOUNT = 900

options = Options()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

print("🚀 เปิดเว็บ Lotus –  …")
driver.get(URL)
time.sleep(5)

products = []
seen = set()

def scroll_down():
    driver.execute_script(f"window.scrollBy(0, {SCROLL_AMOUNT});")
    time.sleep(WAIT_SCROLL)

def scrape_cards():
    time.sleep(WAIT_DOM)
    cards = driver.find_elements(By.CLASS_NAME, "product-grid-item")
    found = []

    for c in cards:
        try:
            name = ""
            price = ""
            image = ""

            try:
                name = c.find_element(By.CSS_SELECTOR, "p.MuiTypography-root").text.strip()
            except: pass

            try:
                price = c.find_element(By.CSS_SELECTOR, "div.mui-style-xthm7r").text.replace("฿", "").strip()
            except: pass

            try:
                image = c.find_element(By.TAG_NAME, "img").get_attribute("src")
            except: pass

            # เก็บเฉพาะสินค้าที่ name+price+image ครบ
            if name == "" or price == "" or image == "":
                continue
            if image in seen:
                continue

            seen.add(image)

            found.append({
                "name": name,
                "price": price,
                "image": image,
                "category": "ของใช้ในบ้าน"
            })
        except:
            continue

    return found


print("📌 เริ่ม scroll ดึงข้อมูลทั้งหมด...")

no_new_count = 0   # นับจำนวนรอบที่ไม่มีสินค้าเพิ่ม

while True:
    scroll_down()
    new_items = scrape_cards()

    if new_items:
        products.extend(new_items)
        print(f"   ➕ พบสินค้าใหม่ {len(new_items)} ชิ้น  | รวม {len(products)} ชิ้น")
        no_new_count = 0      # reset counter
    else:
        no_new_count += 1
        print(f"   ⚠ ไม่มีสินค้าใหม่ รอบที่ {no_new_count}")

    # ถ้าไม่มีสินค้าเพิ่ม 3 รอบ → หยุดเลย
    if no_new_count >= 3:
        print("⛔ ไม่มีสินค้าใหม่ 3 รอบติด → หยุดดึงข้อมูล")
        break

print("\n🎉 โหลดเสร็จ! รวมทั้งหมด:", len(products), "รายการ")

output_file = "lotus_home-and-lifestyle_full.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=4)

print("💾 บันทึกไฟล์แล้ว →", output_file)

driver.quit()
