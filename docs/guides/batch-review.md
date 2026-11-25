# 批量视觉验收

供维护者使用。运行前请在本地准备本批审核所需的研究记录与暂存图片。

存量复核和新增素材统一按[剧照对照与去重规则](dynasty-reference-workflow.md#存量复核与新增素材共用规则)执行。每款查找至少两部同期剧目并核对可比镜头、整套装扮与四视图、同朝各季；本批直接改图、合并或删除已确认的重复及多余素材，补齐已有素材无法覆盖的代表性缺项，再验证四视图、引用与角色覆盖。缺少直接参考时按最可信方案当批处理并结案，在 `inference` 中写明推定部位与依据；可比剧照不足两部时，在 `reference_search` 逐条填写实际查找的剧名 `show`、检索内容 `query` 和结果 `finding`。无剧照时 `references` 留空数组、`selected` 留空字符串。四视图、去重与素材验收照常执行。

使用项目根目录中的批处理入口。以下命令中的清单和暂存目录由本次审核指定：

```sh
pnpm review:batch prepare review.json --ids C047 C321 --staged /tmp/hanfu-stage
pnpm review:batch check review.json --staged /tmp/hanfu-stage
pnpm review:batch apply review.json --staged /tmp/hanfu-stage
```

省略 `--ids` 会生成全库待审清单。模板列出同类候选、四角文件完全相同的编号、四视图路径和已有剧照。目检后填写 `color`、`structure`、`presentation`、`four_views`、`compare_with`、`duplicate_review` 和 `reason`，在 `references` 中记录剧名、来源页、本地图片、所见细节及 `visually_reviewed`，用 `selected` 指定采用的剧照编号。服饰逐角确认后填写 `no_body`。鞋履字段可留空；素材和现有剧照都能看清鞋履时顺带比对，可记录参考编号与观察。其余情况跳过，无需另找鞋履资料或重开旧记录。待办（全库逐款核查结束后）：跨朝代比较同角色的同用途衣型，合并前核对各时期适用性并迁移角色引用。遮挡部位及创作延展写入结论。

同一清单可混用 `retain`（保留）、`replace`（替换）、`merge`（合并到 `target`）、`delete`（删除多余款）、`reopen`（保留图片、重开复核）。`skip` 留待后续。替换稿按图库原相对路径放入暂存目录，生成模板时自动记录整图与四个独立裁图的 SHA-256；裁切变化时填入新 `crop`。合并时记录对比对象和结构依据，更新角色引用和适用季节；删除后检查角色覆盖。提交按整批校验并刷新审核报告，验证失败回滚。图像内容与历史依据由逐图复核确定。
