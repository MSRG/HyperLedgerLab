from bs4 import BeautifulSoup


def parse_caliper_report(filename="fabric-test-network-extended/caliper/report.html"):
    with open(filename) as f:
        soup = BeautifulSoup(f, "html.parser")
    table = soup.find(id="benchmarksummary").table

    headers = [header.text for header in table.find_all("th")]
    contents = [
        {headers[i]: cell.text for i, cell in enumerate(row.find_all("td"))}
        for row in table.find_all("tr")
    ]
    # will return dict with table contents
    # TODO adjust this if necessary for your use case
    return contents[2:]  # skip header 0 and initial result
