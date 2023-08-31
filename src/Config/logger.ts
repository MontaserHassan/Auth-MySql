import winston from 'winston';



const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
}


const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({timestamp, level, message, req}) => `${timestamp} ${level}: ${req ? `@Method:(${req.route.stack[0].method}) @Endpoint:(${req.route.path}) @FunctionName:(${req.route.stack[0].name}):` : ''}${req?.user ? `@UserId(${req.user.userId}):` : ''} ${message}`,
  ),
)

const transports = [

    new winston.transports.File({
        filename: 'Logs/error.log',
        level: 'error',
    }),
    new winston.transports.File({ filename: 'Logs/info.log'}),
    
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

export default Logger