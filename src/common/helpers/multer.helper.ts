// NOTE(Hussein): Multer has issue non english (UTF 8) filenames
// https://github.com/expressjs/multer/issues/1104
export function filenameBuffer(originalName: string): string {
  return Buffer.from(originalName, 'latin1').toString('utf8');
}
