export default {
  apps: [
    {
      name: 'demo-app',            // 进程名
      script: './index.js',        // 启动文件
      cwd: __dirname,              // 工作目录（可改成你的项目路径）
      instances: 1,                // 实例数：1 = 单进程，max = CPU 核心数
      exec_mode: 'fork',           // 或 'cluster' (多进程)
      watch: false,                // 是否监听文件变化重启
      env: {
        NODE_ENV: 'development',
        PORT: 7002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7002
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z', // 日志时间格式
      error_file: './logs/error.log',       // 错误日志
      out_file: './logs/out.log',           // 普通日志
      merge_logs: true,                     // 多实例日志合并
    }
  ]
}