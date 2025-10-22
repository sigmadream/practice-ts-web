import { Logger } from 'tslog';

// tslog 설정
const logger = new Logger({
    name: 'pokemon-api',
    minLevel: 0, // 모든 레벨의 로그 출력
    stylePrettyLogs: true,
    prettyLogTemplate: '{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}.{{ms}}\t{{logLevelName}}\t[{{name}}]\t',
    prettyErrorTemplate: '\n{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}',
    prettyErrorStackTemplate: '  {{fileName}}:{{lineNumber}}:{{columnNumber}}\t',
    prettyErrorParentNamesSeparator: ':',
    prettyErrorLoggerNameDelimiter: '\t',
    prettyLogTimeZone: 'local',
    prettyLogStyles: {
        logLevelName: {
            '*': ['bold', 'black', 'bgWhiteBright', 'dim'],
            FATAL: ['bold', 'red'],
            ERROR: ['bold', 'red'],
            WARN: ['bold', 'yellow'],
            INFO: ['bold', 'green'],
            DEBUG: ['bold', 'blue'],
            TRACE: ['bold', 'magenta'],
        },
        dateIsoStr: 'white',
        filePathWithLine: 'white',
        name: ['white', 'bold'],
        nameWithDelimiterPrefix: ['white', 'bold'],
        nameWithDelimiterSuffix: ['white', 'bold'],
        errorName: ['bold', 'bgRedBright', 'white'],
        fileName: ['yellow'],
    },
});

export default logger;
