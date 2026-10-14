"""把 web/restaurant/src/*.md 轉成官網頁面 web/restaurant/*.html。

修改說明內容時：編輯 src 裡的 .md，再執行
    python3 tools/build_restaurant_docs.py
需要 Python 套件 markdown（pip install markdown）。
"""
import html
import pathlib
import re

import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent / "web" / "restaurant"
PAGES = [
    ("checklist", "店家上線檢查清單", "到店安裝時照順序打勾：資料準備、開通、菜單與桌卡、平板配對、試跑、教學交接。"),
    ("guide", "老闆操作說明", "從第一次設定、每天開店、營業中、結帳到打烊日結，加上常見問題。"),
]

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}｜NEXELINK 點餐系統</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="docs.css">
</head>
<body>
<header class="top">
  <a class="brand" href="/web/index.html">Nexelink</a>
  <nav class="crumbs" aria-label="導覽"><a href="index.html">點餐系統說明</a><span>›</span><span>{title}</span></nav>
</header>
<div class="layout">
  <aside class="toc" aria-label="目錄">
    <div class="toc__title">目錄</div>
    <ol>{toc}</ol>
    {progress}
    <button type="button" class="print" onclick="window.print()">列印這份{kind}</button>
  </aside>
  <main class="doc" id="doc">
    {body}
    <p class="updated">最後更新：{updated}</p>
  </main>
</div>
<footer class="foot">© NEXELINK 數位創新團隊 ｜ <a href="mailto:contact@nexelink.tw">contact@nexelink.tw</a></footer>
<script src="docs.js"></script>
</body>
</html>
"""

UPDATED = "2026-10-14"


def slug(i):
    return f"s{i}"


def build(name, title, desc):
    src = (ROOT / "src" / f"{name}.md").read_text(encoding="utf-8")
    src = re.sub(r"^# .*\n", "", src, count=1)  # 標題由版型輸出
    body = markdown.markdown(src, extensions=["tables"], output_format="html5")
    # 每個 h2 加錨點，並做目錄
    toc, n = [], 0

    def h2(m):
        nonlocal n
        n += 1
        toc.append(f'<li><a href="#{slug(n)}">{m.group(1)}</a></li>')
        return f'<h2 id="{slug(n)}">{m.group(1)}</h2>'
    body = re.sub(r"<h2>(.*?)</h2>", h2, body)
    # - [ ] 轉成可勾選的項目（勾選狀態存在這台裝置）
    count = 0

    def task(m):
        nonlocal count
        count += 1
        return f'<li class="task"><label><input type="checkbox" data-key="{name}-{count}"><span>{m.group(1)}</span></label></li>'
    body = re.sub(r"<li>\[ \] (.*?)</li>", task, body, flags=re.S)
    body = re.sub(r"<ul>(\s*<li class=\"task\">)", r'<ul class="tasks">\1', body)
    body = body.replace("<table>", '<div class="table"><table>').replace("</table>", "</table></div>")
    lead_title = f'<h1>{html.escape(title)}</h1>'
    progress = ('<div class="progress" aria-live="polite"><div class="progress__bar"><span id="bar"></span></div>'
                '<div id="progress-text">已完成 0 項</div><button type="button" class="reset" id="reset">清除勾選</button></div>'
                ) if count else ""
    out = TEMPLATE.format(title=html.escape(title), desc=html.escape(desc), toc="".join(toc), body=lead_title + body,
                          progress=progress, kind="清單" if name == "checklist" else "說明", updated=UPDATED)
    (ROOT / f"{name}.html").write_text(out, encoding="utf-8")
    return count


if __name__ == "__main__":
    for name, title, desc in PAGES:
        print(name, "勾選項目", build(name, title, desc))
