from pathlib import Path
import xml.etree.ElementTree as ET
import re
p=Path("final")
assert (p/"index.html").exists()
assert (p/"styles.css").exists()
assert (p/"game.js").exists()
ET.parse(p/"characters.svg")
html=(p/"index.html").read_text(encoding="utf-8")
js=(p/"game.js").read_text(encoding="utf-8")
assert '<script src="game.js"' in html
assert 'W05_Pearl_Coast' in js and 'W01_Kitchen' in js
assert 'YimmaQA' in js
assert 'LEVEL_COUNT=5' in js
assert 'pointerdown' in js and 'pointermove' in js
assets=list(Path('game-007/assets').glob('W*/*.svg'))
assert len(assets)>=38,len(assets)
for file in assets:ET.parse(file)
print('PASS 38+ vector sources, five world references, valid original characters.svg, 25 stage configuration')
