import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup


def fetch_page(scholar_id, start=0):
    params = {'user': scholar_id, 'hl': 'en'}
    if start:
        params.update(cstart=start, pagesize=100)
    url = 'https://scholar.google.com/citations?' + urlencode(params)
    request = Request(url, headers={
        'User-Agent': 'Chenxu-Wu-Homepage/1.0 (+https://fouierl.github.io/chenxuwu.github.io/)',
    })
    with urlopen(request, timeout=30) as response:
        final = urlsplit(response.geturl())
        if final.hostname != 'scholar.google.com' or parse_qs(final.query).get('user') != [scholar_id]:
            raise ValueError('Scholar did not return the requested public author profile')
        return BeautifulSoup(response.read(), 'html.parser')


def count(text):
    digits = text.strip().replace(',', '')
    if not digits.isdecimal():
        raise ValueError(f'Invalid Scholar count: {text!r}')
    return int(digits)


def read_profile(scholar_id):
    page = fetch_page(scholar_id)
    name = page.select_one('#gsc_prf_in')
    if not name:
        raise ValueError('The public Scholar profile is unavailable')
    author = {'scholar_id': scholar_id, 'name': name.get_text(strip=True)}
    affiliation = page.select_one('#gsc_prf_inw ~ .gsc_prf_il, #gsc_prf_i > .gsc_prf_il')
    homepage = page.select_one('#gsc_prf_ivh a.gsc_prf_ila')
    if affiliation:
        author['affiliation'] = affiliation.get_text(strip=True)
    if homepage:
        author['homepage'] = homepage['href']
    fields = {'Citations': 'citedby', 'h-index': 'hindex', 'i10-index': 'i10index'}
    for row in page.select('#gsc_rsb_st tr'):
        cells = row.find_all('td', recursive=False)
        if len(cells) == 3:
            field = fields.get(cells[0].get_text(strip=True))
            if field:
                author[field] = count(cells[1].get_text())
                author[field + '5y'] = count(cells[2].get_text())
    if 'citedby' not in author:
        raise ValueError('Missing all-time citation total')
    years = page.select('.gsc_g_t')
    annual = page.select('.gsc_g_al')
    if years and len(years) == len(annual):
        author['cites_per_year'] = {y.get_text(strip=True): count(n.get_text()) for y, n in zip(years, annual)}

    publications = {}
    while True:
        table = page.select_one('#gsc_a_b')
        if table is None:
            raise ValueError('Missing Scholar publication list')
        for row in table.select('tr.gsc_a_tr'):
            link = row.select_one('a.gsc_a_at')
            cited = row.select_one('.gsc_a_c')
            if link is None or cited is None:
                raise ValueError('Incomplete Scholar publication row')
            pub_id = parse_qs(urlsplit(link['href']).query).get('citation_for_view', [''])[0]
            if not pub_id.startswith(scholar_id + ':') or pub_id in publications:
                raise ValueError('Unexpected author or repeated publication in the Scholar results')
            bib = {'title': link.get_text(strip=True)}
            year = row.select_one('.gsc_a_y')
            if year and year.get_text(strip=True):
                bib['pub_year'] = year.get_text(strip=True)
            citations = cited.get_text(strip=True)
            publications[pub_id] = {
                'author_pub_id': pub_id,
                'bib': bib,
                'num_citations': count(citations.rstrip('*')) if citations else 0,
            }
        more = page.select_one('#gsc_bpf_more')
        if more is None or more.has_attr('disabled'):
            break
        if not table.select_one('tr.gsc_a_tr'):
            raise ValueError('Scholar pagination did not advance')
        page = fetch_page(scholar_id, len(publications))
    if author['citedby'] and not publications:
        raise ValueError('Missing publications for a cited author')
    author['publications'] = publications
    author['updated'] = datetime.now(timezone.utc).isoformat()
    return author


def main():
    snapshot = Path(__file__).resolve().parents[1] / '_data' / 'google_scholar.json'
    scholar_id = os.environ.get('GOOGLE_SCHOLAR_ID') or json.loads(snapshot.read_text())['scholar_id']
    author = read_profile(scholar_id)
    badge = {'schemaVersion': 1, 'label': 'citations', 'message': str(author['citedby'])}
    output = Path('results')
    output.mkdir(exist_ok=True)
    for filename, data in [('gs_data.json', author), ('gs_data_shieldsio.json', badge)]:
        (output / filename).write_text(json.dumps(data, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f"{author['name']}: {author['citedby']} citations, {len(author['publications'])} publications")


if __name__ == '__main__':
    main()
