import sys, asyncio
from playwright.async_api import async_playwright

times = [float(x) for x in sys.argv[1].split(',')]
out = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/shots'
import os; os.makedirs(out, exist_ok=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 1952, 'height': 1112})
        logs = []
        pg.on('console', lambda m: logs.append(m.text) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
        await pg.goto('file:///home/claude/sparrow-film/preview/sparrow-film.html')
        await pg.add_style_tag(content='.__remotion-player *[style*="linear-gradient"]{display:none!important}')
        await pg.wait_for_function('!!(window.__player && window.__player.seekTo)', timeout=15000)
        await pg.wait_for_timeout(1200)
        for t in times:
            await pg.evaluate(f'window.__player.seekTo({round(t*60)})')
            await pg.wait_for_timeout(500)
            el = await pg.query_selector('.wrap')
            await el.screenshot(path=f'{out}/t{t:05.2f}.png')
        for l in logs[:15]: print(l)
        await b.close()
asyncio.run(main())
