import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist', // 修正为根目录
    format: 'esm',
    preserveModules: true
  },
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist/types' // 现在路径在dist目录内
    })
  ]
}