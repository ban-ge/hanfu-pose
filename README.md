# 形与衣 · 汉服人物参考图库

**简体中文** | [English](README.en.md) | [在线预览](https://hanfu.bange.si/)

为古风人像摄影、造型沟通与组合生图准备的开放图库。可以单独下载一件服装、一个发型或一个动作，也可以用相同编号对照多个角度。图片由 AI 辅助创作，朝代与角色标签用于创作选材，具体形制和礼制仍需结合史料核对。

| 服装 · 绕襟日常长衣 | 发型 · 高盘髻与红簪花 | 拟拍 · 自然行走 |
| :---: | :---: | :---: |
| <img src="assets/costume/C001/front.png" width="160" alt="绕襟日常长衣正面"> | <img src="assets/head/H001-object-only/front.png" width="160" alt="高盘髻与红簪花正面"> | <img src="assets/pose/P001-common/example.jpg" width="160" alt="自然行走拟拍示例"> |

## 浏览与下载

三个公开图片索引共收录 **483 组、2,322 张图片**。打开索引，按名称或编号找到条目，再沿文件路径打开图片，点击 **Download raw file** 即可保存。程序可将索引里的路径拼到仓库的 Raw 地址后面。需要固定版本时，把地址中的分支名换成提交哈希。

| 类别 | 数量 | 索引 | 可取图片 |
| --- | ---: | --- | --- |
| 服装 | 253 | [服饰索引](data/garment-images.json) | 正面、斜侧、侧面、背面 |
| 内搭 | 20 | [服饰索引](data/garment-images.json) | 正面、斜侧、侧面、背面 |
| 发型与头饰 | 80 | [头饰索引](data/head-images.json) | 正面、斜侧、侧面、背面 |
| 姿势 | 130 | [姿势索引](data/pose-images.json) | 正面、斜侧、侧面、俯拍、仰拍，以及拟拍示例 |

服饰与头饰条目的 `views` 保存四个角度的 PNG 路径。姿势条目的 `files` 保存五个角度的 JPG，以及拟拍原图 `example-full` 和缩略图 `example`。这些索引中的原图为 900 × 1600，拟拍缩略图为 360 × 640。目录名可能带款式后缀，请直接使用索引返回的路径。

例如，同一组「自然行走」可以分别下载[正面动作](assets/pose/P001-common/front.jpg)、[俯拍动作](assets/pose/P001-common/high.jpg)和[拟拍原图](https://raw.githubusercontent.com/ban-ge/hanfu-pose/main/assets/pose/P001-common/example-full.jpg)。

## 本地图鉴

本地图鉴以三份公开图片索引列出全部 483 组在用素材。[造型档案](data/catalog.json)为已有条目补充详细说明。服装栏目合并 253 组外衣和 20 组内搭。维护时启动本地生图站后执行 `python3 tools/sync_library.py`，按编号核对原图视角并同步已上架素材的名称与筛选资料。


使用支持 Vite 8 的 Node.js（22.12+）及 pnpm，在仓库根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的本地地址。生产构建与校验命令如下，素材和角色校验需要 Python 3。

```sh
pnpm verify:assets
pnpm verify:coverage
pnpm typecheck
pnpm build
pnpm preview
```

项目使用 React、TypeScript、HeroUI 和 Vite。`assets/` 仅保存现行索引收录的图片，`data/` 保存分发索引、图鉴资料与角色搭配，`src/` 是图鉴界面，`tools/` 保存校验与制作脚本。素材取舍、角度要求和本地研究记录的用法见[制作规范](docs/guides/dynasty-reference-workflow.md)与[批量视觉验收](docs/guides/batch-review.md)。

## 用自己的 API 生成人物图

在图鉴里选一个姿势和一款服饰（外衣或内衣内衬），再打开「组合工作台」。发型与头部配饰共用一个可选位置。同组换选会替换原参考图。填写人物与场景，核对提示词后，在「组合生图」中配置服务。

| 配置 | OpenAI 示例 |
| --- | --- |
| BASE_URL | `https://api.openai.com/v1` |
| 模型 | `gpt-image-2`；也可选择服务商支持的 2.5 或 2.6 Flare / Sunburst |
| API_KEY | 自己的、可使用该模型的 API 密钥 |

点击「生成人物图」提交一次请求，完成后即可预览并下载。工作台通过浏览器直连所填服务，按图号将原图作为多个 `image[]` 提交到 `POST /images/edits`，按所选模型、比例、分辨率与质量提交。GPT Image 2 默认 9:16、1K（864 × 1536）。兼容服务需支持所选模型、编辑接口、输出尺寸和浏览器跨域请求。点击「保存本地配置」即可在同一浏览器、同一站点地址复用服务地址、模型与密钥。保存后可修改或清除；共享设备可直接填写并生成，跳过保存。请求按所选服务计费。

## 许可与署名

- **原创图片**（`assets/`）采用 [CC BY 4.0](LICENSE-images)，可商用、分享和改编。使用时请注明作者、作品来源和许可证，并标明所作修改。
- **项目代码**采用 [MIT](LICENSE)，再分发代码时请保留版权声明及许可文本。
- 图鉴中引用的第三方史料与影视资料，其权利归原权利人所有。研究用剧照仅用于本地对照。

署名示例（按实际使用情况修改）：

> 《形与衣》P001 自然行走，作者 ban-ge。[原作](https://github.com/ban-ge/hanfu-pose)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本次修改：裁切画幅。

图库首页的分类导航与下载说明参考了 [AI 姿势图库中文版](https://github.com/ban-ge/ai-pose-gallery-zh) 和 [Shisei](https://github.com/wquguru/shisei)。
