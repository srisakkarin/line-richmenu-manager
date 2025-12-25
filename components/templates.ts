// components/templates.ts

export type Template = {
  id: string;
  name: string;
  width: number;
  height: number;
  areas: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    action: { type: 'uri' | 'message' | 'postback'; uri?: string; text?: string; data?: string };
  }>;
};

export const TEMPLATES: Template[] = [
  // ใหญ่
  {
    id: 'large-1',
    name: 'ชิ้น 1',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 833, height: 562, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 833, y: 0, width: 833, height: 562, action: { type: 'uri', uri: 'https://example.com/2' } },
      { x: 1666, y: 0, width: 834, height: 562, action: { type: 'uri', uri: 'https://example.com/3' } },
      { x: 0, y: 562, width: 833, height: 562, action: { type: 'uri', uri: 'https://example.com/4' } },
      { x: 833, y: 562, width: 833, height: 562, action: { type: 'uri', uri: 'https://example.com/5' } },
      { x: 1666, y: 562, width: 834, height: 562, action: { type: 'uri', uri: 'https://example.com/6' } },
    ],
  },
  {
    id: 'large-2',
    name: 'ชิ้น 2',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 1250, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
      { x: 0, y: 843, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/3' } },
      { x: 1250, y: 843, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/4' } },
    ],
  },
  {
    id: 'large-3',
    name: 'ชิ้น 3',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 2500, height: 562, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 0, y: 562, width: 833, height: 562, action: { type: 'uri', uri: 'https://example.com/2' } },
      { x: 833, y: 562, width: 833, height: 562, action: { type: 'uri', uri: 'https://example.com/3' } },
      { x: 1666, y: 562, width: 834, height: 562, action: { type: 'uri', uri: 'https://example.com/4' } },
    ],
  },
  {
    id: 'large-4',
    name: 'ชิ้น 4',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 1666, height: 1686, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 1666, y: 0, width: 834, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
      { x: 1666, y: 843, width: 834, height: 843, action: { type: 'uri', uri: 'https://example.com/3' } },
    ],
  },
  {
    id: 'large-5',
    name: 'ชิ้น 5',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 2500, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 0, y: 843, width: 2500, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
    ],
  },
  {
    id: 'large-6',
    name: 'ชิ้น 6',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 1250, height: 1686, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 1250, y: 0, width: 1250, height: 1686, action: { type: 'uri', uri: 'https://example.com/2' } },
    ],
  },
  {
    id: 'large-7',
    name: 'ชิ้น 7',
    width: 2500,
    height: 1686,
    areas: [
      { x: 0, y: 0, width: 2500, height: 1686, action: { type: 'uri', uri: 'https://example.com/1' } },
    ],
  },

  // เล็ก
  {
    id: 'small-1',
    name: 'ชิ้น 1',
    width: 2500,
    height: 843,
    areas: [
      { x: 0, y: 0, width: 833, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 833, y: 0, width: 833, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
      { x: 1666, y: 0, width: 834, height: 843, action: { type: 'uri', uri: 'https://example.com/3' } },
    ],
  },
  {
    id: 'small-2',
    name: 'ชิ้น 2',
    width: 2500,
    height: 843,
    areas: [
      { x: 0, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 1250, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
    ],
  },
  {
    id: 'small-3',
    name: 'ชิ้น 3',
    width: 2500,
    height: 843,
    areas: [
      { x: 0, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 1250, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
    ],
  },
  {
    id: 'small-4',
    name: 'ชิ้น 4',
    width: 2500,
    height: 843,
    areas: [
      { x: 0, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
      { x: 1250, y: 0, width: 1250, height: 843, action: { type: 'uri', uri: 'https://example.com/2' } },
    ],
  },
  {
    id: 'small-5',
    name: 'ชิ้น 5',
    width: 2500,
    height: 843,
    areas: [
      { x: 0, y: 0, width: 2500, height: 843, action: { type: 'uri', uri: 'https://example.com/1' } },
    ],
  },
];