# 形与衣 · 汉服人物参考图库

为古风人像摄影、造型沟通与组合生图准备的开放图库。可以单独下载一件服装、一个发型或一个动作，也可以用相同编号对照多个角度。图片由 AI 辅助创作，朝代与角色标签用于创作选材，具体形制和礼制仍需结合史料核对。

| 服装 · 绕襟日常长衣 | 发型 · 高盘髻与红簪花 | 拟拍 · 自然行走 |
| :---: | :---: | :---: |
| <img src="assets/costume/C001/front.png" width="160" alt="绕襟日常长衣正面"> | <img src="assets/head/H001-object-only/front.png" width="160" alt="高盘髻与红簪花正面"> | <img src="assets/pose/P001-common/example.jpg" width="160" alt="自然行走拟拍示例"> |

## 浏览与下载

三个公开图片索引共收录 **494 组**。打开索引，按名称或编号找到条目，再沿文件路径打开图片，点击 **Download raw file** 即可保存。程序可将索引里的路径拼到仓库的 Raw 地址后面。需要固定版本时，把地址中的分支名换成提交哈希。

| 类别 | 数量 | 索引 | 可取图片 |
| --- | ---: | --- | --- |
| 服装 | 264 | [服饰索引](data/garment-images.json) | 正面、斜侧、侧面、背面 |
| 内搭 | 20 | [服饰索引](data/garment-images.json) | 正面、斜侧、侧面、背面 |
| 发型与头饰 | 80 | [头饰索引](data/head-images.json) | 正面、斜侧、侧面、背面 |
| 姿势 | 130 | [姿势索引](data/pose-images.json) | 正面、斜侧、侧面、俯拍、仰拍，以及拟拍示例 |

服饰与头饰条目的 `views` 保存四个角度的 PNG 路径。姿势条目的 `files` 保存五个角度的 JPG，以及拟拍原图 `example-full` 和缩略图 `example`。这些索引中的原图为 900 × 1600，拟拍缩略图为 360 × 640。目录名可能带款式后缀，请直接使用索引返回的路径。

例如，同一组「自然行走」可以分别下载[正面动作](assets/pose/P001-common/front.jpg)、[俯拍动作](assets/pose/P001-common/high.jpg)和[拟拍原图](https://raw.githubusercontent.com/ban-ge/hanfu-pose/main/assets/pose/P001-common/example-full.jpg)。

## 本地图鉴

本地图鉴使用独立的[图鉴目录](data/catalog.json)，含 328 组带造型资料的条目，支持按时代、角色与视角选材，并组合参考图和提示词。需要获取全部 494 组图片时，请使用上面的三个索引。

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

项目使用 React、TypeScript、HeroUI 和 Vite。`assets/` 保存原创图片和图鉴使用的源图，`data/` 保存分发索引、图鉴资料与角色搭配，`src/` 是图鉴界面，`tools/` 保存校验与制作脚本。素材取舍、角度要求和本地研究记录的用法见[制作规范](docs/guides/dynasty-reference-workflow.md)与[批量视觉验收](docs/guides/batch-review.md)。

## 许可与署名

- **原创图片**（`assets/`）采用 [CC BY 4.0](LICENSE-images)，可商用、分享和改编。使用时请注明作者、作品来源和许可证，并标明所作修改。
- **项目代码**采用 [MIT](LICENSE)，再分发代码时请保留版权声明及许可文本。
- 图鉴中引用的第三方史料与影视资料，其权利归原权利人所有。研究用剧照仅用于本地对照。

署名示例（按实际使用情况修改）：

> 《形与衣》P001 自然行走，作者 ban-ge。[原作](https://github.com/ban-ge/hanfu-pose)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本次修改：裁切画幅。

图库首页的分类导航与下载说明参考了 [AI 姿势图库中文版](https://github.com/ban-ge/ai-pose-gallery-zh) 和 [Shisei](https://github.com/wquguru/shisei)。
