import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src'
  },  
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist/types' // 现在路径在dist目录内
    })
  ]
}