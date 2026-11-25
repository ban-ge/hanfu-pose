"""Prepare and apply visually reviewed catalog decisions in batches."""
import argparse
import fcntl
import hashlib
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAT = Path("data/catalog.json")
CLOTH = Path("output/tv-palette-replacement")
STYLE = Path("output/tv-style-review")
AUDIT = Path("output/tv-palette-audit")
ANGLES = ("front", "diag", "side", "back")
REPORTS = [AUDIT/"report.py", STYLE/"report.py", STYLE/"batch_queue.py"]
PRODUCTS = [AUDIT/"index.html", AUDIT/"audit.json", STYLE/"index.html", STYLE/"audit.json", STYLE/"batch-queue.html"]


def require(ok, message):
    if not ok:
        raise ValueError(message)


def read(path):
    return json.loads(path.read_text())


def encoded(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode()


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def group(item):
    return CLOTH if item["kind"] in ("costume", "inner") else STYLE


def files(item):
    return {key: Path(value) for key, value in {"sheet": item["image"], **item["view_files"]}.items()}


def signature(item):
    return {k: digest(p) for k, p in files(item).items()}


def peers(item, items):
    family = item.get("costume_family") or item.get("head_type") or item.get("pose_category")
    return [k for k, v in items.items() if k != item["id"] and v["kind"] == item["kind"]
            and v["era"] == item["era"] and v["gender"] in (item["gender"], "通用")
            and family == (v.get("costume_family") or v.get("head_type") or v.get("pose_category"))]


def prepare(args, items):
    tasks = read(CLOTH/"tasks.json") | read(STYLE/"tasks.json")
    ids = args.ids or [k for k in items if tasks[k]["state"] == "pending"]
    exact = defaultdict(list)
    fingerprints = {}
    for k, item in items.items():
        sig = signature(item)
        fingerprints[k] = sig
        exact[tuple(sig[a] for a in ANGLES)].append(k)
    rows = []
    for k in ids:
        i = items[k]
        same = [v for v in exact[tuple(fingerprints[k][a] for a in ANGLES)] if v != k and items[v]["era"] == i["era"]]
        candidates = peers(i, items)
        rows.append(dict(id=k, action="skip", hashes=fingerprints[k], views=i["view_files"],
                         identical_views=same, candidate_hashes={v:fingerprints[v] for v in set(candidates + same)},
                         candidates=candidates, compare_with=[], target="", reason="",
                         color="", structure="", presentation="", four_views="", duplicate_review="",
                         references=tasks[k].get("comparisons", []),
                         selected=(tasks[k].get("selected_reference") or {}).get("id", ""),
                         inference="", reference_search=[],
                         no_body=None, no_footwear=None, footwear_reference="", footwear_observation="",
                         edited_hashes={v:digest(args.staged/p) for v,p in files(i).items()}
                         if args.staged and all((args.staged/p).is_file() for p in files(i).values()) else {}))
    with args.plan.open("x") as stream:
        stream.write(encoded(rows).decode())
    print(f"{len(rows)} 组审核模板 → {args.plan}")


def apply(args, catalog, items):
    rows = [r for r in read(args.plan) if r["action"] != "skip"]
    ids = {r["id"] for r in rows}
    require(len(ids) == len(rows), "一组出现多次")
    removed = {r["id"] for r in rows if r["action"] in ("merge", "delete")}
    metadata, changes, redirects = {}, {}, {}

    def document(path):
        if path not in metadata:
            metadata[path] = read(path)
        return metadata[path]

    counts = Counter(p for i in items.values() for p in files(i).values())
    for row in rows:
        k, action = row["id"], row["action"]
        require(action in ("retain", "replace", "merge", "delete", "reopen"), f"{k} 未知操作")
        i = items[k]
        paths = files(i)
        require(all(p.resolve().is_relative_to((ROOT/"assets").resolve()) for p in paths.values()), k)
        require(row["hashes"] == signature(i), f"{k} 图片已变更，需重新审核")
        folder = group(i)
        tasks = document(folder/"tasks.json")
        task = tasks[k]
        reason = row["reason"].strip()
        require(reason, f"{k} 缺少结论")
        decisions = document(AUDIT/"decisions.json")["items"] if folder == CLOTH else {}
        if action == "reopen":
            task.setdefault("previous_review",dict(state=task.get("state"),note=task.get("review_note")))
            task.update(state="pending", visual_review="needs_review", source_gap=reason)
            i["review"] = reason
            if folder == STYLE and "screen_style_review" in i:
                i["screen_style_review"]["result"] = "pending"
            decisions[k] = dict(state="pending", reason=reason)
            continue
        require(row["structure"].strip() and row["duplicate_review"].strip() and row["four_views"].strip(),
                f"{k} 缺少形制、四视图或去重结论")
        require(all(v in items and v != k for v in row["compare_with"]), f"{k} 对照编号无效")
        require(row["compare_with"] or not peers(i, items), f"{k} 需记录同类已比款")
        checks = {key: row[key] for key in ("structure", "four_views", "duplicate_review", "compare_with")}
        baseline = document(folder/"baseline-hashes.json")
        if action in ("merge", "delete"):
            target = row["target"]
            if action == "merge":
                require(target in row["compare_with"] and target not in removed, f"{k} 合并目标无效")
                require(row.get("candidate_hashes", {}).get(target) == signature(items[target]),
                        f"{k} 需核对保留款 {target} 的当前四视图及源图哈希")
                dest = items[target]
                same_age = dest.get("age") == i.get("age") or (
                    i["kind"] in ("costume", "inner") and row.get("verified_age") == "成年"
                    and {dest.get("age"), i.get("age")} == {None, "成年"})
                require(same_age and all(dest.get(key) == i.get(key) for key in ("kind", "head_type")) and
                        dest["gender"] in (i["gender"], "通用") and dest["era"] in (i["era"], "通用"),
                        f"{k} 类型、版型或朝代不兼容")
                if dest["era"] == "通用" and dest.get("applicable_eras") and i["era"] != "通用":
                    if i["era"] not in dest["applicable_eras"]:
                        require(row.get("era_review", "").strip(), f"{k} 缺少通用款适用时期比较")
                        dest["applicable_eras"].append(i["era"])
                if "seasons" in i or "season" in i:
                    seasons = set(dest.get("seasons") or [dest.get("season")]) | set(i.get("seasons") or [i.get("season")])
                    dest["seasons"] = [s for s in "春夏秋冬" if s in seasons]
            else:
                require(not target, f"{k} 删除项不能同时指定替代款")
            redirects[k] = target
            deleted = []
            asset_dir = Path("assets") / i["kind"]
            owned = set(paths.values())
            for entry in asset_dir.glob(k + "*"):
                if not re.fullmatch(re.escape(k) + r"(?:[-_][\w-]+)?", entry.stem):
                    continue
                if entry.is_dir() and not entry.is_symlink():
                    owned.update(entry.glob("*.png"))
                elif entry.suffix == ".png":
                    owned.add(entry)
            for p in sorted(owned):
                if counts[p] <= (1 if p in paths.values() else 0):
                    require(p.resolve().is_relative_to((ROOT/"assets").resolve()), str(p))
                    changes[p] = None
                    deleted.append(str(p))
                    baseline.pop(str(p), None)
            document(folder/"dedup-decisions.json").append(dict(removed=k, retained=target or None,
                        reason=reason, deleted_files=deleted, **checks))
            tasks.pop(k)
            decisions[k] = dict(state="merged" if target else "deleted", replacement=target, reason=reason)
            continue
        refs = row["references"]
        inference = row.get("inference", "").strip()
        search = row.get("reference_search", [])
        if len({r["show"] for r in refs}) < 2:
            require(isinstance(search, list) and all(isinstance(entry, dict) and
                    all(isinstance(entry.get(key), str) and entry[key].strip()
                        for key in ("show", "query", "finding")) for entry in search)
                    and len({e["show"].strip() for e in search} | {r["show"] for r in refs}) >= 2,
                    f"{k} 需记录同期剧目的实际查找与结果，合计至少两部")
        require((inference or len({r["show"] for r in refs}) >= 2) and len({r["id"] for r in refs}) == len(refs)
                and all(r["visually_reviewed"] and r["observation"].strip() and r["page"].startswith(("https://","http://"))
                        and Path(r["path"]).is_file() for r in refs), f"{k} 缺少目视剧照证据")
        selected = next((r for r in refs if r["id"] == row["selected"]), None)
        require((selected or (inference and not refs and not row["selected"])) and row["color"].strip() and row["presentation"].strip(), f"{k} 缺少配色或展示结论")
        if folder == CLOTH:
            require(row.get("no_body") is True, f"{k} 需逐角排除人身")
            if row.get("footwear_reference"):
                require(row["footwear_reference"] in {r["id"] for r in refs}, f"{k} 鞋履对照引用无效")
        if action == "replace":
            require(len({row["edited_hashes"][a] for a in ANGLES}) == 4, f"{k} 四角图存在完全相同文件")
            require(row["edited_hashes"] != row["hashes"], f"{k} 替换稿没有变化")
            require(args.staged, "缺少 --staged 素材目录")
            for key, path in paths.items():
                src = args.staged/path
                require(counts[path] == 1 and src.is_file() and digest(src) == row["edited_hashes"][key],
                        f"{k} 待入库图与验收版本不符")
                data = src.read_bytes()
                require(data.startswith(b"\x89PNG\r\n\x1a\n") and data[12:16] == b"IHDR"
                        and min(struct.unpack(">II",data[16:24])) >= 300
                        and data.endswith(b"IEND\xaeB\x60\x82"), f"{k} {key} PNG 无效")
                changes[path] = data
                baseline[str(path)] = digest(src)
            if row.get("crop"):
                i["crop"] = row["crop"]
        evidence = dict(checks, color=row["color"], presentation=row["presentation"],
                        no_body=row.get("no_body"), no_footwear=row.get("no_footwear"))
        if folder == CLOTH:
            evidence.update({key: row[key] for key in ("footwear_reference", "footwear_observation") if row.get(key)})
        if search:
            evidence["reference_search"] = search
        if inference:
            evidence["inference"] = inference
            reason += "（创作推定：" + inference + "）"
        state = "applied" if action == "replace" else "retained"
        task.update(state=state, visual_review="passed", comparisons=refs, selected_reference=selected,
                    palette=row["color"], finding=row["structure"], adjustment=reason, review_note=reason,
                    acceptance=evidence, after_hashes={str(p): baseline[str(p)] if action=="replace"
                                                       else digest(p) for p in paths.values()})
        task.pop("source_gap", None)
        i["review"] = reason
        if folder == CLOTH:
            i["palette_comparisons"] = refs
            if selected:
                i["visual_reference"] = dict(show=selected["show"], source_url=selected["page"],
                     source_image_id=selected["id"], scope=row["color"], record=str(folder/"tasks.json"))
            else:
                i.pop("visual_reference", None)
            decisions[k] = dict(state="verified", result=action, comparisons=refs, selected_reference=selected, reason=reason)
        else:
            i["screen_style_review"] = dict(result=state, comparisons=refs, selected=selected["id"] if selected else None,
                                            finding=row["structure"], adjustment=reason, record=str(folder/"tasks.json"))
    if redirects:
        for path in Path("data").glob("*-role-outfits.json"):
            for role in document(path):
                for field in ("costume", "inner", "head"):
                    role[field] = list(dict.fromkeys(v for old in role[field] if (v := redirects.get(old, old))))
                for old, target in redirects.items():
                    if old in re.findall(r"[CIHP]\d{3,}", role.get("note","")):
                        role["note"] = re.sub(rf"{old}(?!\d)", target or "已移除款", role["note"])
    catalog["items"] = [i for i in items.values() if i["id"] not in removed]
    metadata[CAT] = catalog
    for path,value in metadata.items():
        if read(path) != value:
            changes[path] = encoded(value)
    print(dict(Counter(r["action"] for r in rows)), f"{len(changes)} 个文件有变更", flush=True)
    if args.command == "apply" and changes:
        commit(changes)


JOURNAL = Path("output/.review-batch-transaction")


def recover():
    if not JOURNAL.exists():
        return
    manifest = JOURNAL/"restore.json"
    if manifest.exists():
        for name, existed in read(manifest).items():
            path = Path(name)
            if existed:
                shutil.copy2(JOURNAL/path, path)
            else:
                path.unlink(missing_ok=True)
    shutil.rmtree(JOURNAL)


def commit(changes):
    JOURNAL.mkdir()
    touched = list(dict.fromkeys([*changes, *PRODUCTS]))
    try:
        restore = {}
        for path in touched:
            restore[str(path)] = path.exists()
            if path.exists():
                (JOURNAL/path).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, JOURNAL/path)
        manifest = JOURNAL/"restore.json"
        staging = JOURNAL/"next"
        staging.write_bytes(encoded(restore))
        os.replace(staging, manifest)
        for path, data in changes.items():
            if data is None:
                path.unlink()
            else:
                staging.write_bytes(data)
                os.replace(staging, path)
        for script in [Path("tools/verify.py"), Path("tools/verify_coverage.py"), *REPORTS]:
            subprocess.run([sys.executable, str(script)], check=True, stdout=subprocess.DEVNULL)
        manifest.unlink()
    except BaseException:
        recover()
        raise
    shutil.rmtree(JOURNAL)
    for path, data in changes.items():
        if data is None and path.parent.is_dir() and not any(path.parent.iterdir()):
            path.parent.rmdir()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["prepare","check","apply"])
    parser.add_argument("plan",type=Path)
    parser.add_argument("--ids",nargs="+")
    parser.add_argument("--staged",type=Path)
    args=parser.parse_args()
    os.chdir(ROOT)
    lock_name = "hanfu-review-" + hashlib.sha256(str(ROOT).encode()).hexdigest()[:16]
    with (Path(tempfile.gettempdir())/lock_name).open("a") as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        recover()
        catalog=read(CAT)
        items={i["id"]:i for i in catalog["items"]}
        if args.command=="prepare":
            prepare(args,items)
        else:
            apply(args,catalog,items)


if __name__=="__main__":
    main()
