import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

from scholarly import scholarly

snapshot_file = Path(__file__).resolve().parents[1] / '_data' / 'google_scholar.json'
scholar_id = os.environ.get('GOOGLE_SCHOLAR_ID') or json.loads(snapshot_file.read_text())['scholar_id']
logging.basicConfig(level=logging.INFO)
logging.info('Fetching public Scholar profile %s', scholar_id)
author: dict = scholarly.search_author_id(scholar_id)
scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])
if author.get('scholar_id') != scholar_id:
    raise ValueError('Scholar returned a different author')
if not isinstance(author.get('citedby'), int) or author['citedby'] < 0:
    raise ValueError('Scholar returned an invalid citation count')
author['updated'] = datetime.now(timezone.utc).isoformat()
author['publications'] = {v['author_pub_id']:v for v in author['publications']}
print(json.dumps(author, indent=2))
os.makedirs('results', exist_ok=True)
with open(f'results/gs_data.json', 'w') as outfile:
    json.dump(author, outfile, ensure_ascii=False)

shieldio_data = {
  "schemaVersion": 1,
  "label": "citations",
  "message": f"{author['citedby']}",
}
with open(f'results/gs_data_shieldsio.json', 'w') as outfile:
    json.dump(shieldio_data, outfile, ensure_ascii=False)
