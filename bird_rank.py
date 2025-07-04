#written by Ian Birchler De Allende 06/28/25
#uses 5 representative countries per continent
#loops weekly over the whole year (2024)
#for each week, aggregates observations across all 5 countries in the continent
#computes rarity ranks 1–6 by number of weeks seen in the year
#outputs a CSV with columns: Common Name + ranks for each continent

import requests
import pandas as pd
from tqdm import tqdm
from collections import Counter
from datetime import datetime, timedelta

API_KEY = "xxxxxx"  # blacked out API

# Representative countries per continent (ISO codes)
continent_regions = {
    "Africa": ["KE", "ZA", "NG", "EG", "TZ"],
    "Asia": ["IN", "CN", "JP", "TH", "ID"],
    "Europe": ["FR", "DE", "ES", "IT", "SE"],
    "North America": ["US", "CA", "MX", "GT", "CU"],
    "South America": ["BR", "AR", "CO", "PE", "CL"],
    "Oceania": ["AU", "NZ", "FJ", "PG", "NC"]
}

# Year to analyze
year = 2024

# Weekly thresholds for ranks
rank_thresholds = [
    (40, 1),  # ≥ 40 weeks seen → very common
    (20, 2),  # ≥ 20 weeks → fairly common
    (6, 3),   # ≥ 6 weeks → rare but regular
    (3, 4),   # ≥ 3 weeks → casual
    (1, 5),   # ≥ 1 week → accidental
    (0, 6)    # never seen → extinct / not found
]

def get_species_list():
    """
    Fetch global species list: returns list of (sciName, comName)
    """
    print("Fetching global species list...")
    url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json"
    headers = {"X-eBirdApiToken": API_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch species list: {response.status_code}")
        return []
    data = response.json()
    species_list = [(s['sciName'], s['comName']) for s in data if s['category'] == 'species']
    print(f"Fetched {len(species_list)} species.")
    return species_list

def get_species_seen_on_date(region_code, y, m, d):
    """
    Call /historic endpoint: returns set of sciNames seen on the given date in region.
    """
    url = f"https://api.ebird.org/v2/data/obs/{region_code}/historic/{y}/{m}/{d}"
    headers = {"X-eBirdApiToken": API_KEY}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Failed for {region_code} on {y}-{m}-{d}: {response.status_code}")
            return set()
        data = response.json()
        return set(obs['sciName'] for obs in data)
    except Exception as e:
        print(f"Error fetching data for {region_code} on {y}-{m}-{d}: {e}")
        return set()

def assign_rank(weeks_seen):
    """
    Assign rank 1–6 based on number of weeks seen in the year.
    """
    for threshold, rank in rank_thresholds:
        if weeks_seen >= threshold:
            return rank
    return 6

def main():
    species_list = get_species_list()
    if not species_list:
        print("No species list, exiting.")
        return

    continent_week_counts = {}

    for continent, regions in continent_regions.items():
        print(f"\nProcessing continent: {continent}")
        counter = Counter()

        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31)
        current_date = start_date
        week_num = 0

        while current_date <= end_date:
            week_num += 1
            y, m, d = current_date.year, current_date.month, current_date.day

            seen_species_this_week = set()
            # Aggregate species seen across all countries in the continent this week
            for region in regions:
                seen_species_this_week |= get_species_seen_on_date(region, y, m, d)

            # For each species seen this week, increment week count
            for sci_name in seen_species_this_week:
                counter[sci_name] += 1

            if week_num % 5 == 0:
                print(f"  Processed week {week_num} ({current_date.date()})")

            current_date += timedelta(weeks=1)

        print(f"Finished: {len(counter)} species seen at least once in {continent}.")
        continent_week_counts[continent] = counter

    # Build ranks per continent
    print("\nAssigning ranks per continent...")
    ranks_per_continent = {}
    for continent, week_counts in continent_week_counts.items():
        ranks = []
        for sci_name, _ in species_list:
            weeks_seen = week_counts.get(sci_name, 0)
            rank = assign_rank(weeks_seen)
            ranks.append(rank)
        ranks_per_continent[continent] = ranks

    # Build final DataFrame
    print("\nBuilding final CSV...")
    rows = []
    for i, (sci_name, com_name) in enumerate(tqdm(species_list, desc="Writing rows")):
        row = {"Common Name": com_name}
        for continent in continent_regions.keys():
            row[continent] = ranks_per_continent[continent][i]
        rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv("species_rarity_by_continent_yearly.csv", index=False)
    print("CSV created: species_rarity_by_continent_yearly.csv")

if __name__ == "__main__":
    main()
