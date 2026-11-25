export const models = [
  { id: 'gpt-image-2', label: 'GPT Image 2' },
  { id: 'gpt-image-2.5-flare', label: 'GPT Image 2.5 Flare' },
  { id: 'gpt-image-2.5-sunburst', label: 'GPT Image 2.5 Sunburst' },
  { id: 'gpt-image-2.6-flare', label: 'GPT Image 2.6 Flare' },
  { id: 'gpt-image-2.6-sunburst', label: 'GPT Image 2.6 Sunburst' },
];
export const ratios = ['9:16', '1:1', '2:3', '3:2', '3:4', '4:3', '16:9'] as const;
export const resolutions = ['1K', '2K', '4K'] as const;
export const qualities = { low: '标准', medium: '中等', high: '高' } as const;
export type Ratio = typeof ratios[number];
export type Resolution = typeof resolutions[number];
export type Quality = keyof typeof qualities;
export const sizes = {
  '1K': { '1:1': '1024x1024', '2:3': '768x1152', '3:2': '1152x768', '3:4': '864x1152', '4:3': '1152x864', '9:16': '864x1536', '16:9': '1536x864' },
  '2K': { '1:1': '2048x2048', '2:3': '1344x2016', '3:2': '2016x1344', '3:4': '1536x2048', '4:3': '2048x1536', '9:16': '1152x2048', '16:9': '2048x1152' },
  '4K': { '1:1': '2880x2880', '2:3': '2304x3456', '3:2': '3456x2304', '3:4': '2448x3264', '4:3': '3264x2448', '9:16': '2160x3840', '16:9': '3840x2160' },
};