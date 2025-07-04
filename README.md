# bird_scorebot
This repository contans scripts in which I expanded the American Birding Assocation's rankings from around 2,000 species in just North Amercia to 11,000 globally and then made a discord bot to add and keep track of people's scores for a birding league.

---

## Step 1 Expand Rankings

### `species_rank_by_continent.py`

**Purpose:**  
Fetches yearly eBird observations using ebird's API (https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest) for thousands of bird species across multiple continents, then ranks each species from 1–6 per continent based on how often it was observed.

**Details:**
- Uses the `/historic/{y}/{m}/{d}` eBird API endpoint to get species seen weekly across the entire year (2023).
- Aggregates data for each continent using **5 representative countries** to ensure balanced sampling.
- Ranks each species by how many weeks it was observed:
  - **1** = very common (≥40 weeks/year)
  - **2** = fairly common (≥20 weeks)
  - **3** = rare but regular (≥6 weeks)
  - **4** = casual (≥3 weeks)
  - **5** = accidental (≥1 week)
  - **6** = extinct or not recorded (0 weeks)
- Outputs a CSV file:  

### `/Bird_league_database.ipynb`
- Some of the species for North America did not match the ABA checklist (https://www.aba.org/aba-checklist/) so this script corrects that using pandas.

- Bird_Rankings_NA.csv --> CSV from ABA checklist
- Bird_rankings_final.csv --> output with fixed rankings for North America


### Discord bot: 
javascripts are availaible under bird_scorebot_java_code
