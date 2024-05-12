import requests
from bs4 import BeautifulSoup
import re
from collections import defaultdict

# List of major retailers
major_retailers = ['amazon.com', 'bestbuy.com', 'walmart.com', 'target.com', 'apple.com']

# Function to get Trustpilot score for a domain
def get_trustpilot_score(domain):
    trustpilot_url = f'https://www.trustpilot.com/review/{domain}'
    response = requests.get(trustpilot_url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        rating_element = soup.select_one('.multi-size-rating-summary')
        if rating_element:
            rating_text = rating_element.get_text(strip=True)
            match = re.search(r'(\d+\.\d+)', rating_text)
            if match:
                return float(match.group(1))
    return None

# Function to scrape coupons and discounts for a product
def scrape_coupons(product_name):
    coupons = defaultdict(list)
    search_query = f'{product_name} coupons'

    for url in [f'https://www.google.com/search?q={search_query}', f'https://www.bing.com/search?q={search_query}']:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        for link in soup.select('a'):
            href = link.get('href')
            if href.startswith('/url?q='):
                url = href.split('?q=')[1].split('&')[0]
                if any(retailer in url for retailer in major_retailers):
                    coupons[url].append(10)  # High trust score for major retailers
                else:
                    domain = url.split('/')[2]
                    trustpilot_score = get_trustpilot_score(domain)
                    if trustpilot_score:
                        coupons[url].append(trustpilot_score)
                    else:
                        coupons[url].append(5)  # Default trust score for unknown sites

    return coupons

# Example usage
product_name = 'iphone 15 256GB'
coupons = scrape_coupons(product_name)

# Sort coupons by trust score and print
sorted_coupons = sorted(coupons.items(), key=lambda x: sum(x[1]) / len(x[1]), reverse=True)
for url, trust_scores in sorted_coupons:
    print(f'URL: {url}, Average Trust Score: {sum(trust_scores) / len(trust_scores)}')
